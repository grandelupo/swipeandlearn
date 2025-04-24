-- First, drop existing policies
drop policy if exists "Allow authenticated users to upload book covers" on storage.objects;
drop policy if exists "Allow authenticated users to update their own book covers" on storage.objects;
drop policy if exists "Allow authenticated users to delete their own book covers" on storage.objects;
drop policy if exists "Public Access" on storage.objects;

-- Create a simpler insert policy that only checks the bucket
create policy "Allow authenticated users to upload book covers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'book-covers');

-- Create policy for public read access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'book-covers' );

-- Create policy for authenticated users to update their own files
create policy "Allow authenticated users to update their own book covers"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'book-covers' );

-- Create policy for authenticated users to delete their own files
create policy "Allow authenticated users to delete their own book covers"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'book-covers' );

-- Make sure RLS is enabled
alter table storage.objects enable row level security; 