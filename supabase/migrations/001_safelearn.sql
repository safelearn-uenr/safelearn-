-- SafeLearn production schema starting point.
-- The preview uses a browser-backed demo store; this migration is ready for a Supabase project.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  active_session_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  code text not null,
  name text not null,
  description text not null default '',
  price_ghs numeric(10,2) not null check (price_ghs >= 0),
  is_bundle boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  module_label text not null default '',
  duration_label text not null default '',
  video_url text not null,
  stream_type text not null default 'hls',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.access_grants (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  source text not null default 'self_serve' check (source in ('self_serve', 'pos', 'bundle')),
  granted_at timestamptz not null default now(),
  unique(profile_id, course_id)
);

create table if not exists public.payment_requests (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  contact text not null,
  transaction_id text not null,
  amount_ghs numeric(10,2) not null check (amount_ghs >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.access_grants enable row level security;
alter table public.payment_requests enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.has_course_access(target_course uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.access_grants where profile_id = auth.uid() and course_id = target_course
  );
$$;

create policy "published courses are readable" on public.courses for select using (published = true or public.is_admin());
create policy "students read their own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "students update their own session" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "enrolled students read lessons" on public.lessons for select using (public.has_course_access(course_id));
create policy "admins manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "students read their grants" on public.access_grants for select using (profile_id = auth.uid() or public.is_admin());
create policy "admins manage grants" on public.access_grants for all using (public.is_admin()) with check (public.is_admin());
create policy "students create payment requests" on public.payment_requests for insert with check (profile_id = auth.uid());
create policy "students read their payment requests" on public.payment_requests for select using (profile_id = auth.uid() or public.is_admin());
create policy "admins review payment requests" on public.payment_requests for update using (public.is_admin()) with check (public.is_admin());
