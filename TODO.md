# SafeLearn MVP outcomes

## Student catalog and access entry
- [ ] Students can view a clear grid of available courses and bundles with GHS prices.
- [ ] The catalog presents individual course access examples such as Course A = GHS 30, Course B = GHS 30, and Bundle = GHS 60.
- [ ] Students can open a payment handoff with manual Mobile Money instructions and submit a Transaction ID.
- [ ] A pending-approval state is visible after a self-serve request is submitted.

## Student dashboard and session lock
- [ ] “My Enrolled Courses” unlocks only courses that have been approved or manually granted.
- [ ] The active session model stores an `active_session_id` and replaces it when another device starts a session.
- [ ] An outdated device is blocked from lesson use and sees: “Logged in on another device. Please log in again to continue.”

## Protected lesson experience
- [ ] Lesson pages render a protected player container suitable for HLS, Bunny.net Stream, or Cloudflare Stream embeds.
- [ ] A visible watermark continuously shows the active student email/phone and moves smoothly to randomized positions every 5–10 seconds.
- [ ] Lesson pages suppress right-click and common inspection shortcuts including F12 and Ctrl+Shift+I.
- [ ] Each lesson includes a WhatsApp support action pre-populated with the lesson title.

## Solo-admin control center
- [ ] The admin can create/edit course records, GHS pricing, bundles, lessons, and hosted video URLs.
- [ ] The pending approvals queue has a one-click “Approve Access” action.
- [ ] POS Quick-Grant accepts a student email/phone and course selection, then grants access for cash or direct Mobile Money payments.

## Backend-ready security model
- [ ] The project includes a relational schema for profiles, courses, lessons, access grants, and payment requests.
- [ ] Row-level security policies restrict lesson/video-url reads to enrolled students or the sole admin.
