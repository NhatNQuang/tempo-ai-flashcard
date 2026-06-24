-- 0003_sharing_community.sql
-- Cross-user RPCs for Sharing, Community likes, and Import side-effects.
-- These run as SECURITY DEFINER because they must write rows owned by OTHER users
-- (notifications for the recipient/author, like/import counters on resources the
-- caller does not own) which RLS would otherwise block. The acting user is taken
-- from auth.uid() (the forwarded JWT), never trusted from a parameter.

-- 1. Share a resource with another user (resolved by email OR username) and notify them.
create or replace function public.rpc_share_resource(
  p_resource_id uuid,
  p_identifier text,
  p_permission text default 'viewer',
  p_with_document boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_target public.profiles%rowtype;
  v_resource public.resources%rowtype;
  v_share_id uuid;
begin
  if v_actor is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select * into v_resource from public.resources where id = p_resource_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'RESOURCE_NOT_FOUND');
  end if;
  if v_resource.owner_id <> v_actor then
    return jsonb_build_object('ok', false, 'error', 'NOT_OWNER');
  end if;

  select * into v_target from public.profiles
   where lower(email) = lower(trim(p_identifier))
      or lower(username) = lower(trim(p_identifier))
   limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'USER_NOT_FOUND');
  end if;
  if v_target.id = v_actor then
    return jsonb_build_object('ok', false, 'error', 'CANNOT_SHARE_SELF');
  end if;

  select id into v_share_id from public.resource_permissions
   where resource_id = p_resource_id and user_id = v_target.id
   limit 1;

  if v_share_id is null then
    insert into public.resource_permissions
      (resource_id, user_id, email, permission, status, share_with_document, invited_by, accepted_at)
    values
      (p_resource_id, v_target.id, v_target.email, p_permission::permission_level,
       'accepted', coalesce(p_with_document, false), v_actor, now())
    returning id into v_share_id;
  else
    update public.resource_permissions
       set permission = p_permission::permission_level,
           status = 'accepted',
           share_with_document = coalesce(p_with_document, false),
           accepted_at = now()
     where id = v_share_id;
  end if;

  update public.resources set visibility = 'shared'
   where id = p_resource_id and visibility = 'private';

  insert into public.notifications (user_id, type, title, message, metadata)
  values (
    v_target.id,
    'resource_shared',
    'New resource shared with you',
    (select coalesce(full_name, email) from public.profiles where id = v_actor)
      || ' shared "' || v_resource.title || '" with you.',
    jsonb_build_object('resource_id', p_resource_id, 'from', v_actor,
                       'with_document', coalesce(p_with_document, false))
  );

  return jsonb_build_object('ok', true, 'share_id', v_share_id,
    'target_email', v_target.email,
    'target_name', coalesce(v_target.full_name, v_target.email));
end;
$$;

-- 2. Toggle a like on a community resource and keep like_count accurate.
create or replace function public.rpc_toggle_like(p_community_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_exists boolean;
  v_count int;
begin
  if v_actor is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select exists(
    select 1 from public.community_resource_likes
     where community_resource_id = p_community_id and user_id = v_actor
  ) into v_exists;

  if v_exists then
    delete from public.community_resource_likes
     where community_resource_id = p_community_id and user_id = v_actor;
  else
    insert into public.community_resource_likes (community_resource_id, user_id)
    values (p_community_id, v_actor)
    on conflict do nothing;
  end if;

  select count(*) into v_count from public.community_resource_likes
   where community_resource_id = p_community_id;
  update public.community_resources set like_count = v_count where id = p_community_id;

  return jsonb_build_object('ok', true, 'liked', not v_exists, 'like_count', v_count);
end;
$$;

-- 3. After an import completes, bump import_count and notify the publisher.
create or replace function public.rpc_after_import(p_community_id uuid, p_imported_title text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_pub public.community_resources%rowtype;
  v_count int;
begin
  select * into v_pub from public.community_resources where id = p_community_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  update public.community_resources
     set import_count = import_count + 1
   where id = p_community_id
  returning import_count into v_count;

  if v_actor is not null and v_pub.publisher_id <> v_actor then
    insert into public.notifications (user_id, type, title, message, metadata)
    values (
      v_pub.publisher_id,
      'resource_imported',
      'Your resource was imported',
      (select coalesce(full_name, email) from public.profiles where id = v_actor)
        || ' imported your '
        || (case when v_pub.resource_type = 'flashcard_set' then 'flashcard set' else 'notes' end)
        || ': "' || coalesce(p_imported_title, v_pub.title) || '".',
      jsonb_build_object('community_resource_id', p_community_id, 'by', v_actor)
    );
  end if;

  return jsonb_build_object('ok', true, 'import_count', v_count);
end;
$$;

grant execute on function public.rpc_share_resource(uuid, text, text, boolean) to authenticated;
grant execute on function public.rpc_toggle_like(uuid) to authenticated;
grant execute on function public.rpc_after_import(uuid, text) to authenticated;
