// app/events/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import EventBackground from '../../components/EventBackground';
import EventStatusBadge from '../../components/EventStatusBadge';
import { events, formatEventDate, getEventById } from '../data/eventData';
import type { EventReward } from '../data/eventData';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const POSTER_SIZES = '(max-width: 448px) 100vw, 380px';

const MEDALS: Record<EventReward['rank'], string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

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

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <section className="pt-10 mt-10 border-t border-white/10">
      <h2 className="flex items-baseline gap-2 text-xl md:text-2xl font-black text-amber-200 mb-6">
        {title}
        {aside && <span className="text-sm font-bold text-stone-500">{aside}</span>}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-4 px-5 py-4">
      <dt className="text-stone-400 font-bold">{label}</dt>
      <dd className="text-stone-100">{children}</dd>
    </div>
  );
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  const dateText = formatEventDate(event.startDate, event.endDate);
  const scheduleText = event.timeLabel ? `${dateText} ${event.timeLabel}` : dateText;

  return (
    <EventBackground>
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10 md:py-16">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 mb-8 text-stone-400 hover:text-amber-300 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          이벤트 공지
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-14 items-start">
          {/* 포스터 */}
          <aside className="lg:sticky lg:top-10 w-full max-w-[380px] mx-auto">
            <div className="relative aspect-[768/1376] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
              <Image src={event.image} alt={event.title} fill priority sizes={POSTER_SIZES} className="object-cover" />
            </div>
          </aside>

          {/* 공지 본문 */}
          <article className="min-w-0 rounded-[2rem] bg-stone-900/70 backdrop-blur-md border border-white/10 p-6 md:p-10 break-keep">
            <header>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-amber-400 font-bold text-sm">밤콩 길드 이벤트</span>
                <EventStatusBadge startDate={event.startDate} endDate={event.endDate} startTime={event.startTime} />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">{event.title}</h1>
              <p className="text-stone-300 text-lg">{event.summary}</p>
            </header>

            <dl className="mt-8 rounded-2xl border border-white/10 divide-y divide-white/10 bg-black/20">
              <InfoRow label="일시">{scheduleText}</InfoRow>
              {event.eligibility && (
                <InfoRow label="참가 제한">
                  <p>
                    <strong className="text-amber-300">{event.eligibility.minGrade}</strong> 등급 이상부터 참여 가능
                  </p>
                  {event.eligibility.excludedGrades.length > 0 && (
                    <p className="mt-1 text-sm text-rose-300">
                      {event.eligibility.excludedGrades.map((grade) => `'${grade}'`).join(', ')} 등급은 참여할 수 없어요
                    </p>
                  )}
                </InfoRow>
              )}
              <InfoRow label="진행 방식">{event.concept}</InfoRow>
              <InfoRow label="목적">{event.purpose}</InfoRow>
            </dl>

            <Section title="게임 구성" aside={`총 ${event.rounds.length}라운드`}>
              <ol className="space-y-8">
                {event.rounds.map((round) => (
                  <li key={round.round} className="grid grid-cols-[3rem_1fr] gap-4">
                    <span className="text-4xl md:text-5xl font-black text-amber-400/80 leading-none">{round.round}</span>
                    <div>
                      <h3 className="text-lg md:text-xl font-black text-white mb-1">{round.title}</h3>
                      <p className="text-sm text-stone-500 font-bold mb-3">{round.tags.join(' · ')}</p>
                      <p className="text-stone-300 leading-relaxed">{round.description}</p>
                      {(round.place || round.condition) && (
                        <ul className="mt-3 space-y-1 text-sm text-stone-400">
                          {round.place && (
                            <li>
                              장소 : <span className="text-stone-200">{round.place}</span>
                            </li>
                          )}
                          {round.condition && (
                            <li>
                              조건 : <span className="text-stone-200">{round.condition}</span>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="점수 & 보상">
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 text-lg">
                {event.scoring.points.map((point) => (
                  <span key={point.rank} className="text-stone-300">
                    {point.rank} <strong className="text-amber-300">{point.score}점</strong>
                  </span>
                ))}
              </div>
              <p className="text-stone-400 mb-1">{event.scoring.note}</p>
              <p className="text-stone-400 mb-8">{event.scoring.automation}</p>

              <ul className="rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
                {event.rewards.map((reward) => (
                  <li
                    key={reward.rank}
                    className={`flex items-center gap-4 px-5 py-4 ${reward.rank === 1 ? 'bg-amber-400/10' : 'bg-black/20'}`}
                  >
                    <span className="text-2xl">{MEDALS[reward.rank]}</span>
                    <span className="w-10 shrink-0 text-stone-400 font-bold">{reward.rank}등</span>
                    <span className="text-white font-bold text-lg">{reward.prize}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="꼴찌 벌칙" aside={event.penalty.target}>
              <div className="border-l-4 border-rose-400/60 pl-5">
                <p className="text-white text-lg font-bold mb-2">{event.penalty.content}</p>
                <p className="text-stone-400 leading-relaxed">{event.penalty.decision}</p>
              </div>
            </Section>

            <p className="pt-10 mt-10 border-t border-white/10 text-center text-stone-300 text-lg">
              {scheduleText}, 밤콩 길드에서 만나요 🌰
            </p>
          </article>
        </div>
      </div>
    </EventBackground>
  );
}