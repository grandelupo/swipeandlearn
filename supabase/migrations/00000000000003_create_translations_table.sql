create table public.translations (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid references public.stories on delete cascade not null,
  original_text text not null,
  translated_text text not null,
  language_from supported_languages not null,
  language_to supported_languages not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS
alter table public.translations enable row level security;

-- Create policies
create policy "Users can view translations for their stories"
  on public.translations for select
  using (
    exists (
      select 1 from public.stories
      where stories.id = translations.story_id
      and stories.user_id = auth.uid()
    )
  );

create policy "Users can create translations for their stories"
  on public.translations for insert
  with check (
    exists (
      select 1 from public.stories
      where stories.id = translations.story_id
      and stories.user_id = auth.uid()
    )
  );

-- Create indexes
create index translations_story_id_idx on public.translations(story_id);
create index translations_text_idx on public.translations(original_text);

-- Create function to check if translation exists
create or replace function public.get_cached_translation(
  p_story_id uuid,
  p_original_text text,
  p_language_from supported_languages,
  p_language_to supported_languages
)
returns text as $$
declare
  v_translation text;
begin
  select translated_text into v_translation
  from public.translations
  where story_id = p_story_id
    and original_text = p_original_text
    and language_from = p_language_from
    and language_to = p_language_to
  limit 1;
  
  return v_translation;
end;
$$ language plpgsql security definer; 