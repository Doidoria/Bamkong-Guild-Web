// app/components/GuildSkills.tsx
'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// 스킬 이미지 목록: 추가·삭제는 여기만 수정
const SKILL_IMAGES = [
  { src: '/images/guild-skills-1.png', alt: '밤콩 길드 스킬 현황 1' },
  { src: '/images/guild-skills-2.png', alt: '밤콩 길드 스킬 현황 2' },
  { src: '/images/guild-skills-3.png', alt: '밤콩 길드 스킬 현황 3' },
] as const;

export default function GuildSkills() {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <section id="skills" className="scroll-mt-24 max-w-6xl mx-auto px-6 pt-16 md:pt-20 pb-10">
      <div className="rounded-[2rem] bg-[#15120f] border border-white/[0.07] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="group w-full flex items-center justify-between gap-4 p-7 md:px-10 md:py-8 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <span>
            <span className="block text-sm tracking-[0.14em] text-amber-400">04 · SKILLS</span>
            <span className="block mt-2 text-[28px] md:text-[34px] leading-tight text-white">밤콩 길드 스킬 현황</span>
            <span className="block mt-1.5 text-[15px] text-stone-400">
              {isOpen ? '클릭하여 스킬 안내를 접습니다.' : '클릭하여 현재 적용 중인 길드 스킬을 확인해 보세요!'}
            </span>
          </span>
          <span className="shrink-0 inline-flex w-12 h-12 rounded-full bg-amber-400/12 group-hover:bg-amber-400/20 text-amber-400 items-center justify-center transition-colors">
            <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
          </span>
        </button>

        {isOpen && (
          <div id={panelId} className="px-7 pb-7 md:px-10 md:pb-10 animate-fade-in">
            <p className="mb-6 px-5 py-4 rounded-2xl bg-amber-400/[0.08] text-amber-200 text-[15px] leading-relaxed break-keep">
              ✨ 밤콩 길드는 길드원 분들의 쾌적한 플레이를 위해 주요 길드 스킬을 지속해서 유지/강화하고 있습니다!
            </p>
            {/* 2열, 홀수 개일 때 마지막 이미지는 가운데 정렬 */}
            <div className="flex flex-wrap justify-center gap-4">
              {SKILL_IMAGES.map((image) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full md:w-[calc(50%-0.5rem)] h-auto rounded-2xl border border-white/[0.08]"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
