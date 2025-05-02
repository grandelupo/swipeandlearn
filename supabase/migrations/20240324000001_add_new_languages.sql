-- Add new languages to supported_languages enum
ALTER TYPE public.supported_languages ADD VALUE IF NOT EXISTS 'Chinese';
ALTER TYPE public.supported_languages ADD VALUE IF NOT EXISTS 'Japanese';
ALTER TYPE public.supported_languages ADD VALUE IF NOT EXISTS 'Korean';
ALTER TYPE public.supported_languages ADD VALUE IF NOT EXISTS 'Russian';
ALTER TYPE public.supported_languages ADD VALUE IF NOT EXISTS 'Arabic';