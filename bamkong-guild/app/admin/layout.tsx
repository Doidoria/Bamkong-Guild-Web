// app/game/layout.tsx
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getGuildMemberSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export default async function GameLayout({ children }: { children: ReactNode }) {
  const member = await getGuildMemberSession();
  if (!member) redirect('/');
  return <>{children}</>;
}