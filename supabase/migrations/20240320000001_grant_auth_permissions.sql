-- Grant necessary permissions to auth role
grant usage on schema public to authenticated;
grant all on public.profiles to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Update the function to use security definer
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