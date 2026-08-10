// app/components/InfoCard.tsx
import React from 'react';

interface InfoCardProps {
  title: string;
  items: React.ReactNode[];
  theme?: 'light' | 'dark' | 'warning';
}

export default function InfoCard({ title, items, theme = 'light' }: InfoCardProps) {
  // 이벤트 페이지 느낌을 내기 위한 반투명 글래스모피즘 스타일
  const cardStyles = {
    light: 'bg-white/90 border-white/50 text-stone-600',
    dark: 'bg-amber-900/90 border-amber-800/50 text-amber-50',
    warning: 'bg-[#fff9f0]/95 border-amber-200/50 text-stone-700',
  };

  const itemBoxStyles = {
    light: 'bg-white/50 border border-white/60',
    dark: 'bg-black/20 border border-white/10',
    warning: 'bg-white/60 border border-white/50',
  };

  const titleStyles = {
    light: 'text-stone-800',
    dark: 'text-white',
    warning: 'text-amber-900', 
  };

  const bulletStyles = {
    light: 'text-amber-600',
    dark: 'text-amber-300',
    warning: 'text-amber-500',
  };

  return (
    <div className={`p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col border ${cardStyles[theme]}`}>
      <div className="relative z-10 flex-1 flex flex-col">
        <h2 className={`text-2xl font-black mb-6 drop-shadow-sm ${titleStyles[theme]}`}>{title}</h2>
        
        <ul className="flex flex-col gap-3 flex-1">
          {items.map((item, idx) => (
            <li key={idx} className={`flex items-start gap-3 p-4 rounded-2xl shadow-sm ${itemBoxStyles[theme]}`}>
              <span className={`mt-0.5 text-lg font-black ${bulletStyles[theme]}`}>✓</span>
              <div className="break-keep leading-relaxed font-medium text-[16px]">
                {item}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}