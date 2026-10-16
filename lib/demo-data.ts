export type Course = {
  id: string;
  databaseId?: string;
  code: string;
  name: string;
  eyebrow: string;
  description: string;
  price: number;
  accent: "saffron" | "mint" | "blue";
  lessons: Lesson[];
  enrolledCount: number;
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  module: string;
  videoUrl: string;
  streamType: string;
  summary: string;
};

export type PaymentRequest = {
  id: string;
  student: string;
  contact: string;
  courseId: string;
  amount: number;
  transactionId: string;
  submittedAt: string;
  status: "pending" | "approved";
};

export type AccessGrant = {
  contact: string;
  courseId: string;
  source: "seed" | "approved" | "pos";
};

export type DemoState = {
  courses: Course[];
  requests: PaymentRequest[];
  grantedAccess: AccessGrant[];
  activeSessionId: string;
};

export const demoStudent = {
  name: "Student account",
  email: "student@example.com",
  phone: "+233 24 555 0188"
};

export const supportWhatsAppNumber = "233246912468";

const comingSoonLesson = (id: string, courseId: string, title: string): Lesson => ({
  id,
  courseId,
  title,
  duration: "Coming soon",
  module: "Module 01 / Foundations",
  videoUrl: "",
  streamType: "Placeholder · upload Bunny / Cloudflare URL",
  summary: "This lesson slot is ready for the instructor's protected stream. Simplifying complex courses for academic excellence."
});

export const seedCourses: Course[] = [
  {
    id: "course-a",
    code: "GIS",
    name: "Geographic Information System (GIS)",
    eyebrow: "Course A · GHS 30",
    description: "Simplifying complex courses for academic excellence.",
    price: 30,
    accent: "saffron",
    enrolledCount: 0,
    lessons: [comingSoonLesson("lesson-gis-1", "course-a", "Lesson 1: Introduction (Coming Soon)")]
  },
  {
    id: "course-b",
    code: "DSS-DM",
    name: "Decision Support for Disaster Management",
    eyebrow: "Course B · GHS 30",
    description: "Simplifying complex courses for academic excellence.",
    price: 30,
    accent: "mint",
    enrolledCount: 0,
    lessons: [comingSoonLesson("lesson-dss-dm-1", "course-b", "Lesson 1: Introduction (Coming Soon)")]
  },
  {
    id: "bundle",
    code: "BUNDLE",
    name: "GIS & DSS-DM Complete Package (Courses A + B)",
    eyebrow: "Bundle · GHS 60",
    description: "Courses A + B together for one complete learning package.",
    price: 60,
    accent: "blue",
    enrolledCount: 0,
    lessons: []
  }
];

export const seedRequests: PaymentRequest[] = [];

export function getSeedState(): DemoState {
  return {
    courses: seedCourses,
    requests: seedRequests,
    grantedAccess: [],
    activeSessionId: ""
  };
}

export function getDemoState(): DemoState {
  if (typeof window === "undefined") return getSeedState();
  const raw = window.localStorage.getItem("safelearn-demo-state");
  if (!raw) return getSeedState();
  try {
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return {
      ...getSeedState(),
      ...parsed,
      grantedAccess: Array.isArray(parsed.grantedAccess) ? parsed.grantedAccess : [],
      requests: Array.isArray(parsed.requests) ? parsed.requests : []
    };
  } catch {
    return getSeedState();
  }
}

export function saveDemoState(state: DemoState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("safelearn-demo-state", JSON.stringify(state));
  }
}

export function findCourse(courseId: string, courses: Course[] = seedCourses) {
  return courses.find((course) => course.id === courseId) ?? courses[0] ?? seedCourses[0];
}

export function findLesson(lessonId: string, courses: Course[] = seedCourses) {
  return courses.flatMap((course) => course.lessons).find((lesson) => lesson.id === lessonId);
}

export function hasCourseAccess(state: DemoState, contact: string, courseId: string) {
  return state.grantedAccess.some((grant) => grant.contact === contact && grant.courseId === courseId);
}

export function withCourseGrant(state: DemoState, contact: string, courseId: string, source: AccessGrant["source"]): DemoState {
  if (hasCourseAccess(state, contact, courseId)) return state;
  return { ...state, grantedAccess: [...state.grantedAccess, { contact, courseId, source }] };
}

export function formatGhs(amount: number) {
  return `GHS ${amount.toFixed(0)}`;
}
