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

## Previously completed external setup

- [x] Run the primary schema migration and seed the live Supabase catalogue.
- [x] Promote the registered SafeLearn administrator accounts and apply the admin content-management policies.
- [x] Add and verify the GIS protected-player demo lesson in the live database.
- [ ] Provide the real Bunny.net or Cloudflare Stream URLs and replace the placeholder lesson slots.
- [ ] Confirm the Netlify deployment target for the latest checkpoint.

## Production hardening completed

- [x] Live payment snapshots preserve pending, approved, and rejected states.
- [x] Duplicate transaction IDs are rejected in the client flow, and migration `003_safelearn_hardening.sql` adds a database-level unique index after duplicate review.
- [x] Admin queue has approve and reject actions with confirmation for rejection.
- [x] Course prices, lesson URLs, and lesson ordering are validated; new lessons receive the next sequential sort order.
- [x] Production shell no longer presents a fake student identity or “Preview mode”; authenticated users see their email and can sign out.
- [x] Protected playback pauses when the active device session becomes stale and disables common download/PiP controls where supported.
- [x] The admin test-video shortcut uses a verified public MP4 and labels it as test-only.
- [x] A durable SafeLearn logo asset and `.env.example` public MoMo configuration placeholders are included.

## Remaining before public launch

- [ ] Configure `NEXT_PUBLIC_MOMO_NUMBER` and `NEXT_PUBLIC_MOMO_NAME` in the deployed environment with the final recipient details.
- [ ] Run `supabase/migrations/003_safelearn_hardening.sql` in the live Supabase SQL Editor; resolve any duplicate transaction IDs if reported.
- [ ] Replace every real lesson placeholder/test URL with Bunny.net or Cloudflare Stream playback URLs.
- [ ] Configure signed/expiring playback URLs and host/domain restrictions at Bunny.net or Cloudflare; browser watermarks and shortcut blocking are deterrents, not DRM.
- [ ] Confirm Supabase Auth Site URL and redirect URLs match the final Netlify domain.
- [ ] Deploy the latest checkpoint to Netlify and verify that the live site contains the new admin builder and account controls.
- [ ] Test the complete mobile workflow: sign-in, payment request, admin approve/reject, student refresh, protected playback, WhatsApp support, and second-device session lock.
