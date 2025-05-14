-- Create ad_watches table
create table if not exists public.ad_watches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  watched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reward_amount integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.ad_watches enable row level security;

create policy "Users can view their own ad watches"
  on public.ad_watches for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ad watches"
  on public.ad_watches for insert
  with check (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists ad_watches_user_id_watched_at_idx
  on public.ad_watches (user_id, watched_at desc); 