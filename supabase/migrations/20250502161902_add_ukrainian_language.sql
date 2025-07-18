-- Add Ukrainian to both language enums
ALTER TYPE public.supported_languages ADD VALUE IF NOT EXISTS 'Ukrainian';
ALTER TYPE public.translation_language ADD VALUE IF NOT EXISTS 'Ukrainian'; 