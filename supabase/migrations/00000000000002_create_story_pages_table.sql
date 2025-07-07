create table public.story_pages (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid references public.stories on delete cascade not null,
  page_number integer not null,
  content text not null,
  target_words text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS
alter table public.story_pages enable row level security;

-- Create policies
create policy "Users can view their story pages"
  on public.story_pages for select
  using (
    exists (
      select 1 from public.stories
      where stories.id = story_pages.story_id
      and stories.user_id = auth.uid()
    )
  );

create policy "Users can create pages for their stories"
  on public.story_pages for insert
  with check (
    exists (
      select 1 from public.stories
      where stories.id = story_pages.story_id
      and stories.user_id = auth.uid()
    )
  );

create policy "Users can update their story pages"
  on public.story_pages for update
  using (
    exists (
      select 1 from public.stories
      where stories.id = story_pages.story_id
      and stories.user_id = auth.uid()
    )
  );

create policy "Users can delete their story pages"
  on public.story_pages for delete
  using (
    exists (
      select 1 from public.stories
      where stories.id = story_pages.story_id
      and stories.user_id = auth.uid()
    )
  );

-- Create indexes
create index story_pages_story_id_idx on public.story_pages(story_id);
create unique index story_pages_story_id_page_number_idx on public.story_pages(story_id, page_number);