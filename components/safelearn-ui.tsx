"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Headphones,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeft,
  Play,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TicketCheck,
  UserRound,
  UsersRound,
  Video,
  X,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchLiveCourses, sendMagicLink, submitLivePaymentRequest } from "@/lib/live-data";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  Course,
  DemoState,
  demoStudent,
  findCourse,
  findLesson,
  formatGhs,
  getDemoState,
  getSeedState,
  hasCourseAccess,
  Lesson,
  saveDemoState,
  supportWhatsAppNumber,
  withCourseGrant
} from "@/lib/demo-data";

const navItems = [
  { href: "/", label: "Catalog", icon: BookOpen },
  { href: "/student", label: "My learning", icon: LayoutDashboard },
  { href: "/admin", label: "Admin console", icon: PanelLeft }
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand ${compact ? "brand-compact" : ""}`} aria-label="SafeLearn home">
      <span className="brand-mark"><span className="brand-bar brand-bar-one" /><span className="brand-bar brand-bar-two" /></span>
      <span className="brand-copy"><strong>safelearn</strong><small>academic access, simplified</small></span>
    </Link>
  );
}

export function AppShell({ children, eyebrow = "Student access layer" }: { children: React.ReactNode; eyebrow?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app-frame">
      <aside className={`side-rail ${mobileOpen ? "side-rail-open" : ""}`}>
        <div className="rail-top"><BrandMark /></div>
        <div className="rail-label">Workspace</div>
        <nav className="rail-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`rail-link ${active ? "active" : ""}`}><Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{active && <span className="rail-dot" />}</Link>;
          })}
        </nav>
        <div className="rail-bottom">
          <div className="rail-note"><ShieldCheck size={17} /><div><strong>Protected by design</strong><span>One active device · visible identity</span></div></div>
          <div className="profile-mini"><span className="avatar">AO</span><div><strong>Ama Owusu</strong><span>student account</span></div><MoreHorizontal size={17} /></div>
        </div>
      </aside>
      <main className="main-canvas">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation"><Menu size={20} /></button><span className="topbar-kicker">{eyebrow}</span></div>
          <div className="topbar-actions"><span className="live-pill"><span className="live-dot" />Preview mode</span><Link href="/admin" className="topbar-admin">Open control center <ArrowRight size={15} /></Link></div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function StatusChip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "blue" }) {
  return <span className={`status-chip status-${tone}`}><span className="status-chip-dot" />{children}</span>;
}

export function SectionHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" />{eyebrow}</div><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{action}</div>;
}

function CourseCard({ course, index, enrolled = false, onBuy }: { course: Course; index: number; enrolled?: boolean; onBuy?: (course: Course) => void }) {
  const accentClass = `course-accent-${course.accent}`;
  return <article className={`course-card ${accentClass}`}>
    <div className="course-card-top"><span className="course-code">{course.code}</span><span className="course-index">0{index + 1}</span></div>
    <div className="course-icon"><GraduationCap size={21} /></div>
    <div className="course-copy"><span className="course-eyebrow">{course.eyebrow}</span><h3>{course.name}</h3><p>{course.description}</p></div>
    <div className="course-card-bottom"><div><span className="price-label">course access</span><strong>{formatGhs(course.price)}</strong></div>{enrolled ? <Link href={course.lessons[0] ? `/learn/${course.lessons[0].id}` : "/student"} className="icon-button" aria-label="Continue course"><Play size={17} fill="currentColor" /></Link> : <button className="text-button" onClick={() => onBuy?.(course)}>Request access <ArrowRight size={15} /></button>}</div>
  </article>;
}

export function HomePage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [toast, setToast] = useState("");
  const [state, setState] = useState<DemoState>(() => getSeedState());
  useEffect(() => {
    fetchLiveCourses().then((courses) => setState((current) => ({ ...current, courses }))).catch(() => undefined);
  }, []);
  const setToastMessage = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  return <AppShell eyebrow="Student access layer">
    <div className="page-wrap home-page">
      <section className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />Simplifying complex courses for academic excellence.</div>
          <h1>The hard part, <em>made clear.</em></h1>
          <p className="hero-lede">Short, protected lessons for the topics that usually take three explanations. Choose your course, send your MoMo reference, and keep moving.</p>
          <div className="hero-actions"><Link href="#courses" className="primary-button">Browse courses <ArrowRight size={17} /></Link><Link href="/student" className="secondary-button">Open my learning <LayoutDashboard size={16} /></Link></div>
          <div className="trust-row"><div className="trust-item"><ShieldCheck size={17} /><span>Visible student watermark</span></div><div className="trust-item"><LockKeyhole size={17} /><span>One-device sessions</span></div></div>
        </div>
        <div className="hero-brief">
          <div className="brief-head"><span>THIS WEEK / ACCESS BRIEF</span><span className="brief-mark"><Sparkles size={15} /></span></div>
          <div className="brief-number">03</div>
          <div className="brief-label">focused pathways</div>
          <div className="brief-divider" />
          <div className="brief-row"><span>Average lesson</span><strong>18 min</strong></div><div className="brief-row"><span>Support layer</span><strong>WhatsApp</strong></div><div className="brief-row"><span>Approval window</span><strong>Same day</strong></div>
          <div className="brief-foot"><span className="signal-pulse" />Built for the next study session</div>
        </div>
      </section>

      <section className="signal-strip"><div className="signal-item"><span className="signal-number">01</span><div><strong>Pick a pathway</strong><span>Course or bundle</span></div></div><div className="signal-arrow"><ArrowRight size={17} /></div><div className="signal-item"><span className="signal-number">02</span><div><strong>Send your reference</strong><span>Manual MoMo handoff</span></div></div><div className="signal-arrow"><ArrowRight size={17} /></div><div className="signal-item"><span className="signal-number">03</span><div><strong>Get to the lesson</strong><span>Access after approval</span></div></div></section>

      <section id="courses" className="content-section"><SectionHeading eyebrow="Course catalog / 2026" title="Pick the topic that keeps circling back." copy="Every pathway is built around a clear first win. Start small, then stack your progress." action={<div className="section-meta"><span className="meta-count">{String(state.courses.length).padStart(2, "0")}</span><span>active pathways</span></div>} />
        <div className="course-grid">{state.courses.map((course, index) => <CourseCard key={course.id} course={course} index={index} onBuy={setSelectedCourse} />)}</div>
      </section>

      <section className="feature-band"><div className="feature-band-mark"><Video size={22} /></div><div><div className="eyebrow"><span className="eyebrow-line" />Once access is yours</div><h2>Study with a little less friction.</h2><p>Watch from one active device, keep your identity visible on the player, and ask the instructor the exact question you are stuck on.</p></div><Link href="/student" className="feature-band-link">See my learning <ArrowRight size={16} /></Link></section>

      <footer className="site-footer"><BrandMark compact /><div><span>SafeLearn App · Ghana</span><span>Manual payments · protected lessons · one clear next step</span></div><Link href="/admin" className="footer-link">Admin sign-in <ArrowRight size={14} /></Link></footer>
    </div>
    {selectedCourse && <PaymentModal course={selectedCourse} onClose={() => setSelectedCourse(null)} onSubmitted={(message) => { setSelectedCourse(null); setToastMessage(message); }} />}
    {toast && <Toast message={toast} />}
  </AppShell>;
}

function PaymentModal({ course, onClose, onSubmitted }: { course: Course; onClose: () => void; onSubmitted: (message: string) => void }) {
  const [transactionId, setTransactionId] = useState("");
  const [contact, setContact] = useState(demoStudent.phone);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (!transactionId.trim()) return;
    setSubmitting(true); setError("");
    try {
      const { data: { user } } = await getSupabaseBrowserClient().auth.getUser();
      if (!user) {
        await sendMagicLink(contact.trim());
        onSubmitted("Check your email for a secure SafeLearn sign-in link, then resubmit your payment reference.");
        return;
      }
      await submitLivePaymentRequest(course, contact.trim(), transactionId.trim());
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit the payment request.");
    } finally { setSubmitting(false); }
  };
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Request course access"><div className="payment-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>{submitted ? <div className="modal-success"><div className="success-icon"><Check size={24} /></div><div className="eyebrow"><span className="eyebrow-line" />Reference received</div><h2>Access is in the queue.</h2><p>We will match <strong>{transactionId}</strong> to your {course.name} request and unlock the course after approval.</p><div className="receipt-row"><span>Course</span><strong>{course.name}</strong></div><div className="receipt-row"><span>Amount</span><strong>{formatGhs(course.price)}</strong></div></div> : <><div className="modal-kicker">REQUEST ACCESS / {course.code}</div><h2>Make the handoff, then keep studying.</h2><p className="modal-lede">Send {formatGhs(course.price)} to the MoMo number below. Then paste your transaction ID so the admin can approve your access.</p><div className="momo-card"><div className="momo-icon"><Smartphone size={18} /></div><div><span>Mobile Money</span><strong>Payment number pending</strong><small>Configure the final MoMo number before launch.</small></div></div><label className="field-label">Your email<input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="you@example.com" type="email" /></label><label className="field-label">Transaction ID<input value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="e.g. MOMO-816204" /></label>{error && <div className="stale-alert"><span>{error}</span></div>}<button className="primary-button full-button" onClick={submit} disabled={!transactionId.trim() || !contact.trim() || submitting}>{submitting ? "Sending…" : "Submit for approval"} <Send size={16} /></button><div className="modal-footnote"><ShieldCheck size={15} /> Approval is manual and usually same day.</div></>}</div></div>;
}

export function StudentDashboard() {
  const [state, setState] = useState<DemoState>(() => getSeedState());
  const [currentSession, setCurrentSession] = useState("");
  const [sessionStale, setSessionStale] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    const loaded = getDemoState();
    setState(loaded);
    const ownSession = window.sessionStorage.getItem("safelearn-session-id") ?? (loaded.activeSessionId || `device-${Date.now()}`);
    window.sessionStorage.setItem("safelearn-session-id", ownSession);
    setCurrentSession(ownSession);
    if (!loaded.activeSessionId) { const next = { ...loaded, activeSessionId: ownSession }; saveDemoState(next); setState(next); }
    const check = window.setInterval(() => { const latest = getDemoState(); setSessionStale(Boolean(latest.activeSessionId && latest.activeSessionId !== ownSession)); }, 1000);
    return () => window.clearInterval(check);
  }, []);
  useEffect(() => { fetchLiveCourses().then((courses) => setState((current) => ({ ...current, courses }))).catch(() => undefined); }, []);
  const enrolled = state.courses.filter((course) => course.id !== "bundle" && hasCourseAccess(state, demoStudent.email, course.id));
  const pending = state.requests.filter((request) => request.contact === demoStudent.phone || request.contact === demoStudent.email).find((request) => request.status === "pending");
  const nextLesson = enrolled.flatMap((course) => course.lessons).find(Boolean);
  const takeOver = () => { const latest = { ...getDemoState(), activeSessionId: `device-${Date.now()}` }; saveDemoState(latest); setToast("A new device took over the account. This tab will be locked."); };
  const resume = () => { const latest = { ...getDemoState(), activeSessionId: currentSession }; saveDemoState(latest); setSessionStale(false); setToast("This device is active again."); };
  return <AppShell eyebrow="My learning / Ama Owusu"><div className="page-wrap dashboard-page"><div className="dashboard-header"><div><div className="eyebrow"><span className="eyebrow-line" />Student dashboard / 01</div><h1>Keep the hard part <em>moving.</em></h1><p>Good to see you, Ama. Your enrolled lessons and next best action are here.</p></div><div className="identity-card"><span className="avatar avatar-large">AO</span><div><strong>{demoStudent.name}</strong><span>{demoStudent.email}</span></div><StatusChip tone="success">verified</StatusChip></div></div>
    <div className="dashboard-metrics"><div className="metric-card"><span>Active pathways</span><strong>02</strong><small>one lesson ready now</small></div><div className="metric-card metric-card-saffron"><span>Study streak</span><strong>04 <small>days</small></strong><small>keep the signal alive</small></div><div className="metric-card"><span>Session status</span><strong className="metric-status"><span className="live-dot" />{sessionStale ? "locked" : "active"}</strong><small>one device at a time</small></div></div>
    <section className="session-lock-banner"><div className="session-lock-icon"><KeyRound size={20} /></div><div><strong>Single-device session is on.</strong><span>Starting a session elsewhere signs this device out before a lesson can load.</span></div><button className="secondary-button compact-button" onClick={takeOver}>Simulate another device <Smartphone size={15} /></button></section>
    {sessionStale && <div className="stale-alert"><div><LockKeyhole size={18} /><div><strong>Logged in on another device.</strong><span>Please log in again to continue.</span></div></div><button className="primary-button compact-button" onClick={resume}>Reactivate this device <RotateCcw size={15} /></button></div>}
    <section className="content-section compact-section"><SectionHeading eyebrow="My enrolled courses" title="Your study shelf" copy="Approved access appears here. Your next lesson is one tap away." action={<span className="section-meta">{enrolled.length} pathways</span>} /><div className="enrolled-list">{enrolled.map((course, index) => { const lesson = course.lessons[0]; return <article className="enrolled-card" key={course.id}><div className={`enrolled-number enrolled-number-${course.accent}`}>0{index + 1}</div><div className="enrolled-main"><div className="course-card-top"><span className="course-code">{course.code}</span><StatusChip tone="success">access granted</StatusChip></div><h3>{course.name}</h3><p>{course.lessons.length} short lessons · {course.enrolledCount} learners taking this path</p><div className="progress-line"><span style={{ width: index === 0 ? "42%" : "18%" }} /></div><div className="progress-label"><span>{index === 0 ? "42% complete" : "Ready to start"}</span><span>{course.lessons.length} lessons</span></div></div><div className="enrolled-action">{lesson ? <Link href={`/learn/${lesson.id}`} className="primary-button compact-button">Continue <ArrowRight size={15} /></Link> : <span className="status-chip">Coming soon</span>}</div></article>; })}</div></section>
    <section className="dashboard-lower"><div className="next-card"><div className="eyebrow"><span className="eyebrow-line" />Next up</div><h3>{nextLesson?.title ?? "Your first lesson is coming soon."}</h3><p>{nextLesson?.summary ?? "Approved course access and instructor video slots will appear here."}</p>{nextLesson ? <Link href={`/learn/${nextLesson.id}`} className="text-button">Resume lesson <Play size={15} fill="currentColor" /></Link> : <span className="text-button">Coming soon</span>}</div><div className="pending-card"><div className="pending-card-top"><div className="eyebrow"><span className="eyebrow-line" />Payment handoff</div>{pending ? <StatusChip tone="warning">awaiting approval</StatusChip> : <StatusChip tone="success">all clear</StatusChip>}</div><h3>{pending ? "Your request is in the queue." : "No payment actions waiting."}</h3><p>{pending ? `We are matching ${pending.transactionId} to ${findCourse(pending.courseId, state.courses).name}.` : "Browse the catalog when you are ready for another pathway."}</p><Link href="/" className="secondary-button compact-button">Browse catalog <ArrowRight size={15} /></Link></div></section>
    <section className="help-strip"><div className="help-icon"><Headphones size={19} /></div><div><strong>Need a second explanation?</strong><span>Open WhatsApp below any lesson and send the exact title you are stuck on.</span></div><a className="whatsapp-link" href={`https://wa.me/${supportWhatsAppNumber}?text=${encodeURIComponent("Hi SafeLearn, I am stuck on a lesson.")}`} target="_blank" rel="noreferrer">Ask on WhatsApp <ExternalLink size={15} /></a></section>
  </div>{toast && <Toast message={toast} />}</AppShell>;
}

export function AdminDashboard() {
  const [state, setState] = useState<DemoState>(() => getSeedState());
  const [selectedCourseId, setSelectedCourseId] = useState("course-a");
  const [studentContact, setStudentContact] = useState("");
  const [grantCourseId, setGrantCourseId] = useState("course-a");
  const [toast, setToast] = useState("");
  const [draftPrice, setDraftPrice] = useState("30");
  useEffect(() => { const loaded = getDemoState(); setState(loaded); setDraftPrice(String(loaded.courses[0]?.price ?? 30)); fetchLiveCourses().then((courses) => setState((current) => ({ ...current, courses }))).catch(() => undefined); }, []);
  const pending = state.requests.filter((request) => request.status === "pending");
  const currentCourse = state.courses.find((course) => course.id === selectedCourseId) ?? state.courses[0];
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  const approve = (id: string) => { const request = state.requests.find((item) => item.id === id); if (!request) return; const approvedState = { ...state, requests: state.requests.map((item) => item.id === id ? { ...item, status: "approved" as const } : item) }; const next = withCourseGrant(approvedState, request.contact, request.courseId, "approved"); setState(next); saveDemoState(next); notify(`Access approved for ${request.student}.`); };
  const grant = () => { if (!studentContact.trim()) return; const base = getDemoState(); const next = withCourseGrant(base, studentContact.trim(), grantCourseId, "pos"); saveDemoState(next); setState(next); notify(`${findCourse(grantCourseId, next.courses).name} granted to ${studentContact.trim()}.`); setStudentContact(""); };
  const saveCourse = () => { const next = { ...state, courses: state.courses.map((course) => course.id === currentCourse.id ? { ...course, price: Number(draftPrice) || course.price } : course) }; setState(next); saveDemoState(next); notify(`${currentCourse.name} pricing updated.`); };
  return <AppShell eyebrow="Solo admin / Control center"><div className="page-wrap admin-page"><div className="admin-header"><div><div className="eyebrow"><span className="eyebrow-line" />Solo admin / 04</div><h1>Make access <em>move.</em></h1><p>One clean queue for payments, content, and the students waiting to get started.</p></div><div className="admin-identity"><div className="admin-shield"><ShieldCheck size={23} /></div><div><strong>Instructor control center</strong><span>Only your approval unlocks a pathway.</span></div></div></div>
    <div className="admin-metrics"><div className="admin-stat"><span className="admin-stat-icon saffron"><Clock3 size={17} /></span><div><strong>{String(pending.length).padStart(2, "0")}</strong><span>pending approvals</span></div></div><div className="admin-stat"><span className="admin-stat-icon mint"><UsersRound size={17} /></span><div><strong>91</strong><span>active learners</span></div></div><div className="admin-stat"><span className="admin-stat-icon blue"><BarChart3 size={17} /></span><div><strong>GHS 2.7k</strong><span>this month / collected</span></div></div><div className="admin-stat"><span className="admin-stat-icon ink"><Zap size={17} /></span><div><strong>04m</strong><span>avg. approval time</span></div></div></div>
    <div className="admin-grid"><section className="admin-panel approvals-panel"><div className="panel-heading"><div><div className="eyebrow"><span className="eyebrow-line" />Queue / manual payments</div><h2>Pending approvals</h2></div><StatusChip tone={pending.length ? "warning" : "success"}>{pending.length ? `${pending.length} waiting` : "queue clear"}</StatusChip></div><div className="approval-list">{state.requests.map((request) => { const course = findCourse(request.courseId, state.courses); const approved = request.status === "approved"; return <div className={`approval-row ${approved ? "approval-approved" : ""}`} key={request.id}><div className="approval-avatar">{request.student.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div className="approval-person"><strong>{request.student}</strong><span>{request.contact}</span></div><div className="approval-course"><strong>{course.name}</strong><span>{request.transactionId} · {formatGhs(request.amount)}</span></div><div className="approval-time">{request.submittedAt}</div>{approved ? <StatusChip tone="success">approved</StatusChip> : <button className="approve-button" onClick={() => approve(request.id)}><Check size={15} /> Approve Access</button>}</div>; })}</div></section>
      <section className="admin-panel quick-grant-panel"><div className="panel-heading"><div><div className="eyebrow"><span className="eyebrow-line" />Point of sale / direct handoff</div><h2>Quick-Grant</h2></div><TicketCheck size={22} className="panel-icon" /></div><p className="panel-copy">Grant a pathway in seconds when payment happened in person or directly over MoMo.</p><label className="field-label">Student email or phone<input value={studentContact} onChange={(event) => setStudentContact(event.target.value)} placeholder="e.g. +233 24 555 0188" /></label><label className="field-label">Course access<select value={grantCourseId} onChange={(event) => setGrantCourseId(event.target.value)}>{state.courses.map((course) => <option key={course.id} value={course.id}>{course.name} · {formatGhs(course.price)}</option>)}</select></label><button className="primary-button full-button" onClick={grant} disabled={!studentContact.trim()}>Grant access <Zap size={16} /></button><div className="grant-note"><Check size={15} /> Access writes to the same entitlement layer as self-serve approvals.</div></section>
    </div>
    <div className="admin-grid second-admin-grid"><section className="admin-panel course-manager"><div className="panel-heading"><div><div className="eyebrow"><span className="eyebrow-line" />Content / pricing</div><h2>Course manager</h2></div><button className="icon-button subtle-icon" aria-label="Add course"><Plus size={17} /></button></div><div className="manager-course-tabs">{state.courses.map((course) => <button key={course.id} className={course.id === selectedCourseId ? "selected" : ""} onClick={() => { setSelectedCourseId(course.id); setDraftPrice(String(course.price)); }}>{course.code}</button>)}</div><div className="manager-editor"><div className="manager-preview"><span className={`manager-preview-icon course-accent-${currentCourse.accent}`}><GraduationCap size={22} /></span><div><span>{currentCourse.code}</span><strong>{currentCourse.name}</strong><small>{currentCourse.lessons.length} lessons · hosted video URLs ready</small></div></div><label className="field-label">Course price (GHS)<input value={draftPrice} onChange={(event) => setDraftPrice(event.target.value)} inputMode="numeric" /></label><label className="field-label">Video host policy<input value="Bunny.net / Cloudflare Stream embed" readOnly /></label><button className="secondary-button" onClick={saveCourse}>Save course changes <FileCheck2 size={15} /></button></div></section><section className="admin-panel admin-checklist"><div className="panel-heading"><div><div className="eyebrow"><span className="eyebrow-line" />Security / visibility</div><h2>Access guardrails</h2></div><LockKeyhole size={22} className="panel-icon" /></div><div className="guardrail-list"><div><span className="guardrail-check"><Check size={14} /></span><div><strong>RLS-ready lesson access</strong><span>Non-purchased lesson records stay out of student reads.</span></div></div><div><span className="guardrail-check"><Check size={14} /></span><div><strong>Moving student watermark</strong><span>Email / phone identity remains visible over every lesson.</span></div></div><div><span className="guardrail-check"><Check size={14} /></span><div><strong>One active device</strong><span>New login replaces the previous active session ID.</span></div></div><div><span className="guardrail-check"><Check size={14} /></span><div><strong>WhatsApp support handoff</strong><span>Each lesson opens with its title already in the message.</span></div></div></div><div className="admin-footer-note"><CircleHelp size={15} /> Change the content; keep the guardrails.</div></section></div>
  </div>{toast && <Toast message={toast} />}</AppShell>;
}

function Toast({ message }: { message: string }) { return <div className="toast"><span className="toast-icon"><Check size={14} /></span>{message}</div>; }

export function LessonPage({ lessonId }: { lessonId: string }) {
  const [state, setState] = useState<DemoState>(() => getSeedState());
  const [lesson, setLesson] = useState<Lesson | undefined>(() => findLesson(lessonId));
  const [sessionStale, setSessionStale] = useState(false);
  useEffect(() => {
    const loaded = getDemoState(); setState(loaded); setLesson(findLesson(lessonId, loaded.courses));
    const existingSession = window.sessionStorage.getItem("safelearn-session-id");
    const ownSession = existingSession ?? (loaded.activeSessionId || `device-${Date.now()}`);
    window.sessionStorage.setItem("safelearn-session-id", ownSession);
    const latest = getDemoState(); if (!latest.activeSessionId) saveDemoState({ ...latest, activeSessionId: ownSession });
    const check = window.setInterval(() => { const current = getDemoState(); setSessionStale(Boolean(current.activeSessionId && current.activeSessionId !== ownSession)); }, 800);
    return () => window.clearInterval(check);
  }, [lessonId]);
  useEffect(() => { fetchLiveCourses().then((courses) => { setState((current) => ({ ...current, courses })); setLesson(findLesson(lessonId, courses)); }).catch(() => undefined); }, [lessonId]);
  if (!lesson) return <AppShell eyebrow="Lesson not found"><div className="empty-state"><div className="empty-icon"><BookOpen size={23} /></div><h1>That lesson moved.</h1><p>Return to your learning shelf and pick the next clear step.</p><Link href="/student" className="primary-button">Back to learning <ArrowRight size={16} /></Link></div></AppShell>;
  const course = findCourse(lesson.courseId, state.courses);
  return <AppShell eyebrow={`Protected lesson / ${course.code}`}><div className="lesson-page"><div className="lesson-breadcrumb"><Link href="/student">My learning</Link><ChevronDown size={14} /><span>{course.name}</span><ChevronDown size={14} /><strong>{lesson.module}</strong></div><div className="lesson-heading"><div><div className="eyebrow"><span className="eyebrow-line" />{lesson.module}</div><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><div className="lesson-meta"><StatusChip tone="success">access granted</StatusChip><span><Clock3 size={15} /> {lesson.duration}</span></div></div><LessonPlayer lesson={lesson} locked={sessionStale} />{sessionStale && <div className="lesson-lockout"><div className="lockout-icon"><LockKeyhole size={22} /></div><div><strong>Logged in on another device.</strong><span>Please log in again to continue.</span></div><Link href="/student" className="secondary-button compact-button">Return to dashboard <ArrowRight size={15} /></Link></div>}<div className="lesson-support-row"><div className="support-prompt"><div className="help-icon"><Headphones size={18} /></div><div><strong>Stuck on this topic?</strong><span>Send the lesson title to the SafeLearn WhatsApp line.</span></div></div><a href={`https://wa.me/${supportWhatsAppNumber}?text=${encodeURIComponent(`Hi SafeLearn, I am stuck on: ${lesson.title}`)}`} target="_blank" rel="noreferrer" className="whatsapp-link">Ask on WhatsApp <ExternalLink size={15} /></a></div><div className="lesson-notes"><div><span className="eyebrow">Lesson note</span><p>Keep your own working visible while you watch. The fastest revision comes from pausing at the decision point, not the final answer.</p></div><div className="lesson-note-stat"><strong>01</strong><span>clear idea to keep</span></div><div className="lesson-note-stat"><strong>02</strong><span>minutes to reflect</span></div></div></div></AppShell>;
}

function LessonPlayer({ lesson, locked }: { lesson: Lesson; locked: boolean }) {
  const [position, setPosition] = useState({ top: 16, left: 12 });
  useEffect(() => { const move = () => setPosition({ top: 12 + Math.random() * 68, left: 8 + Math.random() * 72 }); move(); const timer = window.setInterval(move, 7000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { const stopMenu = (event: MouseEvent) => event.preventDefault(); const stopInspect = (event: KeyboardEvent) => { if (event.key === "F12" || (event.ctrlKey && event.shiftKey && ["I", "J", "C"].includes(event.key.toUpperCase()))) event.preventDefault(); }; document.addEventListener("contextmenu", stopMenu); document.addEventListener("keydown", stopInspect); return () => { document.removeEventListener("contextmenu", stopMenu); document.removeEventListener("keydown", stopInspect); }; }, []);
  return <div className={`player-shell ${locked ? "player-locked" : ""}`}><div className="player-topbar"><div><span className="player-live"><span className="live-dot" />Protected player</span><span className="player-host">{lesson.streamType}</span></div><div className="player-actions"><span><ShieldCheck size={14} /> identity visible</span><MoreHorizontal size={17} /></div></div><div className="player-stage">{lesson.videoUrl ? <video src={lesson.videoUrl} controls playsInline preload="metadata" aria-label={lesson.title} /> : <div className="player-placeholder"><span className="player-play"><Video size={20} /></span><strong>Video slot reserved</strong><span>The instructor stream will appear here when the Bunny.net or Cloudflare URL is added.</span></div>}<div className="player-vignette" /><div className="watermark" style={{ top: `${position.top}%`, left: `${position.left}%` }}><ShieldCheck size={13} /><span>{demoStudent.email}</span></div>{lesson.videoUrl && <div className="player-center-mark"><span className="player-play"><Play size={19} fill="currentColor" /></span><span>Lesson {lesson.id.split("-").pop()}</span></div>}{locked && <div className="player-lock-overlay"><LockKeyhole size={28} /><strong>Session paused</strong><span>This lesson is active on another device.</span></div>}</div><div className="player-footer"><span>Watermark moves every 7 seconds</span><span>Screen capture deterrents active</span><span>Access rule / enrolled students only</span></div></div>;
}
