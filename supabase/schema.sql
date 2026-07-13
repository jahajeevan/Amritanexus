-- ============================================================
-- Amrita Nexus · Supabase schema
-- Run this in your Supabase project → SQL Editor → New query.
-- The app works fully on localStorage; this makes student
-- accounts persist in Supabase as well (best-effort mirror).
-- ============================================================

create table if not exists public.students (
  id            text primary key,
  name          text not null,
  email         text unique not null,
  register_num  text,
  phone         text,
  department    text,
  year          text,
  salt          text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

alter table public.students enable row level security;

-- Allow account creation (sign-up) with the public anon/publishable key.
drop policy if exists "students_insert_anon" on public.students;
create policy "students_insert_anon"
  on public.students for insert
  to anon
  with check (email ilike '%@cb.students.amrita.edu');

-- NOTE: We intentionally do NOT grant a broad SELECT to anon, so password
-- hashes are never publicly readable. Sign-in falls back to the local device
-- store. To enable secure cross-device sign-in, add the RPC below and call it
-- instead of selecting the row directly.
--
-- create or replace function public.verify_student(p_email text)
--   returns table (id text, name text, email text, register_num text,
--                  phone text, department text, year text, salt text, password_hash text)
--   language sql security definer set search_path = public as $$
--     select id, name, email, register_num, phone, department, year, salt, password_hash
--     from public.students where email = lower(p_email) limit 1;
--   $$;
-- revoke all on function public.verify_student(text) from public;
-- grant execute on function public.verify_student(text) to anon;
