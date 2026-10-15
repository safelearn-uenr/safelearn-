import { LessonPage } from "@/components/safelearn-ui";

export default async function LessonRoute({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LessonPage lessonId={lessonId} />;
}
