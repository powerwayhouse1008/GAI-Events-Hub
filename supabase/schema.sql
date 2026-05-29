create extension if not exists "uuid-ossp";

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
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer,
  ticket_price numeric default 0,
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

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'requested_role', 'member');

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
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'company_name',
    'member',
    case when requested_role = 'organizer' then 'pending' else 'none' end
  );

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
security definer
as $$
  select exists(select 1 from public.profiles where id = uid and role = 'admin');
$$;

create or replace function public.is_approved_organizer(uid uuid)
returns boolean
language sql
security definer
as $$
  select exists(
    select 1 from public.profiles
    where id = uid and (role = 'admin' or (role = 'organizer' and organizer_status = 'approved'))
  );
$$;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "profiles update own basic" on public.profiles;
create policy "profiles update own basic"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

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

drop policy if exists "registrations select own organizer admin" on public.registrations;
create policy "registrations select own organizer admin"
on public.registrations for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin(auth.uid())
  or exists(select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
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
using (
  public.is_admin(auth.uid())
  or exists(select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
)
with check (
  public.is_admin(auth.uid())
  or exists(select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
);

insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

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

-- Announcements table for event organizers to post notifications
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Event documents/files table for sharing resources with participants
create table if not exists public.event_documents (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
alter table public.event_documents enable row level security;

-- Announcements RLS policies
drop policy if exists "announcements read by participants organizers admin" on public.announcements;
create policy "announcements read by participants organizers admin"
on public.announcements for select
to authenticated
using (
  organizer_id = auth.uid()
  or public.is_admin(auth.uid())
  or exists(
    select 1 from public.registrations r
    where r.event_id = announcements.event_id and r.user_id = auth.uid()
  )
);

drop policy if exists "organizers create announcements" on public.announcements;
create policy "organizers create announcements"
on public.announcements for insert
to authenticated
with check (
  organizer_id = auth.uid()
  and exists(
    select 1 from public.events e
    where e.id = event_id and e.organizer_id = auth.uid()
  )
);

drop policy if exists "organizers delete announcements" on public.announcements;
create policy "organizers delete announcements"
on public.announcements for delete
to authenticated
using (
  organizer_id = auth.uid()
  or public.is_admin(auth.uid())
);

-- Event documents RLS policies
drop policy if exists "documents read by participants organizers admin" on public.event_documents;
create policy "documents read by participants organizers admin"
on public.event_documents for select
to authenticated
using (
  organizer_id = auth.uid()
  or public.is_admin(auth.uid())
  or exists(
    select 1 from public.registrations r
    where r.event_id = event_documents.event_id and r.user_id = auth.uid()
  )
);

drop policy if exists "organizers upload documents" on public.event_documents;
create policy "organizers upload documents"
on public.event_documents for insert
to authenticated
with check (
  organizer_id = auth.uid()
  and exists(
    select 1 from public.events e
    where e.id = event_id and e.organizer_id = auth.uid()
  )
);

drop policy if exists "organizers delete documents" on public.event_documents;
create policy "organizers delete documents"
on public.event_documents for delete
to authenticated
using (
  organizer_id = auth.uid()
  or public.is_admin(auth.uid())
);

-- Storage bucket for event documents
insert into storage.buckets (id, name, public)
values ('event-documents', 'event-documents', false)
on conflict (id) do nothing;

drop policy if exists "organizers upload documents storage" on storage.objects;
create policy "organizers upload documents storage"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-documents');

drop policy if exists "authenticated read documents" on storage.objects;
create policy "authenticated read documents"
on storage.objects for select
to authenticated
using (bucket_id = 'event-documents');
