// app/lib/auth.ts (새 파일)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchGuildMembership } from '@/app/lib/discord';

export interface AdminSession {
  discordId: string;
  name: string | null;
}

function getAdminUids(): string[] {
  return (process.env.NEXT_ADMIN_UIDS ?? '')
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

export interface MemberSession {
  discordId: string;
  nickname: string | null;
}

interface SessionUserFields {
  id?: string;
  isBamkongMember?: boolean;
  guildNickname?: string | null;
}

export async function getGuildMemberSession(): Promise<MemberSession | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserFields | undefined;
  if (!user?.id) return null;

  const membership = await fetchGuildMembership(user.id);

  // Discord API 장애 시: 로그인 당시 판정으로 대체 (전원 차단 방지)
  if (membership === null) {
    return user.isBamkongMember === true
      ? { discordId: user.id, nickname: user.guildNickname ?? null }
      : null;
  }

  return membership.isMember ? { discordId: user.id, nickname: membership.nickname } : null;
}