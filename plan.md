# SafeLearn App — implementation plan

## Product scope
SafeLearn is a solo-admin academic video learning MVP for students buying individual courses or bundles in GHS. The experience prioritizes fast access, clear payment handoff, and visible ownership of each lesson.

## Implementation approach
- **Frontend:** Next.js App Router with TypeScript, Tailwind-compatible utility tokens in a global CSS layer, and Lucide icons.
- **Persistence for the preview MVP:** a small browser-backed demo store in `localStorage` keeps approvals, grants, and the active session usable across routes without requiring external credentials. The data model mirrors the planned backend entities.
- **Backend-ready model:** `supabase/migrations/001_safelearn.sql` contains the profiles, courses, lessons, access grants, and payment requests tables plus RLS policies for a future Supabase deployment. The UI keeps server boundaries narrow so the demo store can be replaced by Supabase queries.
- **Authentication/session behavior:** the preview includes a student/admin identity switch and a browser-backed `active_session_id` model. The lesson route continuously checks the active session and surfaces the requested forced-logout message when another device takes over.
- **Video protection:** the lesson screen uses an HTML5 video surface, animated watermark, right-click suppression, and common inspection-shortcut deterrents. These are deterrents rather than DRM; actual media protection remains the responsibility of Bunny.net Stream or Cloudflare Stream.
- **Admin operations:** course and lesson management is represented with editable local state; approvals and POS quick-grants update the same demo store used by the student dashboard.

## Project structure
- `app/` — App Router pages, metadata, global styles, and route manifest.
- `components/safelearn-ui.tsx` — shared visual system, app shell, catalog, dashboard, admin panels, lesson player, and interaction logic.
- `lib/demo-data.ts` — typed seed data and local-storage helpers.
- `supabase/migrations/` — production-oriented schema/RLS starting point.
- `app.config.ts` — project logo metadata.

## Design direction

### Style options
- **Quiet signal / editorial fintech (0.07):** a dark ink canvas, warm paper panels, and restrained amber accents that make trust and progress feel tangible.
- **Campus utility / soft civic (0.06):** chalky neutrals, blue-green status colors, and classroom-like information density.
- **Neon study lab / kinetic tech (0.05):** graphite surfaces, electric lime highlights, and more aggressive motion.

**Chosen direction: Quiet signal / editorial fintech.**

- **Design movement:** editorial fintech with a tactile paper-on-ink contrast and utilitarian status language.
- **Core principles:** make the next action obvious; expose trust signals near sensitive actions; use asymmetry to create a feeling of guided momentum; keep admin tools dense but calm.
- **Color philosophy:** deep ink provides focus and a protected feeling, bone panels keep study content readable, and saffron is the ownable signal color for action/progress. Mint is reserved for verified/approved states.
- **Layout paradigm:** a rail-and-canvas composition rather than centered marketing blocks. Pages use a strong left index/rail and offset content bands, with dashboard cards aligned like an operations board.
- **Signature elements:** a slim saffron “signal line” beside headings; pill-shaped status chips with short verbs; oversized numerals and eyebrow labels that feel like a course brief.
- **Interaction philosophy:** every mutation produces a small, explicit confirmation; payment and access states are never hidden behind vague copy; controls are keyboard-friendly and large enough for touch.
- **Animation:** only purposeful motion—watermark drift, soft card lift, progress shimmer, and a short pulse for newly approved access. Motion never blocks the primary action.
- **Typography system:** Geist Sans for navigation/body; a high-contrast serif accent for editorial section titles; tabular numerals for prices, progress, and queue counts.
- **Brand essence:** a calm academic access layer for students who need complex courses made manageable; **clear, protective, encouraging**.
- **Brand voice:** direct and warm. Example lines: “Pick up where the hard part starts.” / “Access is waiting for one clean approval.”
- **Wordmark & logo:** a compact “S” mark formed from two offset signal bars, paired with a quiet lowercase wordmark.
- **Signature brand color:** **Signal Saffron `#f4b544`**, used only for intentional progress and action.
