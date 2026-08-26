// app/components/GuildSkills.tsx
'use client';
import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function GuildSkills() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="skills" className="max-w-5xl mx-auto px-6 mb-16 relative z-10 scroll-mt-50">
      <div className="bg-white/90 border border-amber-200/60 rounded-[2rem] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-amber-50/60 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-700 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-stone-800">
                밤콩 길드 스킬 현황
              </h3>
              <p className="text-sm text-stone-500 font-medium mt-1">
                {isOpen ? '클릭하여 스킬 안내를 접습니다.' : '클릭하여 현재 적용 중인 길드 스킬을 확인해 보세요!'}
              </p>
            </div>
          </div>
          
          <div className="p-2 rounded-full bg-amber-100/50 text-amber-700 group-hover:bg-amber-200/50 transition-colors">
            <ChevronDown
              className={`w-6 h-6 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* 아코디언 본문 (스킬 이미지 2개 영역) */}
        {isOpen && (
          <div className="p-6 md:p-8 border-t border-amber-100 bg-amber-50/30 flex flex-col items-center gap-6 animate-fadeIn">
            <p className="text-stone-700 font-bold text-center break-keep bg-white/80 px-4 py-2 rounded-full border border-amber-200/50 text-sm md:text-base">
              ✨ 밤콩 길드는 길드원 분들의 쾌적한 플레이를 위해 주요 길드 스킬을 지속해서 유지/강화하고 있습니다!
            </p>
            
            {/* 스킬 이미지 2개 반응형 그리드 배치*/}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* 첫 번째 이미지 */}
              <div className="rounded-2xl overflow-hidden border border-amber-200/80 shadow-md bg-white p-2 hover:-translate-y-1 transition-transform duration-300">
                <img
                  src="/images/guild-skills-1.jpg"
                  alt="밤콩 길드 스킬 현황 1"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
              
              {/* 두 번째 이미지 */}
              <div className="rounded-2xl overflow-hidden border border-amber-200/80 shadow-md bg-white p-2 hover:-translate-y-1 transition-transform duration-300">
                <img
                  src="/images/guild-skills-2.jpg"
                  alt="밤콩 길드 스킬 현황 2"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>
            
          </div>
        )}
      </div>
    </section>
  );
}