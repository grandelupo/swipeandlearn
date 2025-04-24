-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Set up storage for book covers
insert into storage.buckets (id, name, public) 
values ('book-covers', 'book-covers', true);

-- Create storage policy to allow public access to book covers
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'book-covers' );

-- Create custom types
create type public.supported_languages as enum (
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese'
); 