// app/events/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  EyeOff,
  Gift,
  Heart,
  Lightbulb,
  MapPin,
  Radio,
  Settings2,
  Siren,
  Sparkles,
  Tag,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import EventBackground from '../../components/EventBackground';
import EventStatusBadge from '../../components/EventStatusBadge';
import { events, formatEventDate, getEventById } from '../data/eventData';
import type { EventReward, RoundKind } from '../data/eventData';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

interface RoundStyle {
  icon: LucideIcon;
  gradient: string;
  glow: string;
  text: string;
  chip: string;
}

interface RewardStyle {
  medal: string;
  card: string;
  text: string;
  order: string;
}

const POSTER_SIZES = '(max-width: 448px) 100vw, 380px';
const GLASS = 'bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-[2rem]';

const ROUND_STYLE: Record<RoundKind, RoundStyle> = {
  hide: {
    icon: EyeOff,
    gradient: 'from-emerald-300 to-teal-500',
    glow: 'bg-emerald-500/25',
    text: 'text-emerald-300',
    chip: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30',
  },
  quiz: {
    icon: Lightbulb,
    gradient: 'from-sky-300 to-indigo-500',
    glow: 'bg-sky-500/25',
    text: 'text-sky-300',
    chip: 'bg-sky-500/10 text-sky-200 border-sky-400/30',
  },
  race: {
    icon: Zap,
    gradient: 'from-rose-300 to-orange-500',
    glow: 'bg-rose-500/25',
    text: 'text-rose-300',
    chip: 'bg-rose-500/10 text-rose-200 border-rose-400/30',
  },
};

// 데스크톱에서 2등-1등-3등 시상대 배치
const REWARD_STYLE: Record<EventReward['rank'], RewardStyle> = {
  1: {
    medal: '🥇',
    card: 'border-amber-300/50 bg-gradient-to-b from-amber-400/25 to-amber-500/5 md:py-12 shadow-2xl shadow-amber-900/30',
    text: 'text-amber-200',
    order: 'md:order-2',
  },
  2: {
    medal: '🥈',
    card: 'border-stone-300/30 bg-gradient-to-b from-stone-300/15 to-stone-400/5',
    text: 'text-stone-200',
    order: 'md:order-1',
  },
  3: {
    medal: '🥉',
    card: 'border-orange-400/30 bg-gradient-to-b from-orange-500/15 to-orange-600/5',
    text: 'text-orange-200',
    order: 'md:order-3',
  },
};

export function generateStaticParams(): { id: string }[] {
  return events.map((event) => ({ id: event.id }));
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) return { title: '이벤트를 찾을 수 없어요 | 밤콩 길드' };

  return {
    title: `${event.title} | 밤콩 길드`,
    description: event.summary,
    openGraph: { title: event.title, description: event.summary, images: [event.image] },
  };
}

function SectionHeader({ icon: Icon, eyebrow, title }: { icon: LucideIcon; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-xs font-bold tracking-widest text-amber-400/80">{eyebrow}</p>
        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">{title}</h2>
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  const dateText = formatEventDate(event.startDate, event.endDate);

  return (
    <EventBackground>
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        {/* 배경 빛 번짐 */}
        <div aria-hidden className="absolute top-40 -left-40 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div aria-hidden className="absolute bottom-40 -right-40 w-[28rem] h-[28rem] bg-amber-700/15 rounded-full blur-3xl pointer-events-none"></div>

        <Link
          href="/events"
          className="relative inline-flex items-center gap-2 mb-10 px-4 py-2 bg-white/5 backdrop-blur-md text-stone-300 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          이벤트 공지로
        </Link>

        <div className="relative grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 lg:gap-16 items-start">
          {/* 포스터 */}
          <aside className="lg:sticky lg:top-12 w-full max-w-[380px] mx-auto transition-all duration-700 starting:opacity-0 starting:scale-95">
            <div className="relative">
              <div aria-hidden className="absolute -inset-6 opacity-50 blur-3xl">
                <Image src={event.image} alt="" fill sizes={POSTER_SIZES} className="object-cover" />
              </div>
              <div className="relative aspect-[768/1376] w-full overflow-hidden rounded-[2rem] ring-1 ring-white/15 shadow-2xl shadow-black/60">
                <Image src={event.image} alt={event.title} fill priority sizes={POSTER_SIZES} className="object-cover" />
              </div>
            </div>
          </aside>

          {/* 본문 */}
          <div className="min-w-0 space-y-16 break-keep">
            {/* 히어로 */}
            <header className="transition-all duration-700 starting:opacity-0 starting:translate-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-400/30 tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  GUILD EVENT
                </span>
                <EventStatusBadge startDate={event.startDate} endDate={event.endDate} startTime={event.startTime} />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-5 bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                {event.title}
              </h1>

              <p className="text-stone-300 text-lg lg:text-xl mb-8">{event.summary}</p>

              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-stone-200 font-bold">
                  <CalendarDays className="w-5 h-5 text-amber-400" />
                  {dateText}
                </span>
                {event.timeLabel && (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-stone-200 font-bold">
                    <Clock className="w-5 h-5 text-amber-400" />
                    {event.timeLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-stone-200 font-bold">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  {event.rounds.length}라운드 점수 합산
                </span>
              </div>
            </header>

            {/* 개요 */}
            <section>
              <SectionHeader icon={Sparkles} eyebrow="OVERVIEW" title="이벤트 개요" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${GLASS} p-6`}>
                  <p className="inline-flex items-center gap-2 text-amber-300 text-sm font-bold mb-3">
                    <Heart className="w-4 h-4" />
                    목적
                  </p>
                  <p className="text-stone-200 text-lg leading-relaxed">{event.purpose}</p>
                </div>
                <div className={`${GLASS} p-6`}>
                  <p className="inline-flex items-center gap-2 text-amber-300 text-sm font-bold mb-3">
                    <Target className="w-4 h-4" />
                    기본 컨셉
                  </p>
                  <p className="text-stone-200 text-lg leading-relaxed">{event.concept}</p>
                </div>
              </div>
            </section>

            {/* 라운드 */}
            <section>
              <SectionHeader icon={Trophy} eyebrow="GAME ROUNDS" title={`게임 구성 (총 ${event.rounds.length}라운드)`} />
              <ol className="relative space-y-5">
                <div
                  aria-hidden
                  className="hidden sm:block absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-emerald-400/50 via-sky-400/50 to-rose-400/50"
                ></div>

                {event.rounds.map((round) => {
                  const style = ROUND_STYLE[round.kind];
                  const Icon = style.icon;

                  return (
                    <li key={round.round} className="relative sm:pl-20">
                      <div
                        className={`hidden sm:flex absolute left-0 top-6 h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-stone-950 shadow-lg`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <article
                        className={`group relative overflow-hidden ${GLASS} p-6 md:p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]`}
                      >
                        <div
                          aria-hidden
                          className={`absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${style.glow} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}
                        ></div>

                        <div className="relative">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`sm:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-stone-950`}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className={`text-sm font-black tracking-widest ${style.text}`}>
                              ROUND {String(round.round).padStart(2, '0')}
                            </span>
                          </div>

                          <h3 className="text-xl md:text-2xl font-black text-white mb-4">{round.title}</h3>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {round.tags.map((tag) => (
                              <span key={tag} className={`px-3 py-1 rounded-full border text-xs font-bold ${style.chip}`}>
                                {tag}
                              </span>
                            ))}
                          </div>

                          <p className="text-stone-300 text-base md:text-lg leading-relaxed">{round.description}</p>

                          {(round.place || round.condition) && (
                            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-5 border-t border-white/10 text-sm">
                              {round.place && (
                                <span className="inline-flex items-center gap-1.5 text-stone-300">
                                  <MapPin className={`w-4 h-4 ${style.text}`} />
                                  <span className="text-stone-500">장소</span>
                                  {round.place}
                                </span>
                              )}
                              {round.condition && (
                                <span className="inline-flex items-center gap-1.5 text-stone-300">
                                  <Settings2 className={`w-4 h-4 ${style.text}`} />
                                  <span className="text-stone-500">조건</span>
                                  {round.condition}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* 점수 */}
            <section>
              <SectionHeader icon={Target} eyebrow="SCORING" title="점수 집계" />
              <div className={`${GLASS} p-6 md:p-8`}>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {event.scoring.points.map((point) => (
                    <div key={point.rank} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
                      <p className="text-stone-400 text-sm font-bold mb-1">{point.rank}</p>
                      <p className="text-3xl md:text-4xl font-black text-amber-300">
                        {point.score}
                        <span className="text-base text-amber-400/70 ml-0.5">점</span>
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-stone-400 text-sm md:text-base mb-6">{event.scoring.note}</p>

                <div className="flex items-start gap-3 rounded-2xl bg-sky-500/10 border border-sky-400/20 p-4">
                  <Radio className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sky-200 mb-0.5">실시간 점수 송출</p>
                    <p className="text-stone-300 text-sm">{event.scoring.automation}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 보상 */}
            <section>
              <SectionHeader icon={Gift} eyebrow="REWARDS" title="우승 보상" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end pt-3">
                {event.rewards.map((reward) => {
                  const style = REWARD_STYLE[reward.rank];

                  return (
                    <div
                      key={reward.rank}
                      className={`relative rounded-[2rem] border p-6 md:p-8 text-center transition-transform duration-300 hover:-translate-y-1 ${style.card} ${style.order}`}
                    >
                      {reward.rank === 1 && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black tracking-widest shadow-lg">
                          WINNER
                        </span>
                      )}
                      <p className="text-5xl mb-3">{style.medal}</p>
                      <p className={`text-sm font-black tracking-widest mb-1 ${style.text}`}>{reward.rank}등</p>
                      <p className="text-lg font-black text-white">{reward.prize}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 벌칙 */}
            <section>
              <SectionHeader icon={Siren} eyebrow="PENALTY" title="꼴찌 벌칙" />
              <div className="relative overflow-hidden rounded-[2rem] border border-rose-400/30 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent p-6 md:p-8">
                <div aria-hidden className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl pointer-events-none"></div>

                <div className="relative">
                  <span className="inline-block mb-5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs font-bold">
                    대상 · {event.penalty.target}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
                      <p className="inline-flex items-center gap-1.5 text-rose-300 text-sm font-bold mb-2">
                        <Tag className="w-4 h-4" />
                        벌칙 내용
                      </p>
                      <p className="text-white text-lg font-bold">{event.penalty.content}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
                      <p className="inline-flex items-center gap-1.5 text-rose-300 text-sm font-bold mb-2">
                        <Users className="w-4 h-4" />
                        별명 결정 방식
                      </p>
                      <p className="text-stone-200 leading-relaxed">{event.penalty.decision}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 마무리 */}
            <section className="relative overflow-hidden rounded-[2.5rem] border border-amber-400/20 bg-gradient-to-br from-amber-500/15 to-amber-700/5 p-8 md:p-10 text-center">
              <p className="text-4xl mb-4">🌰</p>
              <p className="text-2xl md:text-3xl font-black text-white mb-2">
                {dateText} {event.timeLabel}
              </p>
              <p className="text-stone-300 text-lg">밤콩 길드에서 다 같이 만나요!</p>
            </section>
          </div>
        </div>
      </div>
    </EventBackground>
  );
}