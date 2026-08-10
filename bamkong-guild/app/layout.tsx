import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// 둥근고딕 계열 폰트 적용 (Noto Sans KR 예시)
const notoSansKr = Noto_Sans_KR({ 
  subsets: ["latin"],
  weight: ['400', '500', '700', '900']
});

export const metadata: Metadata = {
  title: "밤콩 길드 | 테일즈런너 성인 친목 자유 디스코드 길드",
  description: "소소하게 달리는 런너님들을 위한 따뜻하고 자유로운 밤콩 길드입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={notoSansKr.className}>{children}</body>
    </html>
  );
}