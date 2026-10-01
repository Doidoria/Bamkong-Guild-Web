// app/lib/discord.ts — 서버 전용
const DISCORD_API = 'https://discord.com/api/v10';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분
const DISCORD_ID_PATTERN = /^\d{17,20}$/;

export interface GuildMembership {
  isMember: boolean;
  nickname: string | null;
}

interface DiscordGuildMember {
  nick?: string | null;
}

interface CacheEntry {
  value: GuildMembership;
  expiresAt: number;
}

// 서버리스 인스턴스 단위 메모리 캐시 (Discord API 호출 횟수 절감)
const membershipCache = new Map<string, CacheEntry>();

/**
 * 봇 토큰으로 밤콩 서버 가입 여부 조회
 * @returns 조회 결과, API 장애/설정 오류 시 null
 */
export async function fetchGuildMembership(discordId: string): Promise<GuildMembership | null> {
  if (!DISCORD_ID_PATTERN.test(discordId)) return { isMember: false, nickname: null };

  const cached = membershipCache.get(discordId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.NEXT_BAMKONG_GUILD_ID;
  if (!botToken || !guildId) {
    console.error('[discord] DISCORD_BOT_TOKEN 또는 NEXT_BAMKONG_GUILD_ID가 없습니다.');
    return null;
  }

  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${discordId}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: 'no-store',
    });

    let value: GuildMembership;
    if (res.ok) {
      const data = (await res.json()) as DiscordGuildMember;
      value = { isMember: true, nickname: data.nick ?? null };
    } else if (res.status === 404) {
      value = { isMember: false, nickname: null }; // Unknown Member = 서버에 없음
    } else {
      console.error('[discord] 멤버 조회 실패:', res.status, await res.text());
      return null;
    }

    membershipCache.set(discordId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  } catch (error) {
    console.error('[discord] 멤버 조회 에러:', error);
    return null;
  }
}