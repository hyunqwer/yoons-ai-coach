'use client';
import { useState } from 'react';
export default function AdminContentPage() {
  const [unitTitle, setUnitTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!unitTitle || !lessonTitle || !content) { alert('모든 필드를 입력해주세요.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitTitle, lessonTitle, content }),
      });
      if (res.ok) { alert('저장되었습니다!'); setContent(''); setLessonTitle(''); }
      else { alert('저장 실패'); }
    } catch (e) { alert('오류 발생'); }
    setLoading(false);
  };
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">교재 콘텐츠 입력</h1>
      <div className="space-y-4">
        <input className="w-full p-2 border rounded" placeholder="단원명" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="레슨명" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
        <textarea className="w-full p-2 border rounded h-64" placeholder="English | Korean" value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded">
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}