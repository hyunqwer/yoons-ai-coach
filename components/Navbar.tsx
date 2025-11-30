import Link from 'next/link';
export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link href="/" className="text-xl font-bold">Yoon’s AI Speaking Coach</Link>
        <div className="space-x-4 mt-2 sm:mt-0">
          <Link href="/learn" className="hover:text-blue-200">학습하기</Link>
          <Link href="/admin/content" className="hover:text-blue-200">교재 관리</Link>
        </div>
      </div>
    </nav>
  );
}