// app/events/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';
import EventBackground from '../components/EventBackground';
import EventStatusBadge from '../components/EventStatusBadge';
import { formatEventDate, mainEvent } from './data/eventData';

export const metadata: Metadata = {
  title: '길드 이벤트 | 밤콩 길드',
  description: '밤콩 길드에서 진행 중인 이벤트를 확인하세요 🌰',
};

// 포스터와 글로우 이미지가 같은 sizes를 써야 같은 파일을 재사용함 (중복 다운로드 방지)
const POSTER_SIZES = '(max-width: 448px) 100vw, 400px';

function formatPeriod(startDate: string, endDate: string): string {
  const start = startDate.replaceAll('-', '.');
  if (startDate === endDate) return start;
  return `${start} ~ ${endDate.replaceAll('-', '.')}`;
}

export default function EventsPage() {
  return (
    <EventBackground>
      <section className="relative min-h-screen flex items-center max-w-6xl mx-auto px-6 lg:px-8 py-16">
        {/* 배경 앰버 빛 번짐 */}
        <div aria-hidden className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div aria-hidden className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-700/20 rounded-full blur-3xl pointer-events-none"></div>

        {mainEvent ? (
          <div className="relative w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] items-center gap-12 lg:gap-20">
            {/* 정보 영역 */}
            <div className="order-2 lg:order-1 text-center lg:text-left transition-all duration-700 starting:opacity-0 starting:translate-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-400/30 tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  GUILD EVENT
                </span>
                <EventStatusBadge startDate={mainEvent.startDate} endDate={mainEvent.endDate} startTime={mainEvent.startTime} />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight break-keep mb-5 bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                {mainEvent.title}
              </h1>

              <p className="text-stone-300 text-lg lg:text-xl break-keep max-w-xl mx-auto lg:mx-0 mb-6">
                {mainEvent.summary}
              </p>

              <p className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-stone-300 font-bold mb-10">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                {formatEventDate(mainEvent.startDate, mainEvent.endDate)}
                {mainEvent.timeLabel && ` · ${mainEvent.timeLabel}`}
              </p>

              <div>
                <div className="group/cta inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black text-base md:text-lg rounded-2xl shadow-xl shadow-amber-900/30 transition-all duration-300 active:scale-95"
                >
                  이벤트 자세히 보기 (이미지 클릭)
                  <ArrowRight className="w-6 h-6 group-hover/cta:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* 포스터 */}
            <Link
              href={`/events/${mainEvent.id}`}
              aria-label={`${mainEvent.title} 상세 보기`}
              className="order-1 lg:order-2 group relative block w-full max-w-[400px] mx-auto transition-all duration-700 starting:opacity-0 starting:scale-95"
            >
              {/* 앰비언트 글로우: 같은 포스터를 흐리게 깔아서 색이 번지는 효과 */}
              <div aria-hidden className="absolute -inset-6 opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-80">
                <Image src={mainEvent.image} alt="" fill sizes={POSTER_SIZES} className="object-cover" />
              </div>

              <div className="relative aspect-[768/1376] w-full overflow-hidden rounded-[2rem] ring-1 ring-white/15 shadow-2xl shadow-black/60 transition-transform duration-500 group-hover:-translate-y-2">
                <Image
                  src={mainEvent.image}
                  alt={mainEvent.title}
                  fill
                  priority
                  sizes={POSTER_SIZES}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />

                {/* 호버 시 빛이 스치는 효과 */}
                <div
                  aria-hidden
                  className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
                ></div>

                {/* 하단 안내 라벨 */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute inset-x-0 bottom-85 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-[12px] font-bold ring-1 ring-white/25 transition-all duration-300 group-hover:bg-amber-400 group-hover:text-stone-950 group-hover:ring-amber-300">
                    눌러서 자세히 보기
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-12 text-center shadow-2xl">
            <p className="text-5xl mb-4">🌰</p>
            <p className="text-xl font-bold text-stone-200 mb-2">지금은 진행 중인 이벤트가 없어요</p>
            <p className="text-stone-400">다음 이벤트를 기다려 주세요!</p>
          </div>
        )}
      </section>
    </EventBackground>
  );
}