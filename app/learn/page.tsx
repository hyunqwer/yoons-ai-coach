import { prisma } from '@/lib/db';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default async function LearnPage() {
  const units = await prisma.unit.findMany({ include: { lessons: true }, orderBy: { id: 'desc' } });
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">학습 선택</h1>
      {units.map((unit) => (
        <div key={unit.id} className="mb-4 border p-4 rounded bg-white">
          <h2 className="text-lg font-bold">{unit.title}</h2>
          <ul className="mt-2">
            {unit.lessons.map((lesson) => (
              <li key={lesson.id}><Link href={`/learn/${lesson.id}`} className="text-blue-600">{lesson.title} →</Link></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}