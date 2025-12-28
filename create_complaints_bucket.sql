-- Create a private bucket for complaint evidence (or public if required for easier access)
insert into storage.buckets (id, name, public)
values ('complaints', 'complaints', true)
on conflict (id) do nothing;

-- Policies
create policy "Complaint images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'complaints' );

create policy "Authenticated users can upload complaint images"
  on storage.objects for insert
  with check ( bucket_id = 'complaints' and auth.role() = 'authenticated' );
