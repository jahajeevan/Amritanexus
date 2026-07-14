-- ============================================================
-- Amrita Nexus · Supabase schema (complete, idempotent).
-- Run in Supabase → SQL Editor → New query. Safe to re-run.
--
-- Design:
--  • Public catalog (events / departments / announcements) is world-readable
--    with the anon key so the homepage loads without a login.
--  • students + registrations hold PII and are NEVER anon-readable — every
--    account, sign-in and registration goes through the /api serverless
--    functions, which use the service-role key and bypass RLS.
-- ============================================================

-- ── students ────────────────────────────────────────────────
create table if not exists public.students (
  id            text primary key,
  name          text not null,
  email         text unique not null,
  register_num  text,
  phone         text,
  department    text,
  year          text,
  section       text,
  salt          text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
alter table public.students add column if not exists year    text;
alter table public.students add column if not exists section text;
alter table public.students enable row level security;
-- No anon policies: only the service role (server /api) touches this table,
-- so password hashes are never publicly readable.

-- ── events (public catalog) ─────────────────────────────────
create table if not exists public.events (
  id            text primary key,
  title         text not null,
  category      text,
  department    text,
  venue         text,
  maps_link     text,
  date          date,
  time          text,
  deadline      date,             -- last day students can register
  max_seats     int  default 100,
  seats_filled  int  default 0,
  status        text default 'Open',
  coordinator   text,
  description   text,
  rules         text,
  prizes        text,
  points        int  default 50,   -- custom participation credits per event
  volunteers    jsonb default '[]',
  announcements jsonb default '[]',
  gallery       jsonb default '[]',
  created_at    timestamptz not null default now()
);
alter table public.events add column if not exists points int default 50;
alter table public.events add column if not exists deadline date;
alter table public.events enable row level security;
drop policy if exists "events_read" on public.events;
create policy "events_read" on public.events for select to anon, authenticated using (true);

-- ── departments (leaderboard) ───────────────────────────────
create table if not exists public.departments (
  dept          text primary key,
  registrations int not null default 0,
  checkins      int not null default 0,
  points        int not null default 0
);
alter table public.departments enable row level security;
drop policy if exists "departments_read" on public.departments;
create policy "departments_read" on public.departments for select to anon, authenticated using (true);

-- Seed the eight branches at ZERO so credits accrue only from real, verified
-- attendance. Re-running resets counters — a clean slate for launch day.
insert into public.departments (dept, registrations, checkins, points) values
  ('CSE', 0, 0, 0), ('AI', 0, 0, 0), ('Cyber Security', 0, 0, 0), ('ECE', 0, 0, 0),
  ('EEE', 0, 0, 0), ('Mechanical', 0, 0, 0), ('Civil', 0, 0, 0), ('MBA', 0, 0, 0)
on conflict (dept) do update
  set registrations = excluded.registrations,
      checkins      = excluded.checkins,
      points        = excluded.points;

-- ── announcements (public) ──────────────────────────────────
create table if not exists public.announcements (
  id         text primary key,
  title      text,
  content    text,
  event_id   text,
  date       text,
  time       text,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
drop policy if exists "announcements_read" on public.announcements;
create policy "announcements_read" on public.announcements for select to anon, authenticated using (true);

-- ── registrations (PII — server-only, no anon policy) ───────
create table if not exists public.registrations (
  id                text primary key,
  ticket_id         text,
  name              text,
  register_num      text,
  department        text,
  year              text,
  section           text,
  email             text,
  phone             text,
  event_id          text,
  event_title       text,
  event_category    text,
  event_date        date,
  event_time        text,
  venue             text,
  registration_date date,
  registration_time text,
  status            text default 'Confirmed',
  attended          boolean default false,
  created_at        timestamptz not null default now()
);
alter table public.registrations add column if not exists year    text;
alter table public.registrations add column if not exists section text;
alter table public.registrations enable row level security;
-- No anon policies: registrations are read/written only by the service role.

create index if not exists registrations_event_idx on public.registrations (event_id);
create index if not exists registrations_class_idx on public.registrations (department, year, section);

-- ── coordinators (limited venue-staff logins created by the admin) ──
-- Server-only, like students: can view registrations + scan attendance, never
-- create/edit. No anon policies (auth goes through /api).
create table if not exists public.coordinators (
  id            text primary key,
  name          text not null,
  email         text unique not null,
  salt          text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
alter table public.coordinators enable row level security;

-- ── Realtime (live cross-device sync) ───────────────────────────────
-- Publish the PUBLIC catalog tables so every signed-in client is pushed a
-- change the instant a registration/attendance updates seats or credits; each
-- client then re-pulls its own registrations via the authenticated API.
-- registrations is intentionally NOT published (PII stays server-only).
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='events') then
    alter publication supabase_realtime add table public.events;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='departments') then
    alter publication supabase_realtime add table public.departments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='announcements') then
    alter publication supabase_realtime add table public.announcements;
  end if;
end $$;
