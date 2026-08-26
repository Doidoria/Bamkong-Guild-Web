import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Vercel Cron 보안 헤더 검증 (외부에서 임의 주소로 실행하는 것을 방지)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 디스코드 채널 웹후크 URL (Vercel 환경변수에 추가 필요)
  const DISCORD_WEBHOOK_URL = process.env.AUCTION_WEBHOOK_URL;

  if (!DISCORD_WEBHOOK_URL) {
    return NextResponse.json({ success: false, error: '웹후크 URL이 없습니다.' }, { status: 500 });
  }

  try {
    // 디스코드 채널로 직접 웹후크 API 전송 (웹 코드 레벨 처리)
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '📢 **[옥션 알림]** 밤콩 여러분! [옥션]이 열렸습니다~!'
      }),
    });

    return NextResponse.json({ success: true, message: '옥션 알림 전송 완료 🌰' });
  } catch (error) {
    return NextResponse.json({ success: false, error: '전송 실패' }, { status: 500 });
  }
}