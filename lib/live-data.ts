import { AccessGrant, Course, Lesson, PaymentRequest } from "@/lib/demo-data";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type CourseRow = {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  price_ghs: number;
  is_bundle: boolean;
  lessons: Array<{
    id: string;
    title: string;
    module_label: string;
    duration_label: string;
    video_url: string;
    stream_type: string;
    sort_order: number;
  }>;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "student" | "admin";
  active_session_id: string | null;
};

export type StudentSnapshot = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  activeSessionId: string;
  grantedAccess: AccessGrant[];
  requests: PaymentRequest[];
};

export type AdminSnapshot = {
  requests: PaymentRequest[];
  activeLearners: number;
  collectedAmount: number;
};

function authRequired() {
  return new Error("AUTH_REQUIRED: Please sign in with your SafeLearn email to continue.");
}

function courseSlugForId(courses: Course[], databaseId: string) {
  return courses.find((course) => course.databaseId === databaseId)?.id ?? databaseId;
}

export async function fetchLiveCourses(): Promise<Course[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id,slug,code,name,description,price_ghs,is_bundle,lessons(id,title,module_label,duration_label,video_url,stream_type,sort_order)")
    .eq("published", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Could not load courses: ${error.message}`);

  return ((data ?? []) as CourseRow[]).map((row, index) => ({
    id: row.slug,
    databaseId: row.id,
    code: row.code,
    name: row.name,
    eyebrow: row.is_bundle ? "Bundle · complete package" : `Course ${String.fromCharCode(65 + index)} · GHS ${Number(row.price_ghs).toFixed(0)}`,
    description: row.description,
    price: Number(row.price_ghs),
    accent: row.is_bundle ? "blue" : index % 2 === 0 ? "saffron" : "mint",
    enrolledCount: 0,
    lessons: (row.lessons ?? []).sort((a, b) => a.sort_order - b.sort_order).map<Lesson>((lesson) => ({
      id: lesson.id,
      courseId: row.slug,
      title: lesson.title,
      duration: lesson.duration_label,
      module: lesson.module_label,
      videoUrl: lesson.video_url,
      streamType: lesson.stream_type,
      summary: lesson.stream_type === "placeholder" ? "This lesson is ready for its protected instructor stream." : "Protected SafeLearn lesson."
    }))
  })) as Course[];
}

export async function fetchStudentSnapshot(courses: Course[]): Promise<StudentSnapshot> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw authRequired();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,full_name,email,phone,role,active_session_id")
    .eq("id", user.id)
    .single();
  if (profileError) throw new Error(`Could not load your profile: ${profileError.message}`);

  const { data: grants, error: grantsError } = await supabase
    .from("access_grants")
    .select("course_id,source")
    .eq("profile_id", user.id);
  if (grantsError) throw new Error(`Could not load course access: ${grantsError.message}`);

  const { data: requests, error: requestsError } = await supabase
    .from("payment_requests")
    .select("id,course_id,contact,transaction_id,amount_ghs,status,created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  if (requestsError) throw new Error(`Could not load payment requests: ${requestsError.message}`);

  const typedProfile = profile as ProfileRow;
  return {
    userId: user.id,
    name: typedProfile.full_name || user.email?.split("@")[0] || "Student",
    email: typedProfile.email || user.email || "",
    phone: typedProfile.phone || "",
    activeSessionId: typedProfile.active_session_id || "",
    grantedAccess: ((grants ?? []) as Array<{ course_id: string; source: AccessGrant["source"] }>).map((grant) => ({
      contact: typedProfile.email || user.email || user.id,
      courseId: courseSlugForId(courses, grant.course_id),
      source: grant.source
    })),
    requests: ((requests ?? []) as Array<{ id: string; course_id: string; contact: string; transaction_id: string; amount_ghs: number; status: PaymentRequest["status"]; created_at: string }>).map((request) => ({
      id: request.id,
      student: typedProfile.full_name || user.email || "Student",
      contact: request.contact,
      courseId: courseSlugForId(courses, request.course_id),
      amount: Number(request.amount_ghs),
      transactionId: request.transaction_id,
      submittedAt: new Date(request.created_at).toLocaleDateString(),
      status: request.status === "approved" ? "approved" : "pending"
    }))
  };
}

export async function fetchAdminSnapshot(courses: Course[]): Promise<AdminSnapshot> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw authRequired();

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profileError) throw new Error(`Could not load admin profile: ${profileError.message}`);
  if ((profile as { role: string }).role !== "admin") throw new Error("ADMIN_REQUIRED: This area is restricted to the SafeLearn administrators.");

  const { data: requests, error: requestsError } = await supabase
    .from("payment_requests")
    .select("id,course_id,contact,transaction_id,amount_ghs,status,created_at,profiles(full_name,email)")
    .order("created_at", { ascending: false });
  if (requestsError) throw new Error(`Could not load approval queue: ${requestsError.message}`);

  const { count: activeLearners, error: learnerError } = await supabase.from("access_grants").select("profile_id", { count: "exact", head: true });
  if (learnerError) throw new Error(`Could not load learner count: ${learnerError.message}`);

  const approved = ((requests ?? []) as Array<{ amount_ghs: number; status: string }>).filter((request) => request.status === "approved");
  return {
    activeLearners: activeLearners ?? 0,
    collectedAmount: approved.reduce((total, request) => total + Number(request.amount_ghs), 0),
    requests: ((requests ?? []) as Array<{ id: string; course_id: string; contact: string; transaction_id: string; amount_ghs: number; status: PaymentRequest["status"]; created_at: string; profiles?: { full_name?: string | null; email?: string | null } | null }>).map((request) => ({
      id: request.id,
      student: request.profiles?.full_name || request.profiles?.email || "Student",
      contact: request.contact,
      courseId: courseSlugForId(courses, request.course_id),
      amount: Number(request.amount_ghs),
      transactionId: request.transaction_id,
      submittedAt: new Date(request.created_at).toLocaleDateString(),
      status: request.status === "approved" ? "approved" : "pending"
    }))
  };
}

export async function startLiveSession(sessionId: string) {
  const { error } = await getSupabaseBrowserClient().rpc("set_active_session", { next_session_id: sessionId });
  if (error) throw new Error(`Could not start this device session: ${error.message}`);
}

export async function submitLivePaymentRequest(course: Course, contact: string, transactionId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw authRequired();
  if (!course.databaseId) throw new Error("This course is not connected to the live Supabase catalogue yet.");

  const { error } = await supabase.from("payment_requests").insert({
    profile_id: user.id,
    course_id: course.databaseId,
    contact,
    transaction_id: transactionId,
    amount_ghs: course.price,
    status: "pending"
  });
  if (error) throw new Error(`Could not submit payment request: ${error.message}`);
}

export async function approveLivePaymentRequest(requestId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data: request, error: requestError } = await supabase.from("payment_requests").select("profile_id,course_id").eq("id", requestId).single();
  if (requestError) throw new Error(`Could not load payment request: ${requestError.message}`);
  const { data: course, error: courseError } = await supabase.from("courses").select("is_bundle").eq("id", request.course_id).single();
  if (courseError) throw new Error(`Could not load course entitlement: ${courseError.message}`);

  let courseIds = [request.course_id];
  if (course.is_bundle) {
    const { data: componentCourses, error: componentError } = await supabase.from("courses").select("id").eq("published", true).eq("is_bundle", false);
    if (componentError) throw new Error(`Could not resolve bundle courses: ${componentError.message}`);
    courseIds = (componentCourses ?? []).map((item) => item.id);
  }

  const { error: grantError } = await supabase.from("access_grants").upsert(courseIds.map((courseId) => ({ profile_id: request.profile_id, course_id: courseId, source: course.is_bundle ? "bundle" : "self_serve" })), { onConflict: "profile_id,course_id" });
  if (grantError) throw new Error(`Could not grant course access: ${grantError.message}`);
  const { error: updateError } = await supabase.from("payment_requests").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", requestId);
  if (updateError) throw new Error(`Could not approve payment request: ${updateError.message}`);
}

export async function grantLiveAccess(contact: string, course: Course) {
  const supabase = getSupabaseBrowserClient();
  let { data: profile } = await supabase.from("profiles").select("id").eq("email", contact).maybeSingle();
  if (!profile) ({ data: profile } = await supabase.from("profiles").select("id").eq("phone", contact).maybeSingle());
  if (!profile) throw new Error("No registered student matches that email or phone. Ask the student to sign in once, then try again.");
  if (!course.databaseId) throw new Error("Select a live course before granting access.");

  let courseIds = [course.databaseId];
  if (course.code === "BUNDLE") {
    const { data: componentCourses, error } = await supabase.from("courses").select("id").eq("published", true).eq("is_bundle", false);
    if (error) throw new Error(`Could not resolve bundle courses: ${error.message}`);
    courseIds = (componentCourses ?? []).map((item) => item.id);
  }
  const { error } = await supabase.from("access_grants").upsert(courseIds.map((courseId) => ({ profile_id: profile.id, course_id: courseId, source: course.code === "BUNDLE" ? "bundle" : "pos" })), { onConflict: "profile_id,course_id" });
  if (error) throw new Error(`Could not grant access: ${error.message}`);
}

export async function updateLiveCourse(course: Course, price: number) {
  if (!course.databaseId) throw new Error("Select a live course before saving.");
  const { error } = await getSupabaseBrowserClient().from("courses").update({ price_ghs: price }).eq("id", course.databaseId);
  if (error) throw new Error(`Could not save course pricing: ${error.message}`);
}

export async function sendMagicLink(email: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  if (error) throw new Error(`Could not send sign-in link: ${error.message}`);
}
