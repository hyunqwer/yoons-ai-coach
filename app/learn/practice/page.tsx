'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, Play, SkipForward, Square, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Sentence {
  id: number;
  englishText: string;
  koreanText: string;
}

interface FeedbackType {
  pronunciation_score: number;
  grammar_score: number;
  fluency_score: number;
  overall_feedback_korean: string;
  suggested_sentence: string;
}

export default function PracticePage() {
  const router = useRouter();
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [userText, setUserText] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const rawData = localStorage.getItem('practiceData');
    if (!rawData) {
      router.push('/');
      return;
    }
    const lines = rawData.split('\n').filter(line => line.trim() !== '');
    const parsedSentences = lines.map((line, index) => {
      const parts = line.split('|');
      return {
        id: index,
        englishText: parts[0].trim(),
        koreanText: parts.length > 1 ? parts[1].trim() : '',
      };
    }).filter(s => s.englishText !== '');
    setSentences(parsedSentences);
  }, [router]);

  const currentSentence = sentences[currentIndex];

  const playTTS = async () => {
    if (!currentSentence) return;
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        body: JSON.stringify({ text: currentSentence.englishText }),
      });
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch (e) { console.error(e); }
  };

  const startRecording = async () => {
    setFeedback(null);
    setUserText('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = submitAudio;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert('마이크 권한 필요'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const submitAudio = async () => {
    setIsProcessing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('targetText', currentSentence.englishText); 

    try {
      const res = await fetch('/api/speaking/direct-evaluate', { method: 'POST', body: formData });
      const data = await res.json();
      setUserText(data.recognized_text);
      setFeedback(data.feedback);
    } catch (e) { alert('오류 발생'); }
    setIsProcessing(false);
  };

  const nextSentence = () => {
    setFeedback(null);
    setUserText('');
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if(confirm('학습 완료! 홈으로 갈까요?')) router.push('/');
    }
  };

  const ScoreBadge = ({ label, score }: { label: string, score: number }) => {
    let color = 'bg-red-100 text-red-600';
    if (score >= 80) color = 'bg-emerald-100 text-emerald-600';
    else if (score >= 50) color = 'bg-amber-100 text-amber-600';

    return (
      <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 w-full">
        <span className="text-xs text-slate-400 font-medium mb-1">{label}</span>
        <span className={`text-xl font-black ${color.split(' ')[1]}`}>{score}</span>
      </div>
    );
  };

  if (!currentSentence) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col items-center p-4">
      {/* 상단 진행 바 */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between px-2">
        <Link href="/" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Home size={20} /></Link>
        <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-500">{currentIndex + 1} / {sentences.length}</span>
      </div>

      <div className="w-full max-w-lg flex-1 flex flex-col">
        {/* 메인 카드 */}
        <div className="relative glass rounded-[2rem] shadow-2xl p-8 mb-6 flex flex-col items-center text-center border border-white/60 bg-white/80">
          
          {/* 문장 표시 */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 leading-tight tracking-tight">
              {currentSentence.englishText}
            </h1>
            <p className="text-lg text-slate-500 font-medium bg-slate-100/50 inline-block px-4 py-2 rounded-xl">
              {currentSentence.koreanText}
            </p>
          </div>

          {/* 사용자 발화 (피드백 전) */}
          {userText && !feedback && (
            <div className="animate-fade-in mb-6 w-full">
               <p className="text-xs text-slate-400 mb-1 uppercase font-bold tracking-wider">Detected</p>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600">
                 "{userText}"
               </div>
            </div>
          )}

          {/* 로딩 인디케이터 */}
          {isProcessing && (
             <div className="absolute inset-0 z-10 glass rounded-[2rem] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-600 font-bold animate-pulse">AI 코치가 분석 중입니다...</p>
             </div>
          )}

          {/* 피드백 결과 */}
          {feedback && (
            <div className="w-full animate-slide-up">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <ScoreBadge label="발음" score={feedback.pronunciation_score} />
                <ScoreBadge label="문법" score={feedback.grammar_score} />
                <ScoreBadge label="유창성" score={feedback.fluency_score} />
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl text-left border border-indigo-100/50 mb-4">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                     <RefreshCw size={16} />
                   </div>
                   <div>
                     <p className="text-sm text-slate-700 leading-relaxed font-medium">
                       {feedback.overall_feedback_korean}
                     </p>
                   </div>
                </div>
              </div>

              {feedback.suggested_sentence !== currentSentence.englishText && (
                 <div className="text-left bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100">
                   <p className="text-xs text-emerald-600 font-bold mb-1">이렇게 말해보는 건 어때요?</p>
                   <p className="text-emerald-800 font-medium">"{feedback.suggested_sentence}"</p>
                 </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 컨트롤러 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button 
            onClick={playTTS}
            className="group flex flex-col items-center justify-center h-20 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95"
          >
            <div className="p-2 bg-slate-100 rounded-full group-hover:bg-indigo-200 text-slate-500 group-hover:text-indigo-700 transition-colors mb-1">
              <Play size={20} fill="currentColor" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600">듣기</span>
          </button>

          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative flex items-center justify-center h-20 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 ${
              isRecording 
                ? 'bg-rose-500 text-white' 
                : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/40'
            }`}
          >
            {isRecording ? (
               <>
                 <span className="absolute w-full h-full bg-rose-500 rounded-2xl animate-ping opacity-30"></span>
                 <Square size={28} fill="currentColor" />
               </>
            ) : (
               <Mic size={32} />
            )}
          </button>

          <button 
            onClick={nextSentence}
            disabled={!feedback && currentIndex < sentences.length - 1}
            className={`group flex flex-col items-center justify-center h-20 rounded-2xl border transition-all active:scale-95 ${
               feedback 
                 ? 'bg-white border-emerald-200 hover:bg-emerald-50' 
                 : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
            }`}
          >
             <div className={`p-2 rounded-full mb-1 ${feedback ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
               <SkipForward size={20} />
             </div>
            <span className={`text-[10px] font-bold ${feedback ? 'text-emerald-600' : 'text-slate-400'}`}>다음</span>
          </button>
        </div>
      </div>
    </div>
  );
}
