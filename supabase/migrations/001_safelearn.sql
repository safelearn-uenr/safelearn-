-- SafeLearn production schema, RLS policies, and initial course catalogue.
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  active_session_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;

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
  video_url text not null default '',
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

create index if not exists lessons_course_sort_idx on public.lessons(course_id, sort_order);
create index if not exists access_grants_profile_idx on public.access_grants(profile_id);
create index if not exists payment_requests_status_idx on public.payment_requests(status, created_at desc);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.access_grants enable row level security;
alter table public.payment_requests enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

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

create or replace function public.set_active_session(next_session_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
  set active_session_id = next_session_id
  where id = auth.uid();
end;
$$;

grant execute on function public.set_active_session(text) to authenticated;

drop policy if exists "published courses are readable" on public.courses;
drop policy if exists "students read their own profile" on public.profiles;
drop policy if exists "students update their own session" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
drop policy if exists "enrolled students read lessons" on public.lessons;
drop policy if exists "admins manage lessons" on public.lessons;
drop policy if exists "students read their grants" on public.access_grants;
drop policy if exists "admins manage grants" on public.access_grants;
drop policy if exists "students create payment requests" on public.payment_requests;
drop policy if exists "students read their payment requests" on public.payment_requests;
drop policy if exists "admins review payment requests" on public.payment_requests;

create policy "published courses are readable" on public.courses for select using (published = true or public.is_admin());
create policy "students read their own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "enrolled students read lessons" on public.lessons for select using (public.has_course_access(course_id));
create policy "admins manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "students read their grants" on public.access_grants for select using (profile_id = auth.uid() or public.is_admin());
create policy "admins manage grants" on public.access_grants for all using (public.is_admin()) with check (public.is_admin());
create policy "students create payment requests" on public.payment_requests for insert with check (profile_id = auth.uid());
create policy "students read their payment requests" on public.payment_requests for select using (profile_id = auth.uid() or public.is_admin());
create policy "admins review payment requests" on public.payment_requests for update using (public.is_admin()) with check (public.is_admin());

-- SafeLearn production seed: supplied course catalogue and placeholder lesson slots.
insert into public.courses (slug, code, name, description, price_ghs, is_bundle, published)
values
  ('gis', 'GIS', 'Geographic Information System (GIS)', 'Simplifying complex courses for academic excellence.', 30, false, true),
  ('decision-support-disaster-management', 'DSS-DM', 'Decision Support for Disaster Management', 'Simplifying complex courses for academic excellence.', 30, false, true),
  ('gis-dss-dm-complete-package', 'BUNDLE', 'GIS & DSS-DM Complete Package (Courses A + B)', 'Both SafeLearn pathways in one complete package.', 60, true, true)
on conflict (slug) do update set
  code = excluded.code,
  name = excluded.name,
  description = excluded.description,
  price_ghs = excluded.price_ghs,
  is_bundle = excluded.is_bundle,
  published = excluded.published;

do $$
declare
  gis_id uuid;
  dss_id uuid;
begin
  select id into gis_id from public.courses where slug = 'gis';
  select id into dss_id from public.courses where slug = 'decision-support-disaster-management';

  insert into public.lessons (course_id, title, module_label, duration_label, video_url, stream_type, sort_order)
  select gis_id, 'Lesson 1: Introduction (Coming Soon)', 'Module 01 / Foundations', 'Coming soon', '', 'placeholder', 0
  where not exists (select 1 from public.lessons where course_id = gis_id and title = 'Lesson 1: Introduction (Coming Soon)');

  insert into public.lessons (course_id, title, module_label, duration_label, video_url, stream_type, sort_order)
  select dss_id, 'Lesson 1: Introduction (Coming Soon)', 'Module 01 / Foundations', 'Coming soon', '', 'placeholder', 0
  where not exists (select 1 from public.lessons where course_id = dss_id and title = 'Lesson 1: Introduction (Coming Soon)');
end $$;

-- After the two users register through Supabase Auth, run pnpm bootstrap:supabase to promote:
-- safelearn.contact@gmail.com and abdulrecapsall@gmail.com
