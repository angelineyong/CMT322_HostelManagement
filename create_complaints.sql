-- Drop previous tables if they exist (Clean Slate for complaints only)
drop table if exists public.complaint_status_logs;
drop table if exists public.complaint_comments;
drop table if exists public.complaint_internal_notes;
drop table if exists public.complaints;
drop sequence if exists public.complaints_id_seq; -- Renamed sequence

-- Note: We assume 'public.status' and 'public.facility_type' already exist.
-- Referenced keys: public.facility_type(id) [Integer], public.status(id) [Integer]

-- 1. Sequence for Readable IDs (Renamed to match user request)
create sequence if not exists public.complaints_id_seq;

-- 2. Main Complaints Table
create table public.complaints (
  id uuid default gen_random_uuid() primary key,
  task_id text not null default ('TASK' || lpad(nextval('public.complaints_id_seq')::text, 5, '0')), -- Readable ID: TASK00001
  user_id uuid references public.profiles(id) on delete set null, -- The student creator
  
  -- Details
  facility_type_id integer references public.facility_type(id) on delete set null, -- FK to Facility (Integer)
  description text not null,
  image_url text, -- Evidence from student
  
  -- Status & Assignment
  status_id integer references public.status(id) on delete set null, -- FK to Status (Integer) - Updated table name
  assignment_group_id uuid references public.assignment_groups(id) on delete set null, -- Auto-filled by trigger (UUID)
  assigned_to uuid references public.profiles(id) on delete set null, -- Staff ID
  
  -- Resolution
  resolved_at timestamp with time zone,
  resolved_evidence_url text, -- Picture from staff
  
  -- Metadata
  updated_by uuid references public.profiles(id) on delete set null, -- Last person who touched it
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Comments Table
create table public.complaint_comments (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references public.complaints(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null, 
  comment text not null,
  created_at timestamp with time zone default now()
);

-- 4. Internal Notes Table
create table public.complaint_internal_notes (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references public.complaints(id) on delete cascade,
  staff_id uuid references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamp with time zone default now()
);

-- 5. Status History / Audit Log
create table public.complaint_status_logs (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references public.complaints(id) on delete cascade,
  previous_status_id integer references public.status(id), -- Updated table name
  new_status_id integer references public.status(id),      -- Updated table name
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Disable RLS
alter table public.complaints disable row level security;
alter table public.complaint_comments disable row level security;
alter table public.complaint_internal_notes disable row level security;
alter table public.complaint_status_logs disable row level security;


-- 6. Trigger: Auto-Assign Group based on Student's Hostel
create or replace function public.auto_assign_complaint_group()
returns trigger
language plpgsql
as $$
declare
  student_hostel text;
  base_hostel_name text;
begin
  -- Only run on INSERT
  -- 1. Get the student's hostel_block from public.students
  select hostel_block into student_hostel
  from public.students
  where id = new.user_id;

  -- 2. If found, parse it
  if student_hostel is not null then
    -- Regex to remove suffix (e.g. ' Aman Damai H01' -> ' Aman Damai')
    base_hostel_name := regexp_replace(student_hostel, '\s+[A-Za-z0-9]+$', '');
    
    -- 3. Find Matching Group ID
    select id into new.assignment_group_id
    from public.assignment_groups
    where name = 'INDUK-' || trim(base_hostel_name);
  end if;

  -- Default status to 'Submitted' if null
  if new.status_id is null then
    select id into new.status_id from public.status where status_name = 'Submitted' limit 1; -- Updated table name
  end if;

  return new;
end;
$$;

create trigger trigger_auto_assign_group
before insert on public.complaints
for each row
execute procedure public.auto_assign_complaint_group();


-- 7. Trigger: Update 'updated_at' timestamp
create or replace function public.update_complaint_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_update_complaint_modtime
before update on public.complaints
for each row
execute procedure public.update_complaint_timestamp();


-- 8. Trigger: Log Status Changes
create or replace function public.log_complaint_status_change()
returns trigger
language plpgsql
as $$
begin
  if (old.status_id is distinct from new.status_id) then
    insert into public.complaint_status_logs (complaint_id, previous_status_id, new_status_id, changed_by)
    values (new.id, old.status_id, new.status_id, new.updated_by);
  end if;
  return new;
end;
$$;

create trigger trigger_log_complaint_status
after update on public.complaints
for each row
execute procedure public.log_complaint_status_change();
