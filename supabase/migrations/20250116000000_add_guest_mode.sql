-- Add is_guest field to profiles table
alter table public.profiles add column is_guest boolean default false;

-- Update the handle_new_user function to give guest users 50 coins initially
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    preferred_translation_language,
    updated_at,
    is_guest,
    coins
  )
  values (
    new.id,
    'English', -- Default translation language
    now(),
    case when new.email like 'guest-%@guest.swipeandlearn' then true else false end,
    case when new.email like 'guest-%@guest.swipeandlearn' then 50 else 100 end -- Guests get 50, regular users get 100
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create function to convert guest to registered user
create or replace function public.convert_guest_to_registered(
  user_id uuid,
  new_email text
)
returns void as $$
begin
  -- Update the profile to mark as non-guest and add 50 bonus coins
  update public.profiles 
  set 
    is_guest = false,
    coins = coins + 50,
    updated_at = now()
  where id = user_id and is_guest = true;
  
  -- Update the auth user email (this would typically be done through Supabase Auth API)
  -- The actual email update will be handled in the application code
end;
$$ language plpgsql security definer;

-- Grant execute permission on the new function
grant execute on function public.convert_guest_to_registered(uuid, text) to authenticated; 