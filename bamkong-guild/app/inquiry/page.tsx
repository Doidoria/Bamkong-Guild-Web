// app/inquiry/page.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { ArrowLeft } from 'lucide-react';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGuildMemberSession } from '@/app/lib/auth';
import { fetchInquiryPage } from './inquiryStore';
import { DEFAULT_LIST_PARAMS } from './types';
import InquiryBoard from './components/InquiryBoard';
import LoginPrompt from './components/LoginPrompt';

export const metadata: Metadata = { title: '익명 문의함 | 밤콩 길드' };
export const dynamic = 'force-dynamic';

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative text-stone-800">
      <div className="fixed inset-0 -z-20 bg-[url('/images/bg-mobile.jpg')] md:bg-[url('/images/bg-main.jpg')] bg-cover bg-top" />
      <div className="fixed inset-0 -z-10 bg-stone-900/30 pointer-events-none" />

      <header className="fixed top-0 inset-x-0 z-50 bg-white/75 backdrop-blur-md border-b border-white/40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-stone-600 hover:text-amber-700 font-bold transition-colors">
            <ArrowLeft className="w-5 h-5" aria-hidden />
            <span className="hidden sm:inline">메인으로</span>
          </Link>
          <h1 className="font-black text-lg text-stone-800">익명 문의함</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16">{children}</main>
    </div>
  );
}

export default async function InquiryPage() {
  const member = await getGuildMemberSession();

  if (!member) {
    const session = await getServerSession(authOptions);
    return (
      <Shell>
        <LoginPrompt reason={session ? 'not-member' : 'login'} />
      </Shell>
    );
  }

  // 길드원 확인이 끝났으므로 서버에서 첫 페이지를 바로 렌더링
  const initialPage = await fetchInquiryPage(DEFAULT_LIST_PARAMS, member.discordId);

  return (
    <Shell>
      <InquiryBoard initialPage={initialPage} />
    </Shell>
  );
}