

-- SafeLearn production seed: provided course catalogue and placeholder lesson slots.
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

-- After the two users register through Supabase Auth, run the bootstrap script to promote:
-- safelearn.contact@gmail.com and abdulrecapsall@gmail.com
