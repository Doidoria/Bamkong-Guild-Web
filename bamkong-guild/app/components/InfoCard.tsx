// app/components/InfoCard.tsx
import type { ReactNode } from 'react';
import { Ban, Check, X } from 'lucide-react';

export interface InfoItem {
  /** 굵은 소제목. 없으면 본문을 강조 스타일로 표시 */
  label?: string;
  content: ReactNode;
}

type InfoCardTheme = 'light' | 'dark' | 'warning' | 'rule';

interface InfoCardProps {
  title: string;
  items: InfoItem[];
  theme?: InfoCardTheme;
  /** 2·3이면 sm 이상에서 항목을 가로로 나눠 배치 */
  columns?: 1 | 2 | 3;
}

const THEME: Record<InfoCardTheme, { card: string; item: string; title: string; icon: string; strong: string }> = {
  light: {
    card: 'bg-white/90 border-white/60 text-stone-600',
    item: 'bg-amber-50/70 border-amber-100',
    title: 'text-stone-800',
    icon: 'bg-amber-100 text-amber-700',
    strong: 'text-stone-800',
  },
  dark: {
    card: 'bg-amber-900/90 border-amber-800/50 text-amber-50',
    item: 'bg-black/20 border-white/10',
    title: 'text-white',
    icon: 'bg-amber-300/20 text-amber-300',
    strong: 'text-white',
  },
  warning: {
    card: 'bg-[#fff9f0]/95 border-amber-200/50 text-stone-700',
    item: 'bg-white/70 border-amber-100',
    title: 'text-amber-900',
    icon: 'bg-orange-100 text-orange-700',
    strong: 'text-stone-900',
  },
  rule: {
    card: 'bg-orange-900/90 border-orange-800/50 text-orange-50',
    item: 'bg-black/20 border-white/10',
    title: 'text-white',
    icon: 'bg-orange-400 text-orange-950',
    strong: 'text-white',
  },
};

const ICON = { light: Check, dark: Check, warning: X, rule: Ban } as const;

export default function InfoCard({ title, items, theme = 'light', columns = 1 }: InfoCardProps) {
  const t = THEME[theme];
  const Icon = ICON[theme];

  return (
    <div className={`h-full p-6 md:p-8 rounded-[2rem] shadow-lg border flex flex-col ${t.card}`}>
      <h2 className={`text-2xl font-black mb-5 md:mb-6 ${t.title}`}>{title}</h2>

      <ul
        className={
          columns === 1
            ? 'flex flex-col gap-2.5 md:gap-3 flex-1'
            : `grid grid-cols-1 gap-2.5 md:gap-3 ${columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`
        }
      >
        {items.map((item, idx) => (
          <li key={idx} className={`flex items-start gap-3 p-3.5 md:p-4 rounded-2xl border ${t.item}`}>
            <span className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${t.icon}`}>
              <Icon className="w-3.5 h-3.5" strokeWidth={3} aria-hidden />
            </span>
            <div className="break-keep leading-relaxed text-[15px] md:text-base">
              {item.label ? (
                <>
                  <span className={`block font-bold text-[17px] mb-0.5 ${t.strong}`}>{item.label}</span>
                  {item.content}
                </>
              ) : (
                <span className={`font-bold text-base md:text-[17px] ${t.strong}`}>{item.content}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}