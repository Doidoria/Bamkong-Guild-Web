// app/components/HeroSection.tsx
'use client';

import { useId, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Sprout } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { checkGameAccess } from '@/app/actions/guildAccess';
import { TAGS } from '@/app/data/guideData';
import Modal from './Modal';

interface HeroSectionProps {
  isAuthenticated: boolean;
  isMember: boolean;
  /** 서버에서 만든 반응형 배경(<picture>) */
  background: ReactNode;
}

export default function HeroSection({ isAuthenticated, isMember, background }: HeroSectionProps) {
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

  const buttonLabel = checking ? '길드원 확인 중...' : isAuthenticated ? '밤콩 온실 입장하기' : '디스코드 로그인 후 입장';
  const mascotLabel = checking
    ? '🌰 길드원 확인 중...'
    : isAuthenticated
      ? '🌰 눌러서 밤콩 온실로 놀러가기'
      : '🔒 디스코드 로그인 후 입장';
  const EnterIcon = isAuthenticated ? Sprout : Lock;

  return (
    <section className="relative isolate min-h-[720px] md:min-h-[820px] flex items-center overflow-hidden">
      {/* 배경 + 밤하늘 오버레이 */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {background}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0d0b]/35 via-[#18110a]/70 to-[#0f0d0b]" />
        <div className="absolute inset-0 opacity-90 bg-[radial-gradient(1.5px_1.5px_at_12%_18%,rgba(255,255,255,.8),transparent),radial-gradient(1px_1px_at_28%_42%,rgba(255,255,255,.6),transparent),radial-gradient(1.5px_1.5px_at_66%_12%,rgba(255,240,200,.9),transparent),radial-gradient(1px_1px_at_82%_34%,rgba(255,255,255,.6),transparent),radial-gradient(2px_2px_at_46%_8%,rgba(253,230,138,.9),transparent),radial-gradient(1px_1px_at_90%_70%,rgba(255,255,255,.5),transparent)]" />
        <div className="absolute -right-32 top-10 w-[720px] h-[720px] rounded-full bg-amber-400/15 blur-[120px] transform-gpu" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 pt-28 pb-16 md:pt-32 md:pb-20 grid md:grid-cols-2 gap-12 md:gap-14 items-center">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <h1 className="w-full max-w-sm md:max-w-[540px]">
            <img
              src="/images/hero-title.png"
              alt="따뜻하고 자유로운 밤콩 길드입니다"
              fetchPriority="high"
              className="w-full h-auto object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
            />
          </h1>

          <p className="max-w-[520px] text-[17px] md:text-lg leading-[1.8] text-stone-200 break-keep">
            소소하게 달리는 런너님들을 위한 <strong className="font-normal text-amber-400">성인 친목 자유 디스코드 길드</strong>
            입니다. 과한 억압 없이 즐겁게, <strong className="font-normal text-amber-400">테일즈런너</strong>를 함께 달려보아요!{' '}
            <Link href="/admin" className="opacity-80 hover:opacity-60 transition-opacity cursor-default" title="관리자 전용">
              🌰
            </Link>
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={handleEnterGame}
              disabled={checking}
              className="inline-flex items-center gap-2.5 h-14 px-7 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 text-stone-900 text-lg shadow-[0_10px_30px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-105 active:scale-[0.98] transition disabled:cursor-wait disabled:opacity-80 cursor-pointer"
            >
              <EnterIcon className="w-5 h-5" aria-hidden />
              {buttonLabel}
            </button>
            <a
              href="#contact"
              className="inline-flex items-center h-14 px-6 rounded-2xl border border-white/25 bg-white/[0.04] hover:bg-white/[0.08] text-stone-100 text-lg transition-colors"
            >
              가입 문의하기
            </a>
          </div>

          <ul aria-label="길드 특징" className="flex flex-wrap justify-center md:justify-start gap-2">
            {TAGS.map((tag) => (
              <li key={tag} className="px-3.5 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-sm text-stone-200">
                {tag}
              </li>
            ))}
          </ul>
        </div>

        {/* 마스코트: 키보드로도 누를 수 있도록 button */}
        <button
          type="button"
          onClick={handleEnterGame}
          disabled={checking}
          aria-label={`밤콩 마스코트 - ${mascotLabel}`}
          className="group relative justify-self-center w-full max-w-[300px] sm:max-w-[380px] md:max-w-[460px] aspect-square rounded-full outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60 cursor-pointer disabled:cursor-wait select-none"
        >
          <span aria-hidden className="absolute inset-[6%] rounded-full border border-amber-400/25" />
          <span aria-hidden className="absolute inset-[14%] rounded-full border border-dashed border-amber-400/20" />
          <span
            aria-hidden
            className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.38),rgba(251,191,36,0)_70%)] group-hover:scale-110 transition-transform duration-500 transform-gpu"
          />
          <img
            src="/images/hero-mascot.png"
            alt=""
            className="relative mx-auto mt-[6%] w-[88%] h-auto animate-floaty drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]"
          />
          <span className="absolute left-1/2 bottom-[4%] -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full bg-stone-900/85 border border-amber-400/30 text-amber-200 text-sm">
            {mascotLabel}
          </span>
        </button>
      </div>

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