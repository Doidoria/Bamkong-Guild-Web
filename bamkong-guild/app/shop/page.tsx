// app/shop/page.tsx
'use client';
import React from 'react';
import { ArrowLeft, Zap, Shirt, Coins } from 'lucide-react';
import Link from 'next/link';
// import { useBamkongGrowth } from '@/app/game/hooks/useBamkongGrowth'; 

export default function PointShopPage() {
  // 실제 연동 시 useBamkongGrowth에서 gamePoints, buyItem 등을 가져옵니다.
  const gamePoints = 1500; 

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-200">
      <header className="w-full p-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <Link href="/game" className="flex items-center gap-2 text-stone-600 hover:text-amber-800 font-bold transition-all">
          <ArrowLeft className="w-5 h-5" /> 메인으로
        </Link>
        <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full border border-amber-300">
          <Coins className="w-5 h-5 text-amber-600" />
          <span className="font-black text-amber-900">{gamePoints.toLocaleString()} P</span>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 행동력 상점 */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Zap className="text-amber-500" /> 행동력 충전
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-stone-100 rounded-2xl p-4 flex flex-col items-center hover:border-amber-300 transition-colors cursor-pointer group">
              {/* 텍스트 없는 퓨어 그래픽 에셋만 렌더링 */}
              <div className="w-32 h-32 bg-stone-100 rounded-xl mb-4 overflow-hidden">
                <img src="/images/shop/ap-potion.png" alt="행동력 물약" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg">에너지 드링크</h3>
              <p className="text-stone-500 text-sm mb-3">행동력 +5</p>
              <button className="w-full bg-stone-800 text-white font-bold py-2 rounded-xl">300 P</button>
            </div>
          </div>
        </section>

        {/* 외형 상점 */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Shirt className="text-pink-500" /> 밤콩이 외형
          </h2>
          <div className="grid grid-cols-2 gap-4">
             {/* 외형 아이템 카드 */}
             <div className="border-2 border-stone-100 rounded-2xl p-4 flex flex-col items-center hover:border-pink-300 transition-colors cursor-pointer group">
              <div className="w-32 h-32 bg-stone-100 rounded-xl mb-4 overflow-hidden">
                <img src="/images/shop/skin-crown.png" alt="왕관 스킨" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg">빛나는 왕관</h3>
              <p className="text-stone-500 text-sm mb-3">스킨 장착</p>
              <button className="w-full bg-pink-500 text-white font-bold py-2 rounded-xl">2,000 P</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}