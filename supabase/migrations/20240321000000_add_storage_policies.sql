-- Create storage policy to allow authenticated users to upload book covers
create policy "Allow authenticated users to upload book covers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'book-covers' AND
    auth.uid() = owner
  );

-- Create storage policy to allow authenticated users to update their own book covers
create policy "Allow authenticated users to update their own book covers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'book-covers' AND
    auth.uid() = owner
  );

-- Create storage policy to allow authenticated users to delete their own book covers
create policy "Allow authenticated users to delete their own book covers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'book-covers' AND
    auth.uid() = owner
  );

-- Ensure owner column exists and is set automatically
alter table storage.objects
  add column if not exists owner uuid references auth.users(id);

create or replace function storage.set_owner()
returns trigger as $$
begin
  new.owner = auth.uid();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists set_owner_trigger on storage.objects;
create trigger set_owner_trigger
  before insert on storage.objects
  for each row
  execute function storage.set_owner(); 