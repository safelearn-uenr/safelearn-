-- SafeLearn admin content management policies.
-- Run this once in the Supabase SQL Editor after 001_safelearn.sql.

drop policy if exists "admins manage courses" on public.courses;
create policy "admins manage courses" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage lessons" on public.lessons;
create policy "admins manage lessons" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());
