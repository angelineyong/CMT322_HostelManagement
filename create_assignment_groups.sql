-- Create assignment_groups table
create table public.assignment_groups (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS
alter table public.assignment_groups disable row level security;

-- Insert groups derived from hostels
-- Logic: Remove the last word (e.g. 'K01') and prefix with 'INDUK-'
-- We use a CTE to get unique base names first
with unique_bases as (
  select distinct regexp_replace(name, '\s+[A-Za-z0-9]+$', '') as base_name
  from public.hostels
)
insert into public.assignment_groups (name)
select 'INDUK-' || base_name
from unique_bases
on conflict (name) do nothing;
