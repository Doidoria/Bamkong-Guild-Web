// app/components/LoginButton.tsx
'use client';
import React from 'react';
import { signIn } from 'next-auth/react';

export default function LoginButton() {
  const handleLogin = () => {
    // API Route로 이동하여 디스코드 로그인 프로세스 시작
    window.location.href = '/api/auth/discord';
  };

  return (
    <button 
      onClick={() => signIn('discord', { callbackUrl: '/game' })}
      className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      <svg width="24" height="24" viewBox="0 0 127.14 96.36" fill="currentColor">
        <path d="... (기존 디스코드 SVG) ..." />
      </svg>
      디스코드로 시작하기
    </button>
  );
}