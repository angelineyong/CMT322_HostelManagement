-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- RPC to create a user (checking specific email/password etc)
-- NOTE: This bypasses Supabase Auth's typical GoTrue API checks. 
-- It is for Admin use only.
-- RPC to delete a user
create or replace function public.delete_user_by_admin(user_id_to_delete uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Delete from auth.users; cascade will handle profiles/staff
  delete from auth.users where id = user_id_to_delete;
end;
$$;
