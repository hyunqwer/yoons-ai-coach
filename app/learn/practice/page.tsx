'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, Play, SkipForward, Square, Home } from 'lucide-react';
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

  // 1. 초기 로드: 로컬 스토리지에서 데이터 가져오기
  useEffect(() => {
    const rawData = localStorage.getItem('practiceData');
    if (!rawData) {
      alert('학습 데이터가 없습니다. 메인으로 이동합니다.');
      router.push('/');
      return;
    }

    // 텍스트 파싱
    const lines = rawData.split('\n').filter(line => line.trim() !== '');
    const parsedSentences = lines.map((line, index) => {
      const parts = line.split('|');
      return {
        id: index,
        englishText: parts[0].trim(),
        koreanText: parts.length > 1 ? parts[1].trim() : '',
      };
    }).filter(s => s.englishText !== ''); // 빈 영어 문장 제외

    if (parsedSentences.length === 0) {
      alert('유효한 영어 문장이 없습니다.');
      router.push('/');
      return;
    }

    setSentences(parsedSentences);
  }, [router]);

  const currentSentence = sentences[currentIndex];

  // 2. TTS 재생
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
    } catch (e) {
      console.error(e);
    }
  };

  // 3. 녹음 시작
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
    } catch (err) {
      alert('마이크 사용 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // 4. 오디오 제출 및 피드백 요청 (기존 API 활용)
  const submitAudio = async () => {
    setIsProcessing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    // API 호환성을 위해 임시 ID 전송 (DB 조회 로직 수정 필요하지만, 
    // 일단 API 쪽에서 DB 조회를 건너뛰거나, text를 직접 보내는 방식으로 수정해야 함.
    // 여기서는 MVP를 위해 프론트에서 정답 문장을 같이 보내도록 API를 약간 수정하거나,
    // 기존 API가 DB ID를 필수라 하면 에러가 날 수 있음. 
    // -> **해결책: API도 수정해야 합니다.** (아래 3번 항목 참조)
    formData.append('targetText', currentSentence.englishText); 

    try {
      // API 경로를 약간 수정하거나 새로 만듭니다. 여기서는 기존 경로 대신 'direct-eval' 사용 권장
      const res = await fetch('/api/speaking/direct-evaluate', { 
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      setUserText(data.recognized_text);
      setFeedback(data.feedback);
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsProcessing(false);
  };

  const nextSentence = () => {
    setFeedback(null);
    setUserText('');
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if(confirm('모든 문장을 완료했습니다! 처음으로 돌아갈까요?')) {
        router.push('/');
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!currentSentence) return <div className="flex justify-center items-center h-screen">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 상단 네비게이션 */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">
          <Home size={24} />
        </Link>
        <div className="font-bold text-slate-700">
           {currentIndex + 1} / {sentences.length}
        </div>
        <div className="w-6"></div> {/* 밸런스용 빈공간 */}
      </div>

      <div className="flex-1 container mx-auto p-4 max-w-lg flex flex-col justify-center">
        
        {/* 메인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800 mb-3 leading-tight">
            {currentSentence.englishText}
          </h1>
          <p className="text-lg text-slate-500 font-medium mb-8">
            {currentSentence.koreanText}
          </p>

          {/* 사용자 발화 표시 */}
          {userText && (
            <div className="mb-6 p-4 bg-slate-50 rounded-xl text-left border border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">내가 말한 문장</p>
              <p className="text-slate-700 text-lg">"{userText}"</p>
            </div>
          )}

          {/* AI 피드백 표시 */}
          {feedback && (
            <div className="text-left bg-blue-50 p-5 rounded-2xl animate-fade-in border border-blue-100">
              <div className="flex justify-between mb-4 bg-white p-3 rounded-xl shadow-sm">
                <div className="text-center px-2">
                  <div className="text-xs text-slate-400 mb-1">발음</div>
                  <div className={`font-bold text-lg ${getScoreColor(feedback.pronunciation_score)}`}>
                    {feedback.pronunciation_score}
                  </div>
                </div>
                <div className="text-center px-2 border-l border-slate-100">
                  <div className="text-xs text-slate-400 mb-1">문법</div>
                  <div className={`font-bold text-lg ${getScoreColor(feedback.grammar_score)}`}>
                    {feedback.grammar_score}
                  </div>
                </div>
                <div className="text-center px-2 border-l border-slate-100">
                  <div className="text-xs text-slate-400 mb-1">유창성</div>
                  <div className={`font-bold text-lg ${getScoreColor(feedback.fluency_score)}`}>
                    {feedback.fluency_score}
                  </div>
                </div>
              </div>
              
              <div className="text-slate-700 text-sm leading-relaxed font-medium">
                {feedback.overall_feedback_korean}
              </div>
              
              {feedback.suggested_sentence !== currentSentence.englishText && (
                 <div className="mt-3 pt-3 border-t border-blue-200/50">
                   <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md mr-2">Tip</span>
                   <span className="text-sm text-blue-800">"{feedback.suggested_sentence}"</span>
                 </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="mt-6 flex justify-center items-center space-x-2 text-blue-600 font-bold animate-pulse">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
              <span>AI 분석 중</span>
            </div>
          )}
        </div>

        {/* 컨트롤 버튼 */}
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={playTTS}
            className="flex flex-col items-center justify-center h-20 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Play className="text-slate-600 mb-1" fill="currentColor" size={24} />
            <span className="text-xs font-bold text-slate-500">듣기</span>
          </button>

          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex flex-col items-center justify-center h-20 rounded-2xl shadow-lg text-white transition-all active:scale-95 transform ${
              isRecording ? 'bg-red-500 ring-4 ring-red-200 scale-105' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRecording ? <Square size={28} fill="currentColor" /> : <Mic size={28} />}
          </button>

          <button 
            onClick={nextSentence}
            disabled={!feedback && currentIndex < sentences.length - 1} // 피드백 없으면 다음 불가 (선택사항)
            className={`flex flex-col items-center justify-center h-20 rounded-2xl transition-all active:scale-95 border ${
              feedback 
                ? 'bg-green-500 border-green-500 text-white shadow-md hover:bg-green-600' 
                : 'bg-slate-100 border-slate-200 text-slate-300'
            }`}
          >
            <SkipForward size={24} />
            <span className="text-xs font-bold mt-1">다음</span>
          </button>
        </div>
      </div>
    </div>
  );
}
