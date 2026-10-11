// app/game/actions.ts
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { getAdminSession } from '@/app/lib/auth';

export async function getGameSession() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/** 현재 로그인 유저가 관리자인지 (서버에서 판별) */
export async function getIsAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}