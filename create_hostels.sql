-- Create hostels table
create table public.hostels (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert some default hostels
insert into public.hostels (name) values
('Aman Damai K01'),
('Aman Damai K02'),
('Aman Damai K03'),
('Aman Damai K04'),
('Aman Damai K05'),
('Aman Damai K06'),
('Aman Damai K07'),
('Aman Damai K08'),
('Cahaya Gemilang H34'),
('Cahaya Gemilang H35'),
('Fajar Harapan F25'),
('Fajar Harapan F26'),
('Indah Kembara L07'),
('Indah Kembara L08'),
('Indah Kembara L11'),
('Indah Kembara L12'),
('Restu M01'),
('Restu M02'),
('Tekun M05'),
('Tekun M06'),
('Saujana M03'),
('Saujana M04');

-- Disable RLS (public read/write if enabled by default, but typically tables are open unless RLS is enabled)
-- Ensure RLS is OFF
alter table public.hostels disable row level security;
