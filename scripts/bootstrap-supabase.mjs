import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment values. Configure the protected project secrets first.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const adminEmails = ["safelearn.contact@gmail.com", "abdulrecapsall@gmail.com"];
const courses = [
  {
    slug: "gis",
    code: "GIS",
    name: "Geographic Information System (GIS)",
    description: "Simplifying complex courses for academic excellence.",
    price_ghs: 30,
    is_bundle: false,
    published: true,
    lessons: [{ title: "Lesson 1: Introduction (Coming Soon)", module_label: "Module 01 / Foundations", duration_label: "Coming soon" }]
  },
  {
    slug: "decision-support-disaster-management",
    code: "DSS-DM",
    name: "Decision Support for Disaster Management",
    description: "Simplifying complex courses for academic excellence.",
    price_ghs: 30,
    is_bundle: false,
    published: true,
    lessons: [{ title: "Lesson 1: Introduction (Coming Soon)", module_label: "Module 01 / Foundations", duration_label: "Coming soon" }]
  },
  {
    slug: "gis-dss-dm-complete-package",
    code: "BUNDLE",
    name: "GIS & DSS-DM Complete Package (Courses A + B)",
    description: "Both SafeLearn pathways in one complete package.",
    price_ghs: 60,
    is_bundle: true,
    published: true,
    lessons: []
  }
];

const { data: existingCourses, error: schemaError } = await supabase.from("courses").select("id,slug").limit(1);
if (schemaError) {
  console.error(`Supabase schema check failed: ${schemaError.message}`);
  console.error("Run supabase/migrations/001_safelearn.sql in the Supabase SQL Editor, then rerun this script.");
  process.exit(2);
}

for (const course of courses) {
  const { data: savedCourse, error: courseError } = await supabase
    .from("courses")
    .upsert({
      slug: course.slug,
      code: course.code,
      name: course.name,
      description: course.description,
      price_ghs: course.price_ghs,
      is_bundle: course.is_bundle,
      published: course.published
    }, { onConflict: "slug" })
    .select("id,slug")
    .single();

  if (courseError) {
    console.error(`Course seed failed for ${course.slug}: ${courseError.message}`);
    process.exit(3);
  }

  for (const lesson of course.lessons) {
    const { data: foundLesson, error: lessonLookupError } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", savedCourse.id)
      .eq("title", lesson.title)
      .maybeSingle();

    if (lessonLookupError) {
      console.error(`Lesson lookup failed for ${course.slug}: ${lessonLookupError.message}`);
      process.exit(4);
    }

    if (!foundLesson) {
      const { error: lessonError } = await supabase.from("lessons").insert({
        course_id: savedCourse.id,
        title: lesson.title,
        module_label: lesson.module_label,
        duration_label: lesson.duration_label,
        video_url: "",
        stream_type: "placeholder",
        sort_order: 0
      });
      if (lessonError) {
        console.error(`Lesson seed failed for ${course.slug}: ${lessonError.message}`);
        process.exit(5);
      }
    }
  }
}

const { data: userPage, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (usersError) {
  console.error(`Auth user lookup failed: ${usersError.message}`);
  process.exit(6);
}

const usersByEmail = new Map((userPage?.users ?? []).map((user) => [user.email?.toLowerCase(), user]));
const missingAdmins = [];
for (const email of adminEmails) {
  const user = usersByEmail.get(email.toLowerCase());
  if (!user) {
    missingAdmins.push(email);
    continue;
  }
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name || email.split("@")[0],
    role: "admin"
  }, { onConflict: "id" });
  if (profileError) {
    console.error(`Admin bootstrap failed for ${email}: ${profileError.message}`);
    process.exit(7);
  }
}

console.log(JSON.stringify({
  status: "ok",
  seededCourses: courses.length,
  placeholderLessonSlots: courses.reduce((sum, course) => sum + course.lessons.length, 0),
  promotedAdminEmails: adminEmails.filter((email) => !missingAdmins.includes(email)),
  missingAdminEmails: missingAdmins
}, null, 2));
