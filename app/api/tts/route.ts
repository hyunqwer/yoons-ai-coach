import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const mp3 = await openai.audio.speech.create({ model: "tts-1", voice: "alloy", input: text });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': buffer.length.toString() },
    });
  } catch (error) {
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}