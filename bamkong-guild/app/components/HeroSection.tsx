// app/components/HeroSection.tsx
'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Lock } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { checkGameAccess } from '@/app/actions/guildAccess';
import Modal from './Modal';

interface HeroSectionProps {
  isAuthenticated: boolean;
  isMember: boolean;
}

export default function HeroSection({ isAuthenticated, isMember }: HeroSectionProps) {
  const router = useRouter();
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const deniedTitleId = useId();

  const handleEnterGame = async () => {
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

  const enterLabel = checking
    ? '🌰 길드원 확인 중...'
    : isAuthenticated
      ? '🌰 밤콩 온실로 놀러가기'
      : '🔒 디스코드 로그인 후 입장';

  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-6 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-12">
      {/* 텍스트 영역: 모바일에서도 제목이 먼저 보이도록 위에 배치 */}
      <div className="flex-1 flex flex-col items-center gap-5 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white/80 rounded-full shadow-sm border border-amber-100 animate-bounce-slow">
          <Heart className="w-6 h-6 text-amber-500 fill-amber-200" aria-hidden />
        </div>

        <h1 className="w-full max-w-sm md:max-w-lg">
          <img
            src="/images/hero-title.png"
            alt="따뜻하고 자유로운 밤콩 길드입니다"
            fetchPriority="high"
            className="w-full object-contain drop-shadow-2xl"
          />
        </h1>

        <p className="text-[15px] text-stone-700 font-medium leading-relaxed max-w-lg bg-gradient-to-br from-white/90 via-amber-50/70 to-amber-100/50 backdrop-blur-sm p-5 rounded-2xl border border-amber-200/50 shadow-lg shadow-amber-100/50 break-keep">
          소소하게 달리는 런너님들을 위한{' '}
          <span className="text-amber-600 font-bold">성인 친목 자유 디스코드 길드</span>입니다.
          <br className="hidden sm:inline" />
          과한 억압 없이 즐겁게, <span className="text-amber-600 font-bold">테일즈런너</span>를 함께 달려보아요!
          <Link href="/admin" className="hover:opacity-70 transition-opacity cursor-default opacity-80" title="관리자 전용">
            🌰
          </Link>
        </p>
      </div>

      {/* 마스코트: 키보드로도 누를 수 있도록 button */}
      <button
        type="button"
        onClick={handleEnterGame}
        disabled={checking}
        aria-label={`밤콩 마스코트 - ${enterLabel}`}
        className="flex-1 relative w-full max-w-[260px] sm:max-w-xs md:max-w-md group select-none rounded-full outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60 cursor-pointer disabled:cursor-wait"
      >
        <div aria-hidden className="absolute inset-0 bg-amber-200/40 rounded-full blur-2xl transform-gpu group-hover:bg-amber-300/50 transition-colors" />
        <img
          src="/images/hero-mascot.png"
          alt=""
          className="relative z-10 w-full h-auto object-contain drop-shadow-2xl transition-transform duration-500 transform-gpu group-hover:-translate-y-3 group-hover:scale-105 motion-reduce:transition-none"
        />
        {/* 터치 기기는 hover가 없으므로 모바일에선 항상 표시 */}
        <span
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 bg-stone-900/80 text-amber-200 text-xs font-black px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10 whitespace-nowrap shadow-lg ${
            checking ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100'
          }`}
        >
          {enterLabel}
        </span>
      </button>

      <Modal open={showDeniedModal} onClose={() => setShowDeniedModal(false)} labelledBy={deniedTitleId}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
            <Lock className="w-6 h-6" aria-hidden />
          </div>
          <h3 id={deniedTitleId} className="text-xl font-black text-stone-800">
            길드원 전용 공간입니다
          </h3>
          <p className="text-sm text-stone-600 font-medium leading-relaxed break-keep">
            밤콩 키우기는 <span className="text-amber-700 font-bold">밤콩 디스코드 서버</span>에 소속된 길드원만 입장할 수 있습니다.
          </p>
          <p className="text-xs text-stone-500 leading-relaxed break-keep">
            길드원인데 이 창이 뜬다면, 서버에 가입된 디스코드 계정으로 로그인했는지 확인해 주세요. 서버에 방금 들어왔다면 5분 뒤 다시 시도해 주세요.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDeniedModal(false)}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              닫기
            </button>
            <button
              type="button"
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
      </Modal>
    </section>
  );
}