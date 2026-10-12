// app/page.tsx
import { Suspense } from 'react';
import { getImageProps } from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import NoticeToast from './components/NoticeToast';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import InfoCard from './components/InfoCard';
import CallToAction from './components/CallToAction';
import GuildSkills from './components/GuildSkills';
import AlbumBook from './components/AlbumBook';
import WeekendBanner from './components/WeekendBanner';
import Reveal from './components/Reveal';
import { GUILD_INTRO, JOIN_REQUIREMENTS, WELCOME, DECLINE, RULES, TAGS, WEEKEND_BANNER } from './data/guideData';

/** 세션 user에서 isBamkongMember를 any 없이 꺼냄 (next-auth 타입 확장 전 임시) */
function readIsMember(user: unknown): boolean {
  return typeof user === 'object' && user !== null && 'isBamkongMember' in user && user.isBamkongMember === true;
}

/** 화면 너비에 맞는 배경 한 장만 내려받도록 <picture> 사용 */
function Background() {
  const common = { alt: '', sizes: '100vw' };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: '/images/bg-main.jpg', width: 1920, height: 1080 });
  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, src: '/images/bg-mobile.jpg', width: 828, height: 1792 });

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none select-none" aria-hidden>
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
        <source media="(max-width: 767px)" srcSet={mobileSrcSet} sizes="100vw" />
        <img {...rest} loading="eager" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover object-top" />
      </picture>
    </div>
  );
}

export default async function BamkongGuildPage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;
  const isMember = readIsMember(session?.user);

  return (
    <div className="min-h-screen overflow-x-hidden relative selection:bg-amber-500 selection:text-white">
      <Background />
      <div className="fixed inset-0 bg-stone-900/15 -z-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <HeroSection isAuthenticated={isAuthenticated} isMember={isMember} />

          <section
            id="about"
            className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 mb-16 md:mb-20"
          >
            <Reveal className="h-full">
              <InfoCard title="길드 소개" items={GUILD_INTRO} />
            </Reveal>
            <Reveal className="h-full" delay={100}>
              <InfoCard title="가입 조건" items={JOIN_REQUIREMENTS} />
            </Reveal>
            <Reveal className="h-full">
              <InfoCard title="이런 분을 격하게 환영해요" theme="dark" items={WELCOME} />
            </Reveal>
            <Reveal className="h-full" delay={100}>
              <InfoCard title="정중히 거절합니다" theme="warning" items={DECLINE} />
            </Reveal>
            <Reveal className="lg:col-span-2">
              <InfoCard title="길드 내 금지 사항" theme="rule" items={RULES} columns={2} />
            </Reveal>
          </section>

          <ul className="flex flex-wrap justify-center gap-2.5 mb-16 px-4" aria-label="길드 특징">
            {TAGS.map((tag) => (
              <li
                key={tag}
                className="px-4 py-2 bg-white/85 backdrop-blur-sm text-amber-900 border border-amber-200/60 rounded-full text-sm lg:text-base font-bold shadow-sm"
              >
                {tag}
              </li>
            ))}
          </ul>

          <GuildSkills />
          <AlbumBook />

          <Reveal>
            <WeekendBanner {...WEEKEND_BANNER} />
          </Reveal>

          <CallToAction />
        </main>

        <footer className="w-full py-10 text-center text-sm bg-white/50 backdrop-blur-md border-t border-white/40 break-keep mt-auto">
          <p className="font-bold text-stone-800 mb-1.5 text-base">테일즈런너 밤콩 길드 (Since 2026)</p>
          <p className="text-stone-600">ⓒ 2026 밤콩 길드. 모든 권리 보유.</p>
        </footer>
      </div>

      {/* useSearchParams를 쓰는 토스트만 Suspense로 감쌈 */}
      <Suspense fallback={null}>
        <NoticeToast />
      </Suspense>
    </div>
  );
}