// app/layout.tsx
import type { Metadata } from "next";
import { Jua } from 'next/font/google';
import "./globals.css";

const juaFont = Jua({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
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
    <html lang="ko" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${juaFont.className} antialiased text-stone-800`}>
        {children}
      </body>
    </html>
  );
}