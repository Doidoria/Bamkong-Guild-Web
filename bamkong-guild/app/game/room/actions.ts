// app/game/room/actions.ts
'use server';

import { getGameSession } from '@/app/game/actions';

interface SessionUser {
  id?: string;
  name?: string | null;
  guildNickname?: string | null;
  isBamkongMember?: boolean;
}

export interface ShareRoomResult {
  ok: boolean;
  message: string;
}

const MAX_FILE_BYTES = 4 * 1024 * 1024;

export async function shareRoomToDiscord(formData: FormData): Promise<ShareRoomResult> {
  // 1) 서버에서 세션 검증
  const user = (await getGameSession()) as SessionUser | null;
  if (!user?.id) return { ok: false, message: '로그인이 필요합니다.' };
  if (!user.isBamkongMember) return { ok: false, message: '밤콩 길드원만 자랑할 수 있어요! 🌰' };

  const webhookUrl = process.env.ROOM_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('ROOM_WEBHOOK_URL 환경변수가 없습니다.');
    return { ok: false, message: '서버 설정 오류입니다. 관리자에게 문의해 주세요.' };
  }

  // 2) 파일 검증
  const file = formData.get('file');
  if (!(file instanceof Blob) || file.type !== 'image/jpeg') {
    return { ok: false, message: '이미지 파일이 올바르지 않습니다.' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: '이미지 용량이 너무 큽니다.' };
  }

  // 3) 닉네임은 클라이언트 값이 아닌 세션 값 사용 (사칭 방지)
  const displayName = user.guildNickname || user.name || '밤콩';

  const payload = {
    allowed_mentions: { parse: [] }, // 닉네임에 @everyone 등이 있어도 멘션 차단
    embeds: [
      {
        title: '🌰 밤콩이 방 자랑하기!',
        description: `**${displayName}**님이 정성스럽게 꾸민 방이에요!\n어떤가요? 너무 아늑해 보이지 않나요? ✨`,
        color: 16100911,
        image: { url: 'attachment://room.jpg' },
        footer: { text: '테일즈런너 밤콩 길드 웹 시스템' },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const body = new FormData();
  body.append('payload_json', JSON.stringify(payload));
  body.append('file', file, 'room.jpg');

  try {
    const res = await fetch(webhookUrl, { method: 'POST', body });
    if (!res.ok) {
      console.error('디스코드 웹후크 실패:', res.status, await res.text());
      return { ok: false, message: '디스코드 전송에 실패했습니다.' };
    }
    return { ok: true, message: '디스코드 자랑하기 성공!' };
  } catch (error) {
    console.error('디스코드 전송 에러:', error);
    return { ok: false, message: '디스코드 전송에 실패했습니다.' };
  }
}