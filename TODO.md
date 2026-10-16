# SafeLearn production transition

## Completed in this transition

- [x] Supabase URL, anon key, and service-role key are stored through protected project secrets; no secret values are committed.
- [x] Course content is updated to Geographic Information System (GIS), Decision Support for Disaster Management, and GIS & DSS-DM Complete Package (Courses A + B).
- [x] Course prices are GHS 30, GHS 30, and GHS 60.
- [x] Both course descriptions use “Simplifying complex courses for academic excellence.”
- [x] WhatsApp support links use `233246912468` and pre-populate the lesson title on protected lesson pages.
- [x] Placeholder lesson slots are defined as “Lesson 1: Introduction (Coming Soon)” for both courses.
- [x] A repeatable `pnpm bootstrap:supabase` command is available to seed courses, placeholder lessons, and promote the supplied admin emails when their Supabase Auth accounts exist.
- [x] Live Supabase course reads, passwordless email sign-in, student entitlement reads, payment-request inserts, admin approval grants, POS Quick-Grant, course-price updates, and single-device session RPC calls are implemented.
- [x] `pnpm typecheck` and `pnpm build` pass after the production hardening changes; the production server smoke test returns HTTP 200 for all application routes.

## Blocked pending user action

- [ ] Run `supabase/migrations/001_safelearn.sql` in the live Supabase SQL Editor. The current project check reached Supabase successfully, but `public.courses` does not exist yet.
- [ ] After the migration, rerun `pnpm bootstrap:supabase` to seed the records and promote `safelearn.contact@gmail.com` and `abdulrecapsall@gmail.com` if those Auth users have been registered.
- [ ] Provide the real Bunny.net or Cloudflare Stream URLs and replace the placeholder lesson slots.
- [ ] Provide the Netlify site and GitHub repository target before any deployment is attempted.
