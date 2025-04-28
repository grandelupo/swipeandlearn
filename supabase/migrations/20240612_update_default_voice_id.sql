-- Update any existing records with the old default to the new default
UPDATE public.profiles 
SET preferred_voice_id = 'KoVIHoyLDrQyd4pGalbs' 
WHERE preferred_voice_id = '21m00Tcm4TlvDq8ikWAM';

-- Change the default value for preferred_voice_id to the new default
ALTER TABLE public.profiles
ALTER COLUMN preferred_voice_id SET DEFAULT 'KoVIHoyLDrQyd4pGalbs'; 