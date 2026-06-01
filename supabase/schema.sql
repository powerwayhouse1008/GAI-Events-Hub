-- Global AI Industry Alliance - Full Supabase SQL setup/fix
-- Run this entire file in Supabase SQL Editor. It is idempotent and safe to re-run.

create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  company_name text,
  role text not null default 'member' check (role in ('member','organizer','admin')),
  organizer_status text not null default 'none' check (organizer_status in ('none','pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  organizer_name text,
  category text,
  region text,
  location text,
  online_url text,
  cover_url text,
  theme_color text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer check (capacity is null or capacity >= 0),
  ticket_price numeric not null default 0 check (ticket_price >= 0),
  approval_mode text not null default 'manual' check (approval_mode in ('manual','auto')),
  status text not null default 'pending' check (status in ('pending','published','rejected','draft')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  message text,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_documents (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  file_url text not null,
  file_type text,
  file_size integer check (file_size is null or file_size >= 0),
  created_at timestamptz not null default now()
);

-- Add columns/checks when this file is run over an older schema.
alter table public.profiles
  add column if not exists email text,
  add column if not exists display_name text,
  add column if not exists avatar_url text,
  add column if not exists company_name text,
  add column if not exists role text not null default 'member',
  add column if not exists organizer_status text not null default 'none',
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  drop constraint if exists profiles_email_key;

alter table public.profiles
  drop constraint if exists profiles_role_check,
  drop constraint if exists profiles_organizer_status_check;

alter table public.profiles
  add constraint profiles_role_check
    check (role in ('member','organizer','admin')),
  add constraint profiles_organizer_status_check
    check (organizer_status in ('none','pending','approved','rejected'));

alter table public.events
  add column if not exists organizer_name text,
  add column if not exists category text,
  add column if not exists region text,
  add column if not exists location text,
  add column if not exists online_url text,
  add column if not exists cover_url text,
  add column if not exists theme_color text,
  add column if not exists capacity integer,
  add column if not exists ticket_price numeric not null default 0,
  add column if not exists approval_mode text not null default 'manual',
  add column if not exists status text not null default 'pending',
  add column if not exists featured boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

alter table public.announcements
  add column if not exists updated_at timestamptz not null default now();

-- Helpful indexes for lists/detail dashboards.
create index if not exists events_status_starts_at_idx on public.events (status, starts_at);
create index if not exists events_featured_starts_at_idx on public.events (featured, starts_at);
create index if not exists events_organizer_created_at_idx on public.events (organizer_id, created_at desc);
create index if not exists registrations_event_created_at_idx on public.registrations (event_id, created_at desc);
create index if not exists registrations_user_created_at_idx on public.registrations (user_id, created_at desc);
create index if not exists announcements_event_created_at_idx on public.announcements (event_id, created_at desc);
create index if not exists event_documents_event_created_at_idx on public.event_documents (event_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Functions and triggers
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  existing_profile_id uuid;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'requested_role', 'member');

  -- Older data may already contain the same email on another profile row. That
  -- blocks sign-up when profiles.email has or had a unique constraint.
  if new.email is not null then
    select p.id
    into existing_profile_id
    from public.profiles p
    where lower(p.email) = lower(new.email)
      and p.id <> new.id
    limit 1;

    if existing_profile_id is not null then
      update public.profiles
      set email = null
      where id = existing_profile_id;
    end if;
  end if;

  insert into public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    company_name,
    role,
    organizer_status
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'company_name',
    case when requested_role = 'organizer' then 'organizer' else 'member' end,
    case when requested_role = 'organizer' then 'approved' else 'none' end
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    company_name = coalesce(public.profiles.company_name, excluded.company_name),
    role = case
      when requested_role = 'organizer' and public.profiles.role = 'member' then 'organizer'
      else public.profiles.role
    end,
    organizer_status = case
      when requested_role = 'organizer' then 'approved'
      else public.profiles.organizer_status
    end;

  return new;
exception
  when others then
    -- Do not fail auth.users creation because of profile sync issues.
    raise warning 'handle_new_user profile sync failed for user %, email %: %', new.id, new.email, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role = 'admin' from public.profiles p where p.id = uid),
    false
  );
$$;

create or replace function public.is_approved_organizer(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = uid
      and (p.role = 'admin' or (p.role = 'organizer' and p.organizer_status = 'approved'))
  );
$$;

create or replace function public.is_event_organizer(target_event_id uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.events e
    where e.id = target_event_id and e.organizer_id = uid
  );
$$;

create or replace function public.is_event_participant(target_event_id uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.registrations r
    where r.event_id = target_event_id
      and r.user_id = uid
      and r.status in ('pending', 'approved')
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists announcements_touch_updated_at on public.announcements;
create trigger announcements_touch_updated_at
before update on public.announcements
for each row execute procedure public.touch_updated_at();

-- Stop normal users from changing their own role/approval status via the profile form.
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin(auth.uid()) then
    -- Members may request organizer review once. They still cannot approve
    -- themselves or change their role; admins approve by setting role/status.
    if new.role is distinct from old.role then
      raise exception 'You cannot change your own role';
    end if;

    if new.organizer_status is distinct from old.organizer_status
       and not (
         old.role = 'member'
         and new.role = 'member'
         and old.organizer_status in ('none', 'rejected')
         and new.organizer_status = 'pending'
       )
    then
      raise exception 'You cannot change your own organizer status';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_privilege_escalation on public.profiles;
create trigger prevent_profile_privilege_escalation
before update on public.profiles
for each row execute procedure public.prevent_profile_privilege_escalation();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.announcements enable row level security;
alter table public.event_documents enable row level security;

-- Profiles
-- Members can read themselves. Admins can read everyone. Event organizers can read
-- profiles of users registered for their events, which fixes participant dashboards.
drop policy if exists "profiles read own admin event organizer" on public.profiles;
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own admin event organizer"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin(auth.uid())
  or exists(
    select 1
    from public.registrations r
    join public.events e on e.id = r.event_id
    where r.user_id = profiles.id and e.organizer_id = auth.uid()
  )
);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
on public.profiles for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'member'
  and organizer_status in ('none', 'pending')
);

drop policy if exists "profiles update own basic" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles"
on public.profiles for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Events
drop policy if exists "events public read published" on public.events;
create policy "events public read published"
on public.events for select
to anon, authenticated
using (status = 'published' or organizer_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "approved organizers create events" on public.events;
create policy "approved organizers create events"
on public.events for insert
to authenticated
with check (organizer_id = auth.uid() and public.is_approved_organizer(auth.uid()));

drop policy if exists "organizers update own events" on public.events;
create policy "organizers update own events"
on public.events for update
to authenticated
using (organizer_id = auth.uid() or public.is_admin(auth.uid()))
with check (organizer_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "admins delete events" on public.events;
create policy "admins delete events"
on public.events for delete
to authenticated
using (public.is_admin(auth.uid()));

-- Registrations
drop policy if exists "registrations select own organizer admin" on public.registrations;
create policy "registrations select own organizer admin"
on public.registrations for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin(auth.uid())
  or public.is_event_organizer(event_id, auth.uid())
);

drop policy if exists "members register" on public.registrations;
create policy "members register"
on public.registrations for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "organizers update registrations" on public.registrations;
create policy "organizers update registrations"
on public.registrations for update
to authenticated
using (public.is_admin(auth.uid()) or public.is_event_organizer(event_id, auth.uid()))
with check (public.is_admin(auth.uid()) or public.is_event_organizer(event_id, auth.uid()));

-- Announcements
drop policy if exists "announcements read by participants organizers admin" on public.announcements;
create policy "announcements read by participants organizers admin"
on public.announcements for select
to authenticated
using (
  organizer_id = auth.uid()
  or public.is_admin(auth.uid())
  or public.is_event_participant(event_id, auth.uid())
);

drop policy if exists "organizers create announcements" on public.announcements;
create policy "organizers create announcements"
on public.announcements for insert
to authenticated
with check (organizer_id = auth.uid() and public.is_event_organizer(event_id, auth.uid()));

drop policy if exists "organizers update announcements" on public.announcements;
create policy "organizers update announcements"
on public.announcements for update
to authenticated
using (organizer_id = auth.uid() or public.is_admin(auth.uid()))
with check (organizer_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "organizers delete announcements" on public.announcements;
create policy "organizers delete announcements"
on public.announcements for delete
to authenticated
using (organizer_id = auth.uid() or public.is_admin(auth.uid()));

-- Event documents
drop policy if exists "documents read by participants organizers admin" on public.event_documents;
create policy "documents read by participants organizers admin"
on public.event_documents for select
to authenticated
using (
  organizer_id = auth.uid()
  or public.is_admin(auth.uid())
  or public.is_event_participant(event_id, auth.uid())
);

drop policy if exists "organizers upload documents" on public.event_documents;
create policy "organizers upload documents"
on public.event_documents for insert
to authenticated
with check (organizer_id = auth.uid() and public.is_event_organizer(event_id, auth.uid()));

drop policy if exists "organizers update documents" on public.event_documents;
create policy "organizers update documents"
on public.event_documents for update
to authenticated
using (organizer_id = auth.uid() or public.is_admin(auth.uid()))
with check (organizer_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "organizers delete documents" on public.event_documents;
create policy "organizers delete documents"
on public.event_documents for delete
to authenticated
using (organizer_id = auth.uid() or public.is_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- Storage buckets and policies
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('event-covers', 'event-covers', true),
  ('event-documents', 'event-documents', true)
on conflict (id) do update set public = excluded.public;

-- Event covers are public; authenticated users can upload/update/delete their files.
drop policy if exists "public read event covers" on storage.objects;
create policy "public read event covers"
on storage.objects for select
to public
using (bucket_id = 'event-covers');

drop policy if exists "authenticated upload event covers" on storage.objects;
create policy "authenticated upload event covers"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-covers');

drop policy if exists "authenticated update event covers" on storage.objects;
create policy "authenticated update event covers"
on storage.objects for update
to authenticated
using (bucket_id = 'event-covers')
with check (bucket_id = 'event-covers');

drop policy if exists "authenticated delete event covers" on storage.objects;
create policy "authenticated delete event covers"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-covers');

-- The application stores document public URLs, so this bucket must be public too.
drop policy if exists "authenticated read documents" on storage.objects;
drop policy if exists "public read event documents storage" on storage.objects;
create policy "public read event documents storage"
on storage.objects for select
to public
using (bucket_id = 'event-documents');

drop policy if exists "organizers upload documents storage" on storage.objects;
create policy "organizers upload documents storage"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-documents');

drop policy if exists "organizers update documents storage" on storage.objects;
create policy "organizers update documents storage"
on storage.objects for update
to authenticated
using (bucket_id = 'event-documents')
with check (bucket_id = 'event-documents');

drop policy if exists "organizers delete documents storage" on storage.objects;
create policy "organizers delete documents storage"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-documents');

-- -----------------------------------------------------------------------------
-- Grants used by Supabase/PostgREST
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.events to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.registrations to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, update, delete on public.event_documents to authenticated;
grant execute on function public.is_admin(uuid) to anon, authenticated;
grant execute on function public.is_approved_organizer(uuid) to anon, authenticated;
grant execute on function public.is_event_organizer(uuid, uuid) to anon, authenticated;
grant execute on function public.is_event_participant(uuid, uuid) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Admin helper: create/register this Auth user first, then run this.
-- -----------------------------------------------------------------------------
-- Default admin account requested for this project:
--   email: info@powerway.jp
--   password: Dao123123
--
-- Create the user in the app or in Supabase Dashboard > Authentication > Users
-- with that password, then run:
update public.profiles
set role = 'admin', organizer_status = 'approved'
where email = 'info@powerway.jp';
