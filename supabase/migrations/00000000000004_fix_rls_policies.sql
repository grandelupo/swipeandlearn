-- Drop existing policies
drop policy if exists "Users can view their own stories" on public.stories;
drop policy if exists "Users can create their own stories" on public.stories;
drop policy if exists "Users can insert their own stories" on public.stories;
drop policy if exists "Users can update their own stories" on public.stories;
drop policy if exists "Users can delete their own stories" on public.stories;

-- Recreate policies
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