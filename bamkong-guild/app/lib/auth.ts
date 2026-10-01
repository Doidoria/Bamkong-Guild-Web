// app/lib/auth.ts (새 파일)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface AdminSession {
  discordId: string;
  name: string | null;
}

function getAdminUids(): string[] {
  return (process.env.ADMIN_UIDS ?? '')
    .split(',')
    .map((uid) => uid.trim())
    .filter(Boolean);
}

/** 서버 전용: 관리자면 세션 정보, 아니면 null */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);
  const discordId = (session?.user as { id?: string } | undefined)?.id;

  if (!discordId || !getAdminUids().includes(discordId)) return null;
  return { discordId, name: session?.user?.name ?? null };
}