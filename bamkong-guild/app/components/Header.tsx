// app/components/Header.tsx
import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center gap-3">
          {/* 로고 이미지 영역 */}
          <img src="/images/logo.png" alt="밤콩 로고" className="h-10 w-auto object-contain fallback-bg bg-amber-100/20 rounded-lg" />
        </a>
        <nav className="flex gap-6 text-sm font-bold text-stone-700">
          <a href="#about" className="hover:text-amber-700 transition-colors">길드 소개</a>
          <a href="#contact" className="hover:text-amber-700 transition-colors">오픈 카톡</a>
        </nav>
      </div>
    </header>
  );
}