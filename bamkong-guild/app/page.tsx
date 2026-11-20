// app/page.tsx
import { Suspense } from 'react';
import { getImageProps } from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import NoticeToast from './components/NoticeToast';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import GuildGuide from './components/GuildGuide';
import GuildSkills from './components/GuildSkills';
import AlbumPreview from './components/AlbumPreview';
import WeekendBanner from './components/WeekendBanner';
import CallToAction from './components/CallToAction';
import Reveal from './components/Reveal';
import { WEEKEND_BANNER } from './data/guideData';

/** 세션 user에서 isBamkongMember를 any 없이 꺼냄 (next-auth 타입 확장 전 임시) */
function readIsMember(user: unknown): boolean {
  return typeof user === 'object' && user !== null && 'isBamkongMember' in user && user.isBamkongMember === true;
}

/** 화면 너비에 맞는 배경 한 장만 내려받도록 <picture> 사용 (히어로 영역에만 표시) */
function HeroBackground() {
  const common = { alt: '', sizes: '100vw' };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: '/images/bg-main.jpg', width: 1920, height: 1080 });
  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, src: '/images/bg-mobile.jpg', width: 828, height: 1792 });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} sizes="100vw" />
      <img {...rest} loading="eager" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover object-top select-none" />
    </picture>
  );
}

export default async function BamkongGuildPage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;
  const isMember = readIsMember(session?.user);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0f0d0b] text-stone-100 selection:bg-amber-500 selection:text-white">
      <Header />

      <main>
        <HeroSection isAuthenticated={isAuthenticated} isMember={isMember} background={<HeroBackground />} />
        <GuildGuide />
        <GuildSkills />
        <AlbumPreview />
        <Reveal>
          <WeekendBanner {...WEEKEND_BANNER} />
        </Reveal>
        <CallToAction />
      </main>

      <footer className="border-t border-white/[0.06] py-11 px-6 text-center text-sm text-stone-400 break-keep">
        <img src="/images/logo.png" alt="" loading="lazy" className="mx-auto h-9 w-auto opacity-85" />
        <p className="mt-3 mb-1.5 text-base text-stone-100">테일즈런너 밤콩 길드 (Since 2026)</p>
        <p>ⓒ 2026 밤콩 길드. 모든 권리 보유.</p>
      </footer>

      {/* useSearchParams를 쓰는 토스트만 Suspense로 감쌈 */}
      <Suspense fallback={null}>
        <NoticeToast />
      </Suspense>
    </div>
  );
}
