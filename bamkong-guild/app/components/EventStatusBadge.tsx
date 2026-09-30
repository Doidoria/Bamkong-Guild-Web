// app/events/components/EventStatusBadge.tsx
'use client';

import { useEffect, useState } from 'react';

interface EventStatusBadgeProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  startTime?: string; // HH:mm (한국 시간)
}

type Tone = 'upcoming' | 'live' | 'ended';

interface Status {
  tone: Tone;
  label: string;
}

const DAY_MS = 86_400_000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const TONE_STYLE: Record<Tone, string> = {
  live: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
  upcoming: 'bg-sky-500/10 text-sky-300 border-sky-400/30',
  ended: 'bg-stone-500/10 text-stone-400 border-stone-500/30',
};

function toKstDateKey(ms: number): string {
  return new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

function getStatus(startDate: string, endDate: string, startTime: string, now: number): Status {
  const start = Date.parse(`${startDate}T${startTime}:00+09:00`);
  const end = Date.parse(`${endDate}T23:59:59+09:00`);
  const today = toKstDateKey(now);

  if (now < start) {
    const days = dayDiff(today, startDate);
    return { tone: 'upcoming', label: days === 0 ? '오늘 시작' : `오픈 D-${days}` };
  }
  if (now > end) {
    return { tone: 'ended', label: '종료된 이벤트' };
  }

  const daysLeft = dayDiff(today, endDate);
  if (daysLeft === 0) {
    return { tone: 'live', label: startDate === endDate ? '진행 중' : '진행 중 · 오늘 마감' };
  }
  return { tone: 'live', label: `진행 중 · D-${daysLeft}` };
}

export default function EventStatusBadge({ startDate, endDate, startTime = '00:00' }: EventStatusBadgeProps) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    setStatus(getStatus(startDate, endDate, startTime, Date.now()));
  }, [startDate, endDate, startTime]);

  // 계산 전에는 같은 크기의 빈 공간을 둬서 레이아웃이 튀지 않게
  if (!status) return <span className="inline-block h-[26px] w-24" aria-hidden />;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-wide ${TONE_STYLE[status.tone]}`}
    >
      {status.tone === 'live' && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
        </span>
      )}
      {status.label}
    </span>
  );
}