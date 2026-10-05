// app/actions/guildAccess.ts
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGuildMemberSession } from '@/app/lib/auth';

export type GameAccess = 'ok' | 'login' | 'not-member';

/** 밤콩 키우기 입장 가능 여부 — app/game/layout.tsx와 같은 기준으로 실시간 확인 */
export async function checkGameAccess(): Promise<GameAccess> {
  const session = await getServerSession(authOptions);
  const discordId = (session?.user as { id?: string } | undefined)?.id;
  if (!discordId) return 'login';
  return (await getGuildMemberSession()) ? 'ok' : 'not-member';
}