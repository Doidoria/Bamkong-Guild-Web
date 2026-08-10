import type { Metadata } from "next";
import { Jua } from 'next/font/google';
import "./globals.css";

// 주요 글꼴 적용 (Jua 예시)
const juaFont = Jua({ 
  weight: '400',       // 주아체는 400 굵기 하나만 지원합니다.
  subsets: ['latin'],  // 영문/숫자 최적화 (한글도 자동 지원)
  display: 'swap',     // 폰트 로딩 전 텍스트가 안 보이는 현상 방지
});

export const metadata = {
  title: '밤콩 길드',
  description: '테일즈런너 따뜻하고 자유로운 성인 친목 디스코드 길드입니다 🌰',
  openGraph: {
    title: '테일즈런너 밤콩 길드',
    description: '혼자 달리기 심심하시죠? 억압 없이 즐겁게 함께 달려요! (뉴비/복귀 대환영)',
    siteName: '밤콩 길드',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={`${juaFont.className} antialiased text-stone-800`}>
        {children}
      </body>
    </html>
  );
}