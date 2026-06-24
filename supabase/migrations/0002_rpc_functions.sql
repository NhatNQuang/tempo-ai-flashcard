-- 0002_rpc_functions.sql

-- 1. Match document chunks using pgvector cosine similarity
create or replace function public.match_document_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_document_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float,
  page_start int,
  page_end int
)
language sql stable security definer
as $$
  select
    dc.id,
    dc.content,
    (1 - (dc.embedding <=> query_embedding))::float as similarity,
    dc.page_start,
    dc.page_end
  from public.document_chunks dc
  where dc.document_id = filter_document_id
    and (1 - (dc.embedding <=> query_embedding)) > match_threshold
  order by dc.embedding <=> query_embedding asc
  limit match_count;
$$;

-- 2. Create document, vector index, and bulk insert chunks
create or replace function public.rpc_create_document_and_chunks(
  p_owner_id uuid,
  p_title text,
  p_filename text,
  p_mime_type text,
  p_size bigint,
  p_bucket text,
  p_path text,
  p_chunks jsonb
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_doc_id uuid;
  v_vector_idx_id uuid;
  v_chunk_count int;
  v_chunk jsonb;
begin
  -- 1. Insert document
  insert into public.documents (
    owner_id, title, original_filename, mime_type, file_size_bytes, storage_bucket, storage_path, processing_status
  ) values (
    p_owner_id, p_title, p_filename, p_mime_type, p_size, p_bucket, p_path, 'embedding'
  ) returning id into v_doc_id;

  -- 2. Insert vector index
  v_chunk_count := jsonb_array_length(p_chunks);
  insert into public.vector_indexes (
    document_id, owner_id, embedding_provider, embedding_model, dimension, chunk_count, status
  ) values (
    v_doc_id, p_owner_id, 'gemini', 'gemini-embedding', 768, v_chunk_count, 'ready'
  ) returning id into v_vector_idx_id;

  -- 3. Update document
  update public.documents
  set vector_index_id = v_vector_idx_id, processing_status = 'ready_for_selection'
  where id = v_doc_id;

  -- 4. Insert chunks
  for i in 0 .. v_chunk_count - 1 loop
    v_chunk := p_chunks->i;
    insert into public.document_chunks (
      vector_index_id, document_id, chunk_index, content, embedding
    ) values (
      v_vector_idx_id,
      v_doc_id,
      (v_chunk->>'chunk_index')::int,
      v_chunk->>'content',
      (v_chunk->>'embedding')::vector
    );
  end loop;

  return jsonb_build_object(
    'document_id', v_doc_id,
    'vector_index_id', v_vector_idx_id,
    'chunk_count', v_chunk_count
  );
end;
$$;

-- 3. Save generated flashcards, sets, options
create or replace function public.rpc_save_flashcards(
  p_owner_id uuid,
  p_doc_id uuid,
  p_title text,
  p_difficulty text,
  p_content_type text,
  p_cards jsonb
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_res_id uuid;
  v_set_id uuid;
  v_doc_vector_index_id uuid;
  v_card_count int;
  v_card jsonb;
  v_card_id uuid;
  v_option text;
  v_option_idx int;
  v_is_correct boolean;
begin
  -- Get vector index id from document
  select vector_index_id into v_doc_vector_index_id
  from public.documents
  where id = p_doc_id;

  -- 1. Insert resource
  insert into public.resources (
    owner_id, document_id, vector_index_id, type, title, visibility, created_from
  ) values (
    p_owner_id, p_doc_id, v_doc_vector_index_id, 'flashcard_set', p_title, 'private', 'uploaded_document'
  ) returning id into v_res_id;

  -- 2. Insert flashcard set
  v_card_count := jsonb_array_length(p_cards);
  insert into public.flashcard_sets (
    resource_id, card_count, difficulty, content_type
  ) values (
    v_res_id, v_card_count, p_difficulty::difficulty_level, p_content_type::flashcard_content_type
  ) returning id into v_set_id;

  -- 3. Insert cards & options
  for i in 0 .. v_card_count - 1 loop
    v_card := p_cards->i;
    
    insert into public.flashcards (
      set_id, question, answer, explanation, content_type, difficulty, order_index, created_by_ai
    ) values (
      v_set_id,
      v_card->>'question',
      v_card->>'answer',
      coalesce(v_card->>'explanation', ''),
      p_content_type::flashcard_content_type,
      p_difficulty::difficulty_level,
      i,
      true
    ) returning id into v_card_id;

    -- Options are an array of strings in v_card->'options'
    for o in 0 .. jsonb_array_length(v_card->'options') - 1 loop
      v_option := v_card->'options'->>o;
      v_is_correct := (case when v_card->>'correctOption' = chr(65 + o) then true else false end);

      insert into public.flashcard_options (
        flashcard_id, option_text, is_correct, order_index
      ) values (
        v_card_id,
        v_option,
        v_is_correct,
        o
      );
    end loop;
  end loop;

  return jsonb_build_object(
    'resource_id', v_res_id,
    'set_id', v_set_id,
    'card_count', v_card_count
  );
end;
$$;

-- 4. Save generated Cornell notes & note blocks
create or replace function public.rpc_save_notes(
  p_owner_id uuid,
  p_doc_id uuid,
  p_title text,
  p_detail text,
  p_summary text,
  p_cues text[],
  p_notes text[]
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_res_id uuid;
  v_note_id uuid;
  v_doc_vector_index_id uuid;
  v_order_index int := 0;
begin
  -- Get vector index id from document
  select vector_index_id into v_doc_vector_index_id
  from public.documents
  where id = p_doc_id;

  -- 1. Insert resource
  insert into public.resources (
    owner_id, document_id, vector_index_id, type, title, visibility, created_from
  ) values (
    p_owner_id, p_doc_id, v_doc_vector_index_id, 'cornell_note', p_title, 'private', 'uploaded_document'
  ) returning id into v_res_id;

  -- 2. Insert note
  insert into public.notes (
    resource_id, summary
  ) values (
    v_res_id, p_summary
  ) returning id into v_note_id;

  -- 3. Insert cues as note blocks
  if array_length(p_cues, 1) is not null then
    for i in 1 .. array_length(p_cues, 1) loop
      insert into public.note_blocks (
        note_id, block_type, content, order_index
      ) values (
        v_note_id, 'cue', p_cues[i], v_order_index
      );
      v_order_index := v_order_index + 1;
    end loop;
  end if;

  -- 4. Insert notes as note blocks
  if array_length(p_notes, 1) is not null then
    for i in 1 .. array_length(p_notes, 1) loop
      insert into public.note_blocks (
        note_id, block_type, content, order_index
      ) values (
        v_note_id, 'main_note', p_notes[i], v_order_index
      );
      v_order_index := v_order_index + 1;
    end loop;
  end if;

  -- 5. Insert summary as note block
  if p_summary is not null and p_summary != '' then
    insert into public.note_blocks (
      note_id, block_type, content, order_index
    ) values (
      v_note_id, 'summary', p_summary, v_order_index
    );
  end if;

  return jsonb_build_object(
    'resource_id', v_res_id,
    'note_id', v_note_id
  );
end;
$$;
