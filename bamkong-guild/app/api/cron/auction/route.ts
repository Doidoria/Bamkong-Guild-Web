// app/api/cron/auction/route.ts
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  // 시크릿 미설정 시 "Bearer undefined"로 통과되는 것 방지
  if (!cronSecret) {
    console.error('CRON_SECRET 환경변수가 없습니다.');
    return NextResponse.json({ success: false, error: '서버 설정 오류' }, { status: 500 });
  }

  // Vercel Cron 보안 헤더 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const webhookUrl = process.env.AUCTION_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('AUCTION_WEBHOOK_URL 환경변수가 없습니다.');
    return NextResponse.json({ success: false, error: '서버 설정 오류' }, { status: 500 });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '📢 **[대운동회]** 밤콩 여러분! [오픈] 열렸습니다~!',
      }),
    });

    if (!res.ok) {
      console.error('디스코드 웹후크 실패:', res.status, await res.text());
      return NextResponse.json({ success: false, error: '전송 실패' }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: '대운동회 알림 전송 완료 🌰' });
  } catch (error) {
    console.error('웹후크 전송 중 에러 발생:', error);
    return NextResponse.json({ success: false, error: '전송 실패' }, { status: 500 });
  }
}