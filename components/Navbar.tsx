import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass shadow-sm">
      <div className="container mx-auto px-6 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Yoon’s AI Coach
          </span>
        </Link>
        
        {/* 심플한 메뉴 */}
        <div className="hidden md:flex space-x-1">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors">
            홈으로
          </Link>
        </div>
      </div>
    </nav>
  );
}
