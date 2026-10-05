// app/components/HeroSection.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Lock } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { checkGameAccess } from '@/app/actions/guildAccess';

export default function HeroSection({
  isAuthenticated,
  isMember,
}: {
  isAuthenticated: boolean;
  isMember: boolean;
}) {
  const router = useRouter();
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleMascotClick = async () => {
    if (checking) return;

    if (!isAuthenticated) {
      signIn('discord', { callbackUrl: '/game' });
      return;
    }
    // 로그인 당시 길드원이 아니었으면 서버 확인 없이 바로 안내
    if (!isMember) {
      setShowDeniedModal(true);
      return;
    }

    // 로그인 당시 값은 오래됐을 수 있으므로 /game과 같은 기준으로 실시간 확인
    setChecking(true);
    try {
      const access = await checkGameAccess();
      if (access === 'ok') {
        router.push('/game');
        return;
      }
      if (access === 'login') {
        signIn('discord', { callbackUrl: '/game' });
        return;
      }
      setShowDeniedModal(true);
    } catch {
      // 확인 요청 자체가 실패하면 기존 동작대로 이동 (서버 layout에서 최종 판정)
      router.push('/game');
    } finally {
      setChecking(false);
    }
  };

  return (
    <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
      <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-center gap-6">
        <div className="inline-flex items-center justify-center p-3 bg-white/80 rounded-full mb-6 shadow-sm border border-amber-100 animate-bounce">
          <Heart className="w-6 h-6 text-amber-500 fill-amber-200" />
        </div>
        <img
          src="/images/hero-title.png"
          alt="따뜻하고 자유로운 밤콩 길드입니다"
          className="w-full pb-5 max-w-md md:max-w-lg object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
        />
        <p className="text-base sm:text-[15px] text-stone-700 font-medium leading-relaxed max-w-lg bg-gradient-to-br from-white/90 via-amber-50/60 to-amber-100/40 backdrop-blur-sm p-5 rounded-2xl border border-amber-200/50 shadow-lg shadow-amber-100/50 break-keep text-center">
          소소하게 달리는 런너님들을 위한{' '}
          <span className="text-amber-600 font-bold">성인 친목 자유 디스코드 길드</span>입니다.
          <br className="hidden sm:inline" />
          과한 억압 없이 즐겁게, <span className="text-amber-600 font-bold">테일즈런너</span>를 함께 달려보아요!
          <a href="/admin" className="hover:opacity-70 transition-opacity cursor-default opacity-80" title="관리자 전용">🌰</a>
        </p>
      </div>

      <div
        onClick={handleMascotClick}
        aria-busy={checking}
        className={`flex-1 relative w-full max-w-md group select-none ${checking ? 'cursor-wait' : 'cursor-pointer'}`}
      >
        <div className="absolute inset-0 bg-amber-200/40 rounded-full blur-2xl transform-gpu group-hover:bg-amber-300/50 transition-colors"></div>
        <img
          src="/images/hero-mascot.png"
          alt="밤콩 메인 마스코트"
          className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hover:-translate-y-4 group-hover:scale-105 transition-transform duration-500 transform-gpu"
        />

        <div
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 bg-stone-900/80 text-amber-200 text-xs font-black px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10 whitespace-nowrap shadow-lg ${
            checking ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {checking ? '🌰 길드원 확인 중...' : isAuthenticated ? '🌰 밤콩 온실로 놀러가기' : '🔒 디스코드 로그인 후 입장'}
        </div>
      </div>

      {showDeniedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 border border-amber-200 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-stone-800">길드원 전용 공간입니다</h3>
            <p className="text-sm text-stone-600 font-medium leading-relaxed break-keep">
              밤콩 키우기는 <span className="text-amber-700 font-bold">밤콩 디스코드 서버</span>에 소속된 길드원만 입장할 수 있습니다.
            </p>
            <p className="text-xs text-stone-500 leading-relaxed break-keep">
              길드원인데 이 창이 뜬다면, 서버에 가입된 디스코드 계정으로 로그인했는지 확인해 주세요. 서버에 방금 들어왔다면 5분 뒤 다시 시도해 주세요.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <button onClick={() => setShowDeniedModal(false)} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all">
                닫기
              </button>
              <button
                onClick={() => {
                  setShowDeniedModal(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl shadow-sm transition-all text-sm"
              >
                잘못된 계정이신가요? 로그아웃 하기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}