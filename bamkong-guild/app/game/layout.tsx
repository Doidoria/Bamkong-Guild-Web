// app/game/layout.tsx
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGuildMemberSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export default async function GameLayout({ children }: { children: ReactNode }) {
  // 봇으로 실시간 길드 가입 확인 (HeroSection의 checkGameAccess와 같은 기준)
  const member = await getGuildMemberSession();

  if (!member) {
    // 이유를 구분해서 메인에 안내: 로그인 안 함 / 길드원 확인 실패
    const session = await getServerSession(authOptions);
    redirect(session ? '/?notice=guild-only' : '/?notice=login');
  }

  return <>{children}</>;
}