import { Course, Lesson, PaymentRequest } from "@/lib/demo-data";
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

export async function submitLivePaymentRequest(course: Course, contact: string, transactionId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Please sign in before submitting a payment request.");
  }
  if (!course.databaseId) {
    throw new Error("This course is not connected to the live Supabase catalogue yet.");
  }

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

export async function sendMagicLink(email: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) throw new Error(`Could not send sign-in link: ${error.message}`);
}

export type LivePaymentRequest = PaymentRequest & { databaseId: string };
