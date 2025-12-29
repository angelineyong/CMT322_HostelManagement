-- Drop existing objects for a clean start
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.students;
drop table if exists public.staff;
drop table if exists public.profiles;
drop type if exists public.user_role;

-- Create a custom type for roles
create type public.user_role as enum ('admin', 'staff', 'student');

-- 1. Base Profiles Table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  phone text,
  profile_pic_url text,
  role public.user_role not null default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- 2. Student Table
create table public.students (
  id uuid not null references public.profiles(id) on delete cascade,
  room_no text,
  hostel_block text,
  primary key (id)
);

-- 3. Staff Table
create table public.staff (
  id uuid not null references public.profiles(id) on delete cascade,
  assigned_group text,
  primary key (id)
);

-- DISABLE RLS as requested
alter table public.profiles disable row level security;
alter table public.students disable row level security;
alter table public.staff disable row level security;

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_role public.user_role;
begin
  -- Determine role (default to student)
  new_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student');

  -- Insert into public.profiles
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    new_role
  );

  -- If student, create entry in public.students
  if new_role = 'student' then
    insert into public.students (id) values (new.id);
  end if;

  -- If staff, create entry in public.staff
  if new_role = 'staff' then
    insert into public.staff (id) values (new.id);
  end if;

  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage for Avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
