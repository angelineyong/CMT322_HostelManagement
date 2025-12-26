-- Function to check if an email already exists in the profiles table
-- Usage via Supabase RPC: const { data } = await supabase.rpc('check_email_exists', { email_to_check: '...' })

create or replace function public.check_email_exists(email_to_check text)
returns boolean
language plpgsql
security definer -- Runs with privileges of the creator (postgres), effectively bypassing RLS to check existence
as $$
begin
  return exists (select 1 from public.profiles where email = email_to_check);
end;
$$;
