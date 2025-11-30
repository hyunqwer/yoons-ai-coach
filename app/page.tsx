'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    
    // 입력한 내용을 로컬 스토리지에 임시 저장하고 학습 페이지로 이동
    localStorage.setItem('practiceData', content);
    router.push('/learn/practice');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
          Yoon's AI Speaking Coach
        </h1>
        <p className="text-center text-slate-500 mb-8">
          학습할 영어 문장을 붙여넣고 바로 연습하세요.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              학습할 문장 입력 (영어 | 한글해석)
            </label>
            <textarea
              className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 bg-slate-50 text-lg leading-relaxed"
              placeholder="여기에 문장을 입력하세요.&#13;&#10;예시:&#13;&#10;Hello, how are you? | 안녕, 기분 어때?&#13;&#10;I am happy. | 난 행복해."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-md disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? '준비 중...' : '🚀 학습 시작하기'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
           <p className="text-xs text-slate-400">
             입력한 내용은 서버에 저장되지 않고 즉시 연습에 사용됩니다.
           </p>
        </div>
      </div>
    </div>
  );
}
