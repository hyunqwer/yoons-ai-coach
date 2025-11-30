import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Yoons AI Speaking Coach',
  description: 'AI 기반 영어 말하기 훈련 웹앱',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        <Navbar />
        <main>{children}</main>
        <footer className="p-4 text-center text-gray-400 text-xs mt-8">
          © 2024 Yoon's AI Speaking Coach. Powered by OpenAI.
        </footer>
      </body>
    </html>
  )
}