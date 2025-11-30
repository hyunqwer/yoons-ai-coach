import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function POST(req: Request) {
  try {
    const { unitTitle, lessonTitle, content } = await req.json();
    let unit = await prisma.unit.findFirst({ where: { title: unitTitle } });
    if (!unit) unit = await prisma.unit.create({ data: { title: unitTitle } });
    const lesson = await prisma.lesson.create({ data: { title: lessonTitle, unitId: unit.id } });
    const lines = content.split('\n').filter((line: string) => line.trim() !== '');
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split('|');
      const english = parts[0].trim();
      const korean = parts.length > 1 ? parts[1].trim() : '';
      if (english) {
        await prisma.sentence.create({
          data: { lessonId: lesson.id, englishText: english, koreanText: korean, orderIndex: i },
        });
      }
    }
    return NextResponse.json({ success: true, lessonId: lesson.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}