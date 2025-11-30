import { prisma } from '@/lib/db';
import SpeakingInterface from './SpeakingInterface';
export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: Number(params.lessonId) },
    include: { sentences: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!lesson) return <div>Lesson not found</div>;
  return <SpeakingInterface lesson={lesson} sentences={lesson.sentences} />;
}