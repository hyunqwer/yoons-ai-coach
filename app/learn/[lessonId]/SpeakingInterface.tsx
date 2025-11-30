'use client';
import { useState, useRef } from 'react';
import { Mic, Play, SkipForward, Square } from 'lucide-react';
import Link from 'next/link';
export default function SpeakingInterface({ lesson, sentences }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [userText, setUserText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentSentence = sentences[currentIndex];

  const playTTS = async () => {
    const res = await fetch('/api/tts', { method: 'POST', body: JSON.stringify({ text: currentSentence.englishText }) });
    const audio = new Audio(URL.createObjectURL(await res.blob()));
    audio.play();
  };

  const startRecording = async () => {
    setFeedback(null); setUserText('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = submitAudio;
      mediaRecorder.start();
      setIsRecording(true);
    } catch { alert('마이크 필요'); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const submitAudio = async () => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', new Blob(audioChunksRef.current, { type: 'audio/webm' }), 'rec.webm');
    formData.append('lessonId', lesson.id); formData.append('sentenceId', currentSentence.id);
    const res = await fetch('/api/speaking/evaluate', { method: 'POST', body: formData });
    const data = await res.json();
    setUserText(data.recognized_text); setFeedback(data.feedback);
    setIsProcessing(false);
  };

  const nextSentence = () => {
    if (currentIndex < sentences.length - 1) { setFeedback(null); setUserText(''); setCurrentIndex(p => p + 1); }
    else { window.location.href = '/learn'; }
  };

  return (
    <div className="container mx-auto p-4 text-center max-w-md">
      <Link href="/learn" className="text-sm text-gray-400">← 나가기</Link>
      <h2 className="font-bold text-xl mt-4">{currentSentence.englishText}</h2>
      <p className="text-gray-500 mb-8">{currentSentence.koreanText}</p>
      {userText && <div className="bg-gray-100 p-2 rounded mb-4 text-sm">You: {userText}</div>}
      {feedback && (
        <div className="bg-blue-50 p-4 rounded mb-4 text-left text-sm">
          <div className="flex justify-between font-bold mb-2">
             <span>P: {feedback.pronunciation_score}</span><span>G: {feedback.grammar_score}</span><span>F: {feedback.fluency_score}</span>
          </div>
          <p>{feedback.overall_feedback_korean}</p>
        </div>
      )}
      {isProcessing && <div className="text-blue-500 mb-4">AI 분석 중...</div>}
      <div className="flex justify-center gap-4">
        <button onClick={playTTS} className="p-3 border rounded-full"><Play size={24} /></button>
        <button onClick={isRecording ? stopRecording : startRecording} className={`p-3 rounded-full text-white ${isRecording ? 'bg-red-500' : 'bg-blue-600'}`}>
          {isRecording ? <Square size={24} /> : <Mic size={24} />}
        </button>
        <button onClick={nextSentence} disabled={!feedback} className="p-3 border rounded-full disabled:opacity-30"><SkipForward size={24} /></button>
      </div>
    </div>
  );
}