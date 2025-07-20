-- Revert any changes made to the guest profile trigger
-- This migration ensures the trigger is in its original state

-- Drop the existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recreate the original function (from 20240320000000_update_new_user_trigger.sql)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    preferred_translation_language,
    updated_at
  )
  values (
    new.id,
    'English', -- Default translation language
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user(); 