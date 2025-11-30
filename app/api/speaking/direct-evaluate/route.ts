import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const targetText = formData.get('targetText') as string; // 프론트에서 직접 받음

    if (!audioFile || !targetText) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. 오디오 파일 처리 (Vercel 호환)
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.webm`);
    await writeFile(tempFilePath, buffer);

    // 2. STT (Whisper)
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
    });
    
    fs.unlinkSync(tempFilePath); // 임시 파일 삭제
    const userSpeech = transcription.text;

    // 3. GPT 피드백 생성
    const systemPrompt = `
      당신은 친절한 초등 영어 말하기 코치입니다. 
      사용자의 발음, 문법, 유창성을 평가하고 한국어로 피드백하세요.
      반드시 아래 JSON 형식을 준수하세요.
      {
        "pronunciation_score": 0-100 (정수),
        "grammar_score": 0-100 (정수),
        "fluency_score": 0-100 (정수),
        "overall_feedback_korean": "한 문장 정도의 친절한 총평",
        "suggested_sentence": "더 자연스러운 문장 제안"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Target Sentence: "${targetText}"\nUser Said: "${userSpeech}"` }
      ],
      response_format: { type: "json_object" },
    });

    const feedbackJson = JSON.parse(completion.choices[0].message.content || "{}");

    // DB 저장 없이 바로 결과 반환
    return NextResponse.json({
      recognized_text: userSpeech,
      feedback: feedbackJson
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
