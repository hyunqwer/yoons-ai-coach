'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    if (!content.trim()) {
      alert('학습할 문장을 입력해주세요!');
      return;
    }

    setIsLoading(true);
    localStorage.setItem('practiceData', content);
    // 약간의 딜레이를 주어 로딩 효과를 보여줌
    setTimeout(() => {
      router.push('/learn/practice');
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 (Gradients) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 -z-20" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-fade-in -z-10" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-fade-in -z-10" />

      <div className="max-w-3xl w-full glass rounded-3xl shadow-2xl p-8 md:p-12 animate-slide-up border border-white/60">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={12} />
            AI English Trainer
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            나만의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AI 영어 코치</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            교재의 문장을 입력하면 AI가 발음, 문법, 유창성을 실시간으로 코칭해드립니다.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative bg-white rounded-2xl p-1">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 text-slate-400 text-sm">
                <BookOpen size={16} />
                <span>학습할 문장 입력 (영어 | 해석)</span>
              </div>
              <textarea
                className="w-full h-48 p-4 focus:outline-none text-slate-700 text-lg resize-none rounded-b-xl placeholder:text-slate-300 leading-relaxed"
                placeholder={`Hello, how are you? | 안녕, 기분 어때?\nI am happy. | 난 행복해.`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-lg font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                학습 시작하기 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
