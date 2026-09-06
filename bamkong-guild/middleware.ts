import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // NextAuth 디스코드 로그인 시, 고유 ID는 token.sub 에 담깁니다.
    const userId = req.nextauth.token?.sub;

    // .env 파일의 환경변수를 가져와서 콤마(,) 기준으로 배열 변환
    const adminUids = process.env.NEXT_PUBLIC_ADMIN_UIDS?.split(",") || [];

    // 관리자 배열에 ID가 없으면 메인 페이지("/")로 강제 리다이렉트
    if (!adminUids.includes(userId as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // 로그인이 아예 안 된 유저도 우선 차단
      authorized: ({ token }) => !!token,
    },
  }
);

// 라우터 감시 설정: /admin 및 그 하위의 모든 페이지에만 이 문지기를 세웁니다.
export const config = {
  matcher: ["/admin/:path*"],
};