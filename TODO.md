# SafeLearn MVP outcomes

## Delivered in the managed Preview

- [x] Students can view a clear grid of available courses and bundles with GHS prices, including Course A = GHS 30, Course B = GHS 30, and Bundle = GHS 60.
- [x] The catalog opens a manual Mobile Money flow with instructions, contact details, Transaction ID submission, and a visible pending-approval state.
- [x] “My Enrolled Courses” is driven by course-level demo entitlements and links into the protected lesson route.
- [x] The active session model stores an `active_session_id` in the demo store, replaces it when another device takes over, and displays “Logged in on another device. Please log in again to continue.” on the stale device.
- [x] Lesson pages render a protected player surface with an HTML5 demo source that is explicitly ready to swap for Bunny.net Stream or Cloudflare Stream HLS embeds.
- [x] A visible watermark shows the active student email/phone and moves smoothly to randomized positions every 7 seconds.
- [x] Lesson pages suppress right-click and common inspection shortcuts including F12 and Ctrl+Shift+I.
- [x] Each lesson includes a WhatsApp support action pre-populated with the current lesson title.
- [x] The admin console includes course pricing/content controls, a pending approvals queue with one-click “Approve Access,” and a POS Quick-Grant using student email/phone and course selection.
- [x] The project includes a Supabase-ready relational schema with Row Level Security policies that restrict lesson/video-url reads to enrolled students or the sole admin.

## Production hookup still needed

- [ ] Add the real Supabase project URL/anon key and replace the browser-backed demo store with Supabase Auth, profiles, access grants, payment requests, and live admin mutations.
- [ ] Replace the demo MP4 lesson sources with the instructor’s Bunny.net Stream or Cloudflare Stream HLS/embed URLs and configure the final payment instructions.
