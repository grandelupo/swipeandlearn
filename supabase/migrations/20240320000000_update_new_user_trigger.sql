-- Grant necessary permissions to auth role
grant usage on schema public to auth;
grant all on public.profiles to auth;
grant usage, select on all sequences in schema public to auth;

-- Drop the existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create updated function to handle new user creation
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