// app/components/AlbumBook.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function AlbumBook() {
  // 모바일 환경에서 책 플립 상태를 관리하는 State
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <section className="max-w-5xl mx-auto px-6 mb-36 relative z-10 text-center flex flex-col items-center">
      {/* 3D 책 컨테이너 - 클릭 시 상태 토글 */}
      <div 
        className="group w-full max-w-[340px] md:max-w-[400px] h-[400px] md:h-[450px] mx-auto [perspective:1200px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`relative w-full h-full transition-transform duration-1000 ease-out [transform-style:preserve-3d] md:group-hover:[transform:rotateY(180deg)] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* 겉표지 (앞면) */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-amber-900 rounded-r-3xl rounded-l-lg shadow-2xl border border-stone-800 overflow-hidden flex flex-col items-center justify-center p-8 bg-[url('/images/bg-main.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-amber-950/60 backdrop-blur-sm"></div>
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black/40 to-transparent border-r border-white/10 z-10"></div>
            <div className="relative z-20 flex flex-col items-center">
              <span className="text-6xl md:text-7xl mb-6 drop-shadow-xl animate-pulse">📖</span>
              <h3 className="text-2xl md:text-3xl font-black text-amber-50 drop-shadow-lg mb-3 tracking-widest border-y-2 border-amber-50/30 py-3">
                BAMKONG
                <span className="block text-lg md:text-xl font-bold mt-1 text-amber-200">추억 앨범</span>
              </h3>
              <p className="text-amber-100/80 font-bold text-sm bg-black/20 px-4 py-1.5 rounded-full mt-4 border border-white/10">
                터치해서 돌려보세요
              </p>
            </div>
          </div>

          {/* 책 내지 (뒷면) */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#faf8f5] rounded-l-3xl rounded-r-lg shadow-2xl border-2 border-amber-100 overflow-hidden flex flex-col items-center justify-center p-6 md:p-8">
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-stone-300/50 to-transparent border-l border-stone-200/50"></div>
            <div className="relative z-10 flex flex-col items-center h-full justify-between py-4">
              <div className="flex flex-col items-center mt-15">
                <h3 className="text-xl md:text-2xl font-black text-amber-900 mb-4 text-center">
                  밤콩들의 <br/> 따뜻한 기록
                </h3>
                <p className="text-stone-600 font-medium text-sm md:text-[15px] break-keep text-center leading-relaxed">
                  함께 달리고 웃었던 시간들,<br/>
                  뉴비, 복귀 런너님들도 앞으로<br/>
                  예쁜 추억을 채워나가요!
                </p>
              </div>

              <Link 
                href="/album"
                onClick={(e) => e.stopPropagation()} // 링크 클릭 시 부모의 뒤집기 이벤트 방지
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 text-white text-[15px] md:text-base font-bold rounded-xl shadow-[0_6px_0_0_#92400e] hover:translate-y-1 hover:shadow-[0_3px_0_0_#92400e] active:translate-y-2 active:shadow-none transition-all duration-200 w-full"
              >
                앨범 구경하러 가기
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}