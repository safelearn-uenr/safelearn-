export type Course = {
  id: string;
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

export type DemoState = {
  courses: Course[];
  requests: PaymentRequest[];
  grantedContacts: string[];
  activeSessionId: string;
};

export const demoStudent = {
  name: "Ama Owusu",
  email: "ama.owusu@example.com",
  phone: "+233 24 555 0188"
};

export const seedCourses: Course[] = [
  {
    id: "course-a",
    code: "CHEM 204",
    name: "Organic Chemistry II",
    eyebrow: "Course A · core access",
    description: "Reaction mechanisms translated into repeatable exam patterns and short visual walkthroughs.",
    price: 30,
    accent: "saffron",
    enrolledCount: 42,
    lessons: [
      {
        id: "lesson-chem-1",
        courseId: "course-a",
        title: "Reading reaction mechanisms without guessing",
        duration: "18 min",
        module: "Module 01 / Mechanisms",
        videoUrl: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
        streamType: "HTML5 demo · swap for Bunny / Cloudflare HLS",
        summary: "A clean method for identifying electron movement, reaction families, and the one detail most exam questions hide."
      },
      {
        id: "lesson-chem-2",
        courseId: "course-a",
        title: "Stereochemistry: the picture is the answer",
        duration: "22 min",
        module: "Module 02 / Structure",
        videoUrl: "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
        streamType: "HTML5 demo · swap for Bunny / Cloudflare HLS",
        summary: "Use wedges, dashes, and priority rules as a quick visual system instead of memorizing isolated names."
      }
    ]
  },
  {
    id: "course-b",
    code: "STAT 216",
    name: "Statistics for Health Sciences",
    eyebrow: "Course B · core access",
    description: "A practical route from messy data to defensible conclusions, with worked examples in every lesson.",
    price: 30,
    accent: "mint",
    enrolledCount: 31,
    lessons: [
      {
        id: "lesson-stat-1",
        courseId: "course-b",
        title: "Choosing the right test in 60 seconds",
        duration: "16 min",
        module: "Module 01 / Foundations",
        videoUrl: "https://storage.googleapis.com/coverr-main/mp4/Accomplished.mp4",
        streamType: "HTML5 demo · swap for Bunny / Cloudflare HLS",
        summary: "A compact decision tree for matching research questions, variables, and tests before touching the calculator."
      }
    ]
  },
  {
    id: "bundle",
    code: "BUNDLE",
    name: "The Exam Clarity Bundle",
    eyebrow: "Bundle · best value",
    description: "Both courses, one clear route through the hard parts, and a lower total cost for serious revision weeks.",
    price: 60,
    accent: "blue",
    enrolledCount: 18,
    lessons: []
  }
];

export const seedRequests: PaymentRequest[] = [
  {
    id: "request-1",
    student: "Kwame Mensah",
    contact: "+233 55 201 9921",
    courseId: "course-b",
    amount: 30,
    transactionId: "MOMO-816204",
    submittedAt: "Today · 09:42",
    status: "pending"
  },
  {
    id: "request-2",
    student: "Esi Addo",
    contact: "esi.addo@example.com",
    courseId: "course-a",
    amount: 30,
    transactionId: "MOMO-816119",
    submittedAt: "Today · 08:57",
    status: "pending"
  },
  {
    id: "request-3",
    student: "Nana Boateng",
    contact: "+233 20 880 1133",
    courseId: "bundle",
    amount: 60,
    transactionId: "MOMO-815962",
    submittedAt: "Yesterday · 17:26",
    status: "approved"
  }
];

export function getSeedState(): DemoState {
  return {
    courses: seedCourses,
    requests: seedRequests,
    grantedContacts: [demoStudent.email, demoStudent.phone],
    activeSessionId: ""
  };
}

export function getDemoState(): DemoState {
  if (typeof window === "undefined") return getSeedState();
  const raw = window.localStorage.getItem("safelearn-demo-state");
  if (!raw) return getSeedState();
  try {
    return JSON.parse(raw) as DemoState;
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
  return courses.find((course) => course.id === courseId) ?? seedCourses[0];
}

export function findLesson(lessonId: string, courses: Course[] = seedCourses) {
  return courses.flatMap((course) => course.lessons).find((lesson) => lesson.id === lessonId);
}

export function formatGhs(amount: number) {
  return `GHS ${amount.toFixed(0)}`;
}
