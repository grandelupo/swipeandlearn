

-- Create translations table
create table public.translations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  original_text text not null,
  target_language translation_language not null,
  translated_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Add a unique constraint to prevent duplicate translations
  unique(user_id, original_text, target_language)
);

-- Set up RLS
alter table public.translations enable row level security;

-- Create policies
create policy "Users can view their own translations"
  on public.translations for select
  using (auth.uid() = user_id);

create policy "Users can create their own translations"
  on public.translations for insert
  with check (auth.uid() = user_id);

-- Create indexes
create index translations_user_id_idx on public.translations(user_id);
create index translations_lookup_idx on public.translations(user_id, original_text, target_language); 