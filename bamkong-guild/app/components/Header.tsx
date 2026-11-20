// app/components/Header.tsx
'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const NAV_LINKS = [
  { href: '#about', label: '길드 소개' },
  { href: '#skills', label: '길드 스킬' },
  { href: '#album', label: '추억 앨범' },
  { href: '#weekend', label: '타게임' },
] as const;

function subscribeScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true });
  return () => window.removeEventListener('scroll', callback);
}

export default function Header() {
  // 서버에선 false, 클라이언트에선 실제 스크롤 위치 (값이 바뀔 때만 리렌더)
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 12, () => false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b backdrop-blur-xl transition-[background-color,border-color] duration-300 ${
        scrolled ? 'bg-[#0f0d0b]/80 border-white/[0.06]' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 md:h-[72px] flex items-center justify-between gap-3">
        <Link href="/" className="shrink-0" aria-label="밤콩 길드 홈">
          <img src="/images/logo.png" alt="" className="h-9 sm:h-10 w-auto object-contain" />
        </Link>

        {/* 모바일에선 공간이 좁아 앵커 메뉴는 md 이상에서만 노출 */}
        <nav aria-label="메인 메뉴" className="hidden md:flex items-center gap-1 text-[15px] whitespace-nowrap">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="inline-flex items-center gap-2 h-11 px-4 sm:px-5 rounded-xl bg-[#fee500] hover:bg-[#ffeb3b] text-[#191600] text-[15px] transition-colors"
        >
          <MessageCircle className="w-[18px] h-[18px]" aria-hidden />
          오픈 카톡
        </a>
      </div>
    </header>
  );
}
