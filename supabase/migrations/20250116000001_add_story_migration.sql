-- Enhanced function to convert guest to registered user with complete data migration
create or replace function public.convert_guest_to_registered_with_migration(
  guest_user_id uuid,
  new_user_id uuid,
  new_email text
)
returns json as $$
declare
  migration_stats json;
  stories_migrated integer := 0;
  translations_migrated integer := 0;
  feedback_migrated integer := 0;
  ad_watches_migrated integer := 0;
  guest_profile record;
  new_profile record;
begin
  -- Check if guest user exists and is actually a guest
  select * into guest_profile from public.profiles where id = guest_user_id and is_guest = true;
  if not found then
    raise exception 'Guest user not found or is not a guest account';
  end if;

  -- Check if new user exists
  select * into new_profile from public.profiles where id = new_user_id;
  if not found then
    raise exception 'New user profile not found';
  end if;

  -- Start the migration transaction
  
  -- 1. Migrate stories (this will cascade to story_pages, story_outlines, audio_recordings)
  update public.stories 
  set user_id = new_user_id 
  where user_id = guest_user_id;
  
  get diagnostics stories_migrated = row_count;

  -- 2. Migrate user-specific translations (not story-specific ones)
  update public.translations 
  set user_id = new_user_id 
  where user_id = guest_user_id;
  
  get diagnostics translations_migrated = row_count;

  -- 3. Migrate feedback
  update public.feedback 
  set user_id = new_user_id 
  where user_id = guest_user_id;
  
  get diagnostics feedback_migrated = row_count;

  -- 4. Migrate ad watches
  update public.ad_watches 
  set user_id = new_user_id 
  where user_id = guest_user_id;
  
  get diagnostics ad_watches_migrated = row_count;

  -- 5. Transfer guest profile data to new profile
  update public.profiles 
  set 
    preferred_translation_language = coalesce(guest_profile.preferred_translation_language, preferred_translation_language),
    preferred_voice_id = coalesce(guest_profile.preferred_voice_id, preferred_voice_id),
    preferred_model = coalesce(guest_profile.preferred_model, preferred_model),
    coins = coins + guest_profile.coins + 50, -- Add guest coins + 50 bonus
    vip = guest_profile.vip or vip, -- Keep VIP status if either account had it
    is_guest = false,
    updated_at = now()
  where id = new_user_id;

  -- 6. Delete the guest user profile (this will also delete the auth user via cascade)
  delete from public.profiles where id = guest_user_id;

  -- Create migration statistics
  migration_stats := json_build_object(
    'success', true,
    'guest_user_id', guest_user_id,
    'new_user_id', new_user_id,
    'new_email', new_email,
    'stories_migrated', stories_migrated,
    'translations_migrated', translations_migrated,
    'feedback_migrated', feedback_migrated,
    'ad_watches_migrated', ad_watches_migrated,
    'guest_coins_transferred', guest_profile.coins,
    'bonus_coins_awarded', 50,
    'total_coins_added', guest_profile.coins + 50
  );

  return migration_stats;
exception
  when others then
    -- Log the error and re-raise
    raise exception 'Migration failed: %', sqlerrm;
end;
$$ language plpgsql security definer;

-- Grant execute permission on the new function
grant execute on function public.convert_guest_to_registered_with_migration(uuid, uuid, text) to authenticated;

-- Create a simplified wrapper function for backward compatibility
create or replace function public.convert_guest_to_registered(
  user_id uuid,
  new_email text
)
returns void as $$
begin
  -- This function is kept for backward compatibility but will be replaced by the migration logic in the app
  update public.profiles 
  set 
    is_guest = false,
    coins = coins + 50,
    updated_at = now()
  where id = user_id and is_guest = true;
end;
$$ language plpgsql security definer;

-- Function to get guest user data for migration preview (useful for debugging)
create or replace function public.get_guest_migration_preview(
  guest_user_id uuid
)
returns json as $$
declare
  preview_data json;
  guest_profile record;
  story_count integer;
  translation_count integer;
  feedback_count integer;
  ad_watch_count integer;
begin
  -- Check if guest user exists and is actually a guest
  select * into guest_profile from public.profiles where id = guest_user_id and is_guest = true;
  if not found then
    raise exception 'Guest user not found or is not a guest account';
  end if;

  -- Count data to be migrated
  select count(*) into story_count from public.stories where user_id = guest_user_id;
  select count(*) into translation_count from public.translations where user_id = guest_user_id;
  select count(*) into feedback_count from public.feedback where user_id = guest_user_id;
  select count(*) into ad_watch_count from public.ad_watches where user_id = guest_user_id;

  preview_data := json_build_object(
    'guest_user_id', guest_user_id,
    'guest_email', (select email from auth.users where id = guest_user_id),
    'guest_coins', guest_profile.coins,
    'stories_to_migrate', story_count,
    'translations_to_migrate', translation_count,
    'feedback_to_migrate', feedback_count,
    'ad_watches_to_migrate', ad_watch_count,
    'preferred_translation_language', guest_profile.preferred_translation_language,
    'preferred_voice_id', guest_profile.preferred_voice_id,
    'preferred_model', guest_profile.preferred_model,
    'vip_status', guest_profile.vip,
    'total_coins_after_migration', guest_profile.coins + 50
  );

  return preview_data;
end;
$$ language plpgsql security definer;

-- Grant execute permission on the preview function
grant execute on function public.get_guest_migration_preview(uuid) to authenticated; 