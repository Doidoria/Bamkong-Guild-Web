// app/components/SubPageShell.tsx
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SectionHeading from './SectionHeading';

interface SubPageShellProps {
  /** 헤더 가운데 페이지 이름 */
  pageTitle: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
}

/** 앨범·타게임 등 서브 페이지 공통 레이아웃 (메인과 같은 다크 톤) */
export default function SubPageShell({ pageTitle, eyebrow, title, description, children }: SubPageShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0f0d0b] text-stone-100 selection:bg-amber-500 selection:text-white">
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0f0d0b]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Link
            href="/"
            className="group justify-self-start inline-flex items-center gap-2 h-11 pl-2 pr-3 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            <span className="hidden sm:inline">메인으로</span>
            <span className="sr-only sm:hidden">메인으로</span>
          </Link>
          <p className="text-lg sm:text-xl text-white whitespace-nowrap">{pageTitle}</p>
          <span aria-hidden />
        </div>
      </header>

      {/* 상단 앰버 글로우: 메인 히어로와 톤을 맞춤 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden">
        <div className="absolute left-1/2 -top-56 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-amber-400/12 blur-[120px] transform-gpu" />
      </div>

      <main className="relative max-w-6xl mx-auto px-6 pt-32 md:pt-36 pb-24">
        <SectionHeading eyebrow={eyebrow} as="h1" title={title} description={description} className="mb-10 md:mb-14 text-center [&_p]:mx-auto" />
        {children}
      </main>
    </div>
  );
}
