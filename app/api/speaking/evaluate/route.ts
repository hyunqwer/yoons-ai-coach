import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { prisma } from '@/lib/db';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const lessonId = Number(formData.get('lessonId'));
    const sentenceId = Number(formData.get('sentenceId'));
    if (!audioFile || !sentenceId) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.webm`);
    await writeFile(tempFilePath, buffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
    });
    fs.unlinkSync(tempFilePath);
    const userSpeech = transcription.text;
    const sentence = await prisma.sentence.findUnique({ where: { id: sentenceId } });
    if (!sentence) throw new Error("Sentence not found");

    const systemPrompt = `
      당신은 친절한 초등 영어 말하기 코치입니다. 
      사용자의 발음, 문법, 유창성을 평가하고 JSON으로 피드백하세요.
      { "pronunciation_score": 0-100, "grammar_score": 0-100, "fluency_score": 0-100, 
        "overall_feedback_korean": "친절한 한국어 총평", 
        "word_level_feedback": [], 
        "suggested_sentence": "개선된 문장" }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Target: "${sentence.englishText}"\nUser Said: "${userSpeech}"` }
      ],
      response_format: { type: "json_object" },
    });
    const feedbackJson = JSON.parse(completion.choices[0].message.content || "{}");
    
    await prisma.attempt.create({
      data: { lessonId, sentenceId, recognizedText: userSpeech, scores: JSON.stringify(feedbackJson) }
    });
    return NextResponse.json({ recognized_text: userSpeech, feedback: feedbackJson });
  } catch (error) {
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}