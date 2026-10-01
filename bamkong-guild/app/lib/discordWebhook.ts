// app/lib/discordWebhook.ts
export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

/** 서버 전용. 멘션(@everyone 등)은 항상 차단 */
export async function postDiscordWebhook(url: string, embeds: DiscordEmbed[]): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowed_mentions: { parse: [] }, embeds }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[webhook] 실패:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('[webhook] 에러:', error);
    return false;
  }
}

/** 닉네임에 *, _ 등이 있어도 디스코드 서식이 깨지지 않게 */
export function escapeDiscordMarkdown(text: string): string {
  return text.replace(/([\\*_~`|>])/g, '\\$1');
}