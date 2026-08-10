'use client';
import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function CallToAction() {
  const handleOpenTalkClick = () => {
    window.open('https://open.kakao.com/o/런너님오픈톡링크', '_blank');
  };

  return (
    <section id="contact" className="text-center py-24 flex flex-col items-center relative">
      <img 
        src="/images/cta-sign.png" 
        alt="가입 문의 안내소" 
        className="w-48 h-48 md:w-56 md:h-56 object-contain mb-4 z-10 hover:scale-110 transition-transform cursor-pointer drop-shadow-lg"
        onClick={handleOpenTalkClick}
      />
      
      <button 
        onClick={handleOpenTalkClick}
        className="group relative z-20 inline-flex items-center justify-center gap-3 px-10 py-5 md:px-12 md:py-6 bg-amber-700 text-white text-lg md:text-xl font-black rounded-full shadow-[0_8px_0_0_#92400e,0_15px_20px_rgba(0,0,0,0.2)] hover:translate-y-2 hover:shadow-[0_2px_0_0_#92400e,0_5px_10px_rgba(0,0,0,0.2)] active:translate-y-3 active:shadow-none transition-all duration-200"
      >
        <MessageCircle className="w-7 h-7 group-hover:animate-bounce" />
        1:1 오픈톡 가입 문의하기
      </button>
      
      <p className="mt-8 text-base text-stone-600 font-bold bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
        가벼운 대화 후 길드 디스코드 서버로 안내해 드립니다. 🌰
      </p>
    </section>
  );
}