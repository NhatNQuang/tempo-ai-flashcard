-- 0001_initial_schema.sql

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- Create Enum Types
create type user_role as enum ('student', 'teacher', 'admin');
create type user_status as enum ('active', 'banned', 'deleted');

create type document_source_type as enum ('upload', 'community_import', 'duplicate');
create type document_processing_status as enum (
  'upload_session_created',
  'uploaded',
  'queued',
  'extracting',
  'chunking',
  'embedding',
  'ready_for_selection',
  'failed',
  'deleted'
);

create type artifact_type as enum (
  'extracted_text',
  'cleaned_text',
  'section_outline',
  'thumbnail',
  'ocr_result'
);

create type vector_index_status as enum ('building', 'ready', 'failed', 'deleted');

create type resource_type as enum ('flashcard_set', 'cornell_note');
create type resource_visibility as enum ('private', 'shared', 'public');
create type resource_created_from as enum ('uploaded_document', 'manual', 'community_import', 'duplicate');

create type difficulty_level as enum ('easy', 'medium', 'hard', 'mixed');
create type flashcard_content_type as enum ('multiple_choice', 'true_false', 'short_answer', 'mixed');
create type flashcard_progress_status as enum ('new', 'learning', 'known', 'unknown', 'mastered');

create type note_block_type as enum ('cue', 'main_note', 'summary', 'keyword', 'question', 'example', 'formula');

create type public_document_access_policy as enum ('with_document', 'resource_only');
create type community_resource_status as enum ('published', 'unpublished', 'hidden', 'removed');
create type import_clone_strategy as enum ('copy_content_reuse_vector', 'copy_content_no_vector', 'reference_only');

create type permission_level as enum ('viewer', 'editor', 'owner');
create type share_status as enum ('pending', 'accepted', 'revoked');

create type assistant_role as enum ('user', 'assistant', 'system');

create type job_type as enum (
  'document_processing',
  'embedding',
  'flashcard_generation',
  'note_generation',
  'export'
);
create type job_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled');

-- Create Tables

-- 1. profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  role user_role not null default 'student',
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. user_settings
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  theme text not null default 'system',
  language text not null default 'en',
  daily_goal_cards int not null default 20,
  email_notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  original_filename text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  storage_bucket text not null,
  storage_path text not null,
  source_type document_source_type not null default 'upload',
  processing_status document_processing_status not null default 'upload_session_created',
  extraction_status text,
  embedding_status text,
  vector_index_id uuid, -- Will be foreign key references vector_indexes(id)
  page_count int,
  word_count int,
  language text,
  checksum text,
  raw_file_retention_until timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. document_sections
create table if not exists public.document_sections (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  parent_section_id uuid references public.document_sections(id) on delete cascade,
  title text not null,
  summary text,
  order_index int not null,
  page_start int,
  page_end int,
  token_count int,
  created_at timestamptz not null default now()
);

-- 5. document_processing_artifacts
create table if not exists public.document_processing_artifacts (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  artifact_type artifact_type not null,
  storage_bucket text not null,
  storage_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 6. vector_indexes
create table if not exists public.vector_indexes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  embedding_provider text not null,
  embedding_model text not null,
  dimension int not null,
  chunk_count int not null default 0,
  status vector_index_status not null default 'building',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add foreign key constraint to documents for vector_index_id
alter table public.documents
  add constraint documents_vector_index_id_fkey
  foreign key (vector_index_id) references public.vector_indexes(id) on delete set null;

-- 7. document_chunks
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  vector_index_id uuid not null references public.vector_indexes(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  section_id uuid references public.document_sections(id) on delete set null,
  chunk_index int not null,
  content text not null,
  content_hash text,
  page_start int,
  page_end int,
  token_count int,
  embedding vector(768),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 8. resources
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  vector_index_id uuid references public.vector_indexes(id) on delete set null,
  type resource_type not null,
  title text not null,
  description text,
  thumbnail_url text,
  visibility resource_visibility not null default 'private',
  favorite boolean not null default false,
  archived boolean not null default false,
  deleted_at timestamptz,
  source_resource_id uuid, -- Self reference, added constraint later
  created_from resource_created_from not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add self reference key to resources
alter table public.resources
  add constraint resources_source_resource_id_fkey
  foreign key (source_resource_id) references public.resources(id) on delete set null;

-- 9. collections
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. collection_resources
create table if not exists public.collection_resources (
  collection_id uuid not null references public.collections(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, resource_id)
);

-- 11. flashcard_sets
create table if not exists public.flashcard_sets (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null unique references public.resources(id) on delete cascade,
  card_count int not null default 0,
  difficulty difficulty_level not null default 'mixed',
  content_type flashcard_content_type not null default 'mixed',
  generation_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. flashcards
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.flashcard_sets(id) on delete cascade,
  question text not null,
  answer text not null,
  explanation text,
  content_type flashcard_content_type not null,
  difficulty difficulty_level not null,
  source_chunk_id uuid references public.document_chunks(id) on delete set null,
  source_section_id uuid references public.document_sections(id) on delete set null,
  order_index int not null,
  created_by_ai boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. flashcard_options
create table if not exists public.flashcard_options (
  id uuid primary key default gen_random_uuid(),
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index int not null
);

-- 14. flashcard_study_progress
create table if not exists public.flashcard_study_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  status flashcard_progress_status not null default 'new',
  correct_count int not null default 0,
  wrong_count int not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, flashcard_id)
);

-- 15. flashcard_study_sessions
create table if not exists public.flashcard_study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  set_id uuid not null references public.flashcard_sets(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  cards_studied int not null default 0,
  correct_count int not null default 0,
  wrong_count int not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

-- 16. notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null unique references public.resources(id) on delete cascade,
  summary text,
  generation_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 17. note_blocks
create table if not exists public.note_blocks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  block_type note_block_type not null,
  title text,
  content text not null,
  source_chunk_id uuid references public.document_chunks(id) on delete set null,
  source_section_id uuid references public.document_sections(id) on delete set null,
  order_index int not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 18. community_resources
create table if not exists public.community_resources (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  publisher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  resource_type resource_type not null,
  subject text,
  tags text[] not null default '{}'::text[],
  document_access_policy public_document_access_policy not null default 'with_document',
  import_count int not null default 0,
  like_count int not null default 0,
  view_count int not null default 0,
  status community_resource_status not null default 'published',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 19. community_resource_likes
create table if not exists public.community_resource_likes (
  community_resource_id uuid not null references public.community_resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (community_resource_id, user_id)
);

-- 20. resource_imports
create table if not exists public.resource_imports (
  id uuid primary key default gen_random_uuid(),
  importer_id uuid not null references public.profiles(id) on delete cascade,
  source_resource_id uuid not null references public.resources(id) on delete cascade,
  imported_resource_id uuid not null references public.resources(id) on delete cascade,
  community_resource_id uuid not null references public.community_resources(id) on delete cascade,
  clone_strategy import_clone_strategy not null default 'copy_content_reuse_vector',
  created_at timestamptz not null default now()
);

-- 21. resource_permissions
create table if not exists public.resource_permissions (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  email text,
  permission permission_level not null default 'viewer',
  status share_status not null default 'pending',
  share_with_document boolean not null default false,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

-- 22. assistant_sessions
create table if not exists public.assistant_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  vector_index_id uuid references public.vector_indexes(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 23. assistant_messages
create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assistant_sessions(id) on delete cascade,
  role assistant_role not null,
  content text not null,
  model_provider text default 'gemini',
  model_name text,
  token_usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 24. assistant_message_citations
create table if not exists public.assistant_message_citations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.assistant_messages(id) on delete cascade,
  chunk_id uuid not null references public.document_chunks(id) on delete cascade,
  section_id uuid references public.document_sections(id) on delete set null,
  page_start int,
  page_end int,
  score double precision not null,
  quoted_text text
);

-- 25. jobs
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_type job_type not null,
  status job_status not null default 'queued',
  progress int not null default 0,
  current_step text,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

-- 26. job_events
create table if not exists public.job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  step text not null,
  status text not null,
  message text,
  progress int not null default 0,
  created_at timestamptz not null default now()
);

-- 27. notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- 28. activity_events
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid references public.resources(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Create Indexes
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_documents_owner_status on public.documents(owner_id, processing_status);
create index if not exists idx_documents_checksum on public.documents(checksum);
create index if not exists idx_documents_vector_index_id on public.documents(vector_index_id);
create index if not exists idx_document_sections_document on public.document_sections(document_id, order_index);
create index if not exists idx_artifacts_document_type on public.document_processing_artifacts(document_id, artifact_type);
create index if not exists idx_vector_indexes_document on public.vector_indexes(document_id);
create index if not exists idx_vector_indexes_owner_status on public.vector_indexes(owner_id, status);
create index if not exists idx_document_chunks_vector_index on public.document_chunks(vector_index_id, chunk_index);
create index if not exists idx_document_chunks_document on public.document_chunks(document_id);
create index if not exists idx_document_chunks_section on public.document_chunks(section_id);

-- HNSW pgvector index (Cosine distance search)
create index if not exists idx_document_chunks_embedding_hnsw
  on public.document_chunks
  using hnsw (embedding vector_cosine_ops);

create index if not exists idx_resources_owner_type on public.resources(owner_id, type);
create index if not exists idx_resources_owner_updated on public.resources(owner_id, updated_at desc);
create index if not exists idx_resources_visibility on public.resources(visibility);
create index if not exists idx_resources_vector_index on public.resources(vector_index_id);
create index if not exists idx_resources_document on public.resources(document_id);
create index if not exists idx_collections_owner on public.collections(owner_id);
create index if not exists idx_flashcard_sets_resource on public.flashcard_sets(resource_id);
create index if not exists idx_flashcards_set_order on public.flashcards(set_id, order_index);
create index if not exists idx_flashcards_source_chunk on public.flashcards(source_chunk_id);
create index if not exists idx_flashcard_options_card on public.flashcard_options(flashcard_id, order_index);
create index if not exists idx_study_progress_user_resource on public.flashcard_study_progress(user_id, resource_id);
create index if not exists idx_study_progress_next_review on public.flashcard_study_progress(user_id, next_review_at);
create index if not exists idx_note_blocks_note_order on public.note_blocks(note_id, order_index);
create index if not exists idx_note_blocks_source_chunk on public.note_blocks(source_chunk_id);
create index if not exists idx_community_resources_status_type on public.community_resources(status, resource_type);
create index if not exists idx_community_resources_published on public.community_resources(published_at desc);
create index if not exists idx_community_resources_tags on public.community_resources using gin(tags);
create index if not exists idx_resource_imports_importer on public.resource_imports(importer_id);
create index if not exists idx_resource_imports_community on public.resource_imports(community_resource_id);
create index if not exists idx_resource_permissions_resource on public.resource_permissions(resource_id);
create index if not exists idx_resource_permissions_user on public.resource_permissions(user_id);
create index if not exists idx_resource_permissions_email on public.resource_permissions(email);
create index if not exists idx_assistant_sessions_user on public.assistant_sessions(user_id, updated_at desc);
create index if not exists idx_assistant_sessions_resource on public.assistant_sessions(resource_id);
create index if not exists idx_assistant_messages_session on public.assistant_messages(session_id, created_at);
create index if not exists idx_citations_message on public.assistant_message_citations(message_id);
create index if not exists idx_citations_chunk on public.assistant_message_citations(chunk_id);
create index if not exists idx_jobs_user_status on public.jobs(user_id, status);
create index if not exists idx_jobs_type_status on public.jobs(job_type, status);
create index if not exists idx_jobs_created_at on public.jobs(created_at desc);
create index if not exists idx_job_events_job_created on public.job_events(job_id, created_at);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read_at, created_at desc);
create index if not exists idx_activity_events_user_created on public.activity_events(user_id, created_at desc);
create index if not exists idx_activity_events_resource on public.activity_events(resource_id);

-- Create Triggers & Functions for auto-updating updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_updated before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger tr_user_settings_updated before update on public.user_settings for each row execute function public.update_updated_at_column();
create trigger tr_documents_updated before update on public.documents for each row execute function public.update_updated_at_column();
create trigger tr_vector_indexes_updated before update on public.vector_indexes for each row execute function public.update_updated_at_column();
create trigger tr_resources_updated before update on public.resources for each row execute function public.update_updated_at_column();
create trigger tr_collections_updated before update on public.collections for each row execute function public.update_updated_at_column();
create trigger tr_flashcard_sets_updated before update on public.flashcard_sets for each row execute function public.update_updated_at_column();
create trigger tr_flashcards_updated before update on public.flashcards for each row execute function public.update_updated_at_column();
create trigger tr_flashcard_study_progress_updated before update on public.flashcard_study_progress for each row execute function public.update_updated_at_column();
create trigger tr_notes_updated before update on public.notes for each row execute function public.update_updated_at_column();
create trigger tr_note_blocks_updated before update on public.note_blocks for each row execute function public.update_updated_at_column();
create trigger tr_community_resources_updated before update on public.community_resources for each row execute function public.update_updated_at_column();
create trigger tr_assistant_sessions_updated before update on public.assistant_sessions for each row execute function public.update_updated_at_column();

-- Create Trigger to sync auth.users with public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(md5(random()::text), 1, 8)),
    'student',
    'active'
  );
  
  insert into public.user_settings (user_id, theme, language)
  values (new.id, 'system', 'en');
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create RLS Permission Helper Functions
create or replace function public.can_read_resource(u_id uuid, r_id uuid)
returns boolean as $$
declare
  is_owner boolean;
  is_shared boolean;
  is_public boolean;
begin
  select exists (
    select 1 from public.resources
    where id = r_id and owner_id = u_id
  ) into is_owner;
  
  if is_owner then
    return true;
  end if;

  select exists (
    select 1 from public.resource_permissions
    where resource_id = r_id 
      and (user_id = u_id or email = (select email from public.profiles where id = u_id))
      and status = 'accepted'
  ) into is_shared;

  if is_shared then
    return true;
  end if;

  select exists (
    select 1 from public.community_resources
    where resource_id = r_id and status = 'published'
  ) into is_public;

  return is_public;
end;
$$ language plpgsql security definer;

create or replace function public.can_edit_resource(u_id uuid, r_id uuid)
returns boolean as $$
declare
  is_owner boolean;
  is_editor boolean;
begin
  select exists (
    select 1 from public.resources
    where id = r_id and owner_id = u_id
  ) into is_owner;
  
  if is_owner then
    return true;
  end if;

  select exists (
    select 1 from public.resource_permissions
    where resource_id = r_id 
      and (user_id = u_id or email = (select email from public.profiles where id = u_id))
      and status = 'accepted'
      and permission in ('editor', 'owner')
  ) into is_editor;

  return is_editor;
end;
$$ language plpgsql security definer;

create or replace function public.can_access_vector_index(u_id uuid, v_idx_id uuid)
returns boolean as $$
declare
  is_doc_owner boolean;
  is_shared_with_doc boolean;
  is_public_with_doc boolean;
  is_imported_with_doc boolean;
begin
  select exists (
    select 1 from public.vector_indexes vi
    join public.documents d on vi.document_id = d.id
    where vi.id = v_idx_id and d.owner_id = u_id
  ) into is_doc_owner;

  if is_doc_owner then
    return true;
  end if;

  select exists (
    select 1 from public.resource_permissions rp
    join public.resources r on rp.resource_id = r.id
    where r.vector_index_id = v_idx_id
      and (rp.user_id = u_id or rp.email = (select email from public.profiles where id = u_id))
      and rp.status = 'accepted'
      and rp.share_with_document = true
  ) into is_shared_with_doc;

  if is_shared_with_doc then
    return true;
  end if;

  select exists (
    select 1 from public.community_resources cr
    join public.resources r on cr.resource_id = r.id
    where r.vector_index_id = v_idx_id
      and cr.status = 'published'
      and cr.document_access_policy = 'with_document'
  ) into is_public_with_doc;

  if is_public_with_doc then
    return true;
  end if;

  select exists (
    select 1 from public.resource_imports ri
    join public.resources r on ri.imported_resource_id = r.id
    where r.vector_index_id = v_idx_id
      and ri.importer_id = u_id
      and ri.clone_strategy = 'copy_content_reuse_vector'
  ) into is_imported_with_doc;

  return is_imported_with_doc;
end;
$$ language plpgsql security definer;

-- Enable Row Level Security (RLS) on all public tables
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.documents enable row level security;
alter table public.document_sections enable row level security;
alter table public.document_processing_artifacts enable row level security;
alter table public.vector_indexes enable row level security;
alter table public.document_chunks enable row level security;
alter table public.resources enable row level security;
alter table public.collections enable row level security;
alter table public.collection_resources enable row level security;
alter table public.flashcard_sets enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_options enable row level security;
alter table public.flashcard_study_progress enable row level security;
alter table public.flashcard_study_sessions enable row level security;
alter table public.notes enable row level security;
alter table public.note_blocks enable row level security;
alter table public.community_resources enable row level security;
alter table public.community_resource_likes enable row level security;
alter table public.resource_imports enable row level security;
alter table public.resource_permissions enable row level security;
alter table public.assistant_sessions enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.assistant_message_citations enable row level security;
alter table public.jobs enable row level security;
alter table public.job_events enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_events enable row level security;

-- Basic Owner RLS Policies
create policy "Users can read profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own settings" on public.user_settings for all using (auth.uid() = user_id);

create policy "Users can manage own documents" on public.documents for all using (auth.uid() = owner_id);

create policy "Users can view sections of accessible documents" on public.document_sections for select
  using (exists (select 1 from public.documents where id = document_id and owner_id = auth.uid()));

create policy "Users can manage sections of own documents" on public.document_sections for all
  using (exists (select 1 from public.documents where id = document_id and owner_id = auth.uid()));

create policy "Users can manage own document artifacts" on public.document_processing_artifacts for all
  using (exists (select 1 from public.documents where id = document_id and owner_id = auth.uid()));

create policy "Users can manage own vector indexes" on public.vector_indexes for all using (auth.uid() = owner_id);

create policy "Users can read chunks they have vector access to" on public.document_chunks for select
  using (public.can_access_vector_index(auth.uid(), vector_index_id));

create policy "Users can manage own chunks" on public.document_chunks for all
  using (exists (select 1 from public.vector_indexes where id = vector_index_id and owner_id = auth.uid()));

create policy "Users can read accessible resources" on public.resources for select
  using (public.can_read_resource(auth.uid(), id));

create policy "Users can write owned or editable resources" on public.resources for all
  using (auth.uid() = owner_id or public.can_edit_resource(auth.uid(), id));

create policy "Users can manage own collections" on public.collections for all using (auth.uid() = owner_id);

create policy "Users can manage own collection resources" on public.collection_resources for all
  using (exists (select 1 from public.collections where id = collection_id and owner_id = auth.uid()));

create policy "Users can view accessible flashcard sets" on public.flashcard_sets for select
  using (public.can_read_resource(auth.uid(), resource_id));

create policy "Users can manage owned/editable flashcard sets" on public.flashcard_sets for all
  using (exists (select 1 from public.resources where id = resource_id and (owner_id = auth.uid() or public.can_edit_resource(auth.uid(), id))));

create policy "Users can view accessible flashcards" on public.flashcards for select
  using (exists (select 1 from public.flashcard_sets fs where fs.id = set_id and public.can_read_resource(auth.uid(), fs.resource_id)));

create policy "Users can manage owned/editable flashcards" on public.flashcards for all
  using (exists (select 1 from public.flashcard_sets fs join public.resources r on fs.resource_id = r.id where fs.id = set_id and (r.owner_id = auth.uid() or public.can_edit_resource(auth.uid(), r.id))));

create policy "Users can view accessible flashcard options" on public.flashcard_options for select
  using (exists (select 1 from public.flashcards f join public.flashcard_sets fs on f.set_id = fs.id where f.id = flashcard_id and public.can_read_resource(auth.uid(), fs.resource_id)));

create policy "Users can manage owned/editable flashcard options" on public.flashcard_options for all
  using (exists (select 1 from public.flashcards f join public.flashcard_sets fs on f.set_id = fs.id join public.resources r on fs.resource_id = r.id where f.id = flashcard_id and (r.owner_id = auth.uid() or public.can_edit_resource(auth.uid(), r.id))));

create policy "Users can manage own study progress" on public.flashcard_study_progress for all
  using (auth.uid() = user_id);

create policy "Users can manage own study sessions" on public.flashcard_study_sessions for all
  using (auth.uid() = user_id);

create policy "Users can view accessible notes" on public.notes for select
  using (public.can_read_resource(auth.uid(), resource_id));

create policy "Users can manage owned/editable notes" on public.notes for all
  using (exists (select 1 from public.resources where id = resource_id and (owner_id = auth.uid() or public.can_edit_resource(auth.uid(), id))));

create policy "Users can view accessible note blocks" on public.note_blocks for select
  using (exists (select 1 from public.notes n where n.id = note_id and public.can_read_resource(auth.uid(), n.resource_id)));

create policy "Users can manage owned/editable note blocks" on public.note_blocks for all
  using (exists (select 1 from public.notes n join public.resources r on n.resource_id = r.id where n.id = note_id and (r.owner_id = auth.uid() or public.can_edit_resource(auth.uid(), r.id))));

create policy "Anyone can view published community resources" on public.community_resources for select
  using (status = 'published');

create policy "Users can manage own community resources" on public.community_resources for all
  using (publisher_id = auth.uid());

create policy "Users can view community resource likes" on public.community_resource_likes for select using (true);
create policy "Users can manage own likes" on public.community_resource_likes for all using (user_id = auth.uid());

create policy "Users can view own imports" on public.resource_imports for select using (importer_id = auth.uid());
create policy "Users can create own imports" on public.resource_imports for insert with check (importer_id = auth.uid());

create policy "Users can view permissions for shared resources" on public.resource_permissions for select
  using (invited_by = auth.uid() or user_id = auth.uid() or email = (select email from public.profiles where id = auth.uid()));

create policy "Users can manage permissions for owned resources" on public.resource_permissions for all
  using (invited_by = auth.uid());

create policy "Users can view own assistant sessions" on public.assistant_sessions for select using (user_id = auth.uid());
create policy "Users can manage own assistant sessions" on public.assistant_sessions for all using (user_id = auth.uid());

create policy "Users can view own assistant messages" on public.assistant_messages for select
  using (exists (select 1 from public.assistant_sessions where id = session_id and user_id = auth.uid()));

create policy "Users can create own assistant messages" on public.assistant_messages for insert
  with check (exists (select 1 from public.assistant_sessions where id = session_id and user_id = auth.uid()));

create policy "Users can view own message citations" on public.assistant_message_citations for select
  using (exists (select 1 from public.assistant_messages m join public.assistant_sessions s on m.session_id = s.id where m.id = message_id and s.user_id = auth.uid()));

create policy "Users can manage own jobs" on public.jobs for all using (user_id = auth.uid());

create policy "Users can view own job events" on public.job_events for select
  using (exists (select 1 from public.jobs where id = job_id and user_id = auth.uid()));

create policy "Users can manage own notifications" on public.notifications for all using (user_id = auth.uid());

create policy "Users can view own activity events" on public.activity_events for select using (user_id = auth.uid());
create policy "Users can create own activity events" on public.activity_events for insert with check (user_id = auth.uid());

-- Initial storage buckets insertion helper (to be executed via SQL script or client code)
-- Supabase Storage operates under storage.buckets and storage.objects tables
insert into storage.buckets (id, name, public) values 
  ('documents-raw-temp', 'documents-raw-temp', false),
  ('document-artifacts', 'document-artifacts', false),
  ('resource-exports', 'resource-exports', false),
  ('avatars', 'avatars', false),
  ('community-thumbnails', 'community-thumbnails', true)
on conflict (id) do nothing;
