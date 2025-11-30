import Link from 'next/link';
export default function Home() {
  return (
    <div className="container mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        AI와 함께하는 <span className="text-blue-600">영어 말하기 훈련</span>
      </h1>
      <p className="text-gray-600 mb-8 text-lg">
        교재의 문장을 듣고, 말하고, 실시간으로 피드백을 받아보세요.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/learn" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg">
          학습 시작하기
        </Link>
        <Link href="/admin/content" className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition shadow-sm">
          교재 등록하기
        </Link>
      </div>
    </div>
  );
}