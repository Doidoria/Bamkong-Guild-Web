// app/components/Header.tsx
'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const NAV_LINKS = [
  { href: '#about', label: '길드 소개' },
  { href: '#skills', label: '길드 스킬' },
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
      className={`fixed top-0 inset-x-0 z-50 border-b backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled ? 'bg-white/80 border-amber-100/70 shadow-md' : 'bg-white/30 border-white/20'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="shrink-0" aria-label="밤콩 길드 홈">
          <img src="/images/logo.png" alt="" className="h-9 sm:h-10 w-auto object-contain bg-amber-100/20 rounded-lg" />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-bold text-stone-700 whitespace-nowrap">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-amber-100/70 hover:text-amber-800 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="ml-1 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-amber-700 hover:bg-amber-600 text-white shadow-md transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden />
            오픈 카톡
          </a>
        </nav>
      </div>
    </header>
  );
}