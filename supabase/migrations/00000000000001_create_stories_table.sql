create table public.stories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  language supported_languages not null,
  cover_image_url text,
  total_pages integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_accessed timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS (Row Level Security)
alter table public.stories enable row level security;

-- Create policies
create policy "Users can view their own stories"
  on public.stories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own stories"
  on public.stories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own stories"
  on public.stories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own stories"
  on public.stories for delete
  using (auth.uid() = user_id);

-- Create indexes
create index stories_user_id_idx on public.stories(user_id);
create index stories_created_at_idx on public.stories(created_at desc); 