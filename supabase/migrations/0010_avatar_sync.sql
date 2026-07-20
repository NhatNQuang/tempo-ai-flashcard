-- 0010: Sync Google OAuth avatar into profiles.
-- Bug: handle_new_user() never copied avatar_url from raw_user_meta_data,
-- so Google sign-ins had profiles.avatar_url = NULL and the app showed
-- initials instead of the Google profile photo.

-- 1) New users: include avatar_url (Google provides 'avatar_url' and/or 'picture')
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, avatar_url, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(md5(random()::text), 1, 8)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'student',
    'active'
  );

  insert into public.user_settings (user_id, theme, language)
  values (new.id, 'system', 'en');

  return new;
end;
$$ language plpgsql security definer;

-- 2) Backfill: existing users who signed in with Google but have no avatar yet
update public.profiles p
set avatar_url = coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
from auth.users u
where u.id = p.id
  and (p.avatar_url is null or p.avatar_url = '')
  and coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture') is not null;
