-- Fix overloaded convert_guest_to_registered_with_migration function
-- Drop all versions of the function to remove overloads
DROP FUNCTION IF EXISTS public.convert_guest_to_registered_with_migration(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.convert_guest_to_registered_with_migration(uuid, uuid, text, text);
DROP FUNCTION IF EXISTS public.convert_guest_to_registered_with_migration(uuid, uuid, varchar);
DROP FUNCTION IF EXISTS public.convert_guest_to_registered_with_migration(uuid, uuid, varchar, varchar);

-- Re-create the correct three-parameter version
CREATE OR REPLACE FUNCTION public.convert_guest_to_registered_with_migration(
  guest_user_id uuid,
  new_user_id uuid,
  new_email text
)
RETURNS json AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
grant execute on function public.convert_guest_to_registered_with_migration(uuid, uuid, text) to authenticated; 