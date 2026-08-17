// app/components/HeroSection.tsx
import React from 'react';
import { Heart } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
      {/* 텍스트 영역 */}
      <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-center gap-6">
        <div className="inline-flex items-center justify-center p-3 bg-white/80 rounded-full mb-6 shadow-sm border border-amber-100 animate-bounce">
          <Heart className="w-6 h-6 text-amber-500 fill-amber-200" />
        </div>
        <img 
          src="/images/hero-title.png" 
          alt="따뜻하고 자유로운 밤콩 길드입니다" 
          className="w-full pb-5 max-w-md md:max-w-lg object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
        />
        <p className="text-base sm:text-[15px] text-stone-700 font-medium leading-relaxed max-w-lg bg-gradient-to-br from-white/90 via-amber-50/60 to-amber-100/40 backdrop-blur-sm p-5 rounded-2xl 
            border border-amber-200/50 shadow-lg shadow-amber-100/50 break-keep text-center">
            소소하게 달리는 런너님들을 위한{' '}
            <span className="text-amber-600 font-bold">성인 친목 자유 디스코드 길드</span>입니다. <br className="hidden sm:inline" />
            억압 없이 즐겁게,{' '}
            <span className="text-amber-600 font-bold">테일즈런너</span>를 함께 달려보아요! 
            <a href="/admin" className="hover:opacity-70 transition-opacity cursor-default opacity-80" title="관리자 전용">
              🌰
            </a>
        </p>
      </div>
      
      {/* 메인 캐릭터 이미지 영역 */}
      <div className="flex-1 relative w-full max-w-md">
        <div className="absolute inset-0 bg-amber-200/40 rounded-full blur-2xl transform-gpu"></div>
        <img 
          src="/images/hero-mascot.png" 
          alt="밤콩 메인 마스코트" 
          className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hover:-translate-y-4 transition-transform duration-500 transform-gpu" 
        />
      </div>
    </section>
  );
}