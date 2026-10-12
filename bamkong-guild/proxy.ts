// proxy.ts (Next.js 16: middleware → proxy 이름 변경)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

function getAdminUids(): string[] {
  return (process.env.NEXT_ADMIN_UIDS ?? '')
    .split(',')
    .map((uid) => uid.trim())
    .filter(Boolean);
}

export default withAuth(
  function proxy(req) {
    // NextAuth 디스코드 로그인 시 Discord ID는 token.sub에 담김
    const userId = req.nextauth.token?.sub;

    // 관리자가 아니면 메인으로 (최종 검증은 admin/layout.tsx와 각 Server Action에서 다시 함)
    if (!userId || !getAdminUids().includes(userId)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      // 로그인 안 한 유저는 로그인 페이지로
      authorized: ({ token }) => !!token,
    },
  },
);

// /admin 및 하위 페이지에만 적용
export const config = {
  matcher: ['/admin/:path*'],
};