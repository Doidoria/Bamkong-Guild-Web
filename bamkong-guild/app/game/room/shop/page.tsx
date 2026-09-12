// app/shop/page.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Shirt, Coins, Lock, BatteryCharging } from 'lucide-react';
import { useBamkongGrowth } from '@/app/game/hooks/useBamkongGrowth';
import { toast } from 'sonner';

const AP_ITEMS = [
  { id: 'ap_1', name: '한 모금 드링크', ap: 1, cost: 100, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-900/50' },
  { id: 'ap_2', name: '작은 드링크', ap: 2, cost: 200, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-900/50' },
  { id: 'ap_3', name: '일반 드링크', ap: 3, cost: 300, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-900/50' },
  { id: 'ap_5', name: '큰 드링크', ap: 5, cost: 480, color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-900/50' },
  { id: 'ap_10', name: '메가 드링크', ap: 10, cost: 900, color: 'from-purple-600 to-fuchsia-600', shadow: 'shadow-purple-900/50' },
  { id: 'ap_15', name: '기적의 엘릭서', ap: 15, cost: 1300, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-900/50' },
];

const SKIN_ITEMS = Array.from({ length: 8 }, (_, i) => ({
  id: `final-${i + 1}`,
  name: `스페셜 외형 ${i + 1}`,
  cost: 2500,
  src: `/images/evolutions/final-${i + 1}.png`
}));

export default function PointShopPage() {
  const { gamePoints, spendGamePoints, ap, MAX_AP, inventory, isLoading } = useBamkongGrowth();

  const handleBuyAp = async (cost: number, apAmount: number, itemName: string) => {
    if (ap >= MAX_AP) {
      toast.error('이미 행동력이 가득 차 있습니다!');
      return;
    }
    if (gamePoints < cost) {
      toast.error('게임 포인트가 부족합니다!');
      return;
    }
    if (window.confirm(`[${itemName}] 아이템을 ${cost.toLocaleString()}P에 구매하시겠습니까?\n(행동력 +${apAmount})`)) {
      const success = await spendGamePoints(cost, 'ap', apAmount);
      if (success) {
        toast.success(`${itemName} 구매 완료! 행동력이 회복되었습니다.`);
      } else {
        toast.error('구매 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleBuySkin = async (cost: number, skinId: string, skinName: string) => {
    if (gamePoints < cost) {
      toast.error('게임 포인트가 부족합니다!');
      return;
    }
    if (window.confirm(`[${skinName}] 외형을 ${cost.toLocaleString()}P에 구매하시겠습니까?`)) {
      const success = await spendGamePoints(cost, 'skin', skinId);
      if (success) {
        toast.success(`${skinName} 획득! 내 방 옷장에서 착용할 수 있습니다.`);
      } else {
        toast.error('구매 처리 중 오류가 발생했습니다.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center font-sans">
        <Coins className="w-12 h-12 text-amber-500 animate-bounce mb-4" />
        <div className="text-xl font-black text-amber-500 animate-pulse">상점 문 여는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans relative flex flex-col pb-20 selection:bg-amber-500/30">
      
      {/* 배경 데코레이션 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 헤더 */}
      <header className="w-full p-4 sm:p-6 lg:px-12 flex justify-between items-center bg-stone-950/60 backdrop-blur-xl border-b border-stone-800 sticky top-0 z-50 transition-all">
        <Link href="/game/room" className="group flex items-center gap-2 text-stone-300 hover:text-amber-400 font-bold bg-stone-900 px-5 py-2.5 rounded-full border border-stone-800 shadow-sm hover:border-amber-500/50 transition-all text-sm sm:text-base">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 방으로 돌아가기
        </Link>
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(217,119,6,0.4)] text-white border border-amber-500/50">
          <Coins className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
          <span className="font-black text-base sm:text-lg drop-shadow-sm">{gamePoints.toLocaleString()} P</span>
        </div>
      </header>

      <main className="max-w-[1920px] w-full mx-auto p-4 sm:p-8 lg:p-12 flex flex-col xl:flex-row gap-8 xl:gap-12 relative z-10">
        
        {/* 1. 행동력 상점 (블랙 & 앰버 테마) */}
        <section className="flex-1 bg-stone-900/80 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border border-stone-800 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b-2 border-stone-800 pb-6 mb-8 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3 text-white tracking-tight">
              <Zap className="text-amber-500 w-8 h-8 sm:w-10 sm:h-10 fill-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" /> AP 충전소
            </h2>
            <div className="text-sm sm:text-base font-black bg-stone-950 px-5 py-2.5 rounded-2xl text-stone-400 flex items-center gap-2 border border-stone-800">
              내 행동력
              <span className={`px-2 py-0.5 rounded-md ${ap >= MAX_AP ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {ap} / {MAX_AP}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 relative z-10">
            {AP_ITEMS.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleBuyAp(item.cost, item.ap, item.name)}
                className={`relative rounded-[2rem] p-5 sm:p-6 flex flex-col items-center transition-all duration-300 cursor-pointer group
                  ${ap >= MAX_AP ? 'bg-stone-950/50 opacity-50 cursor-not-allowed grayscale border border-stone-800' : 'bg-stone-950/80 border-2 border-stone-800 hover:border-amber-500 hover:bg-stone-900 hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:-translate-y-2'}`}
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] mb-5 flex items-center justify-center bg-gradient-to-br ${item.color} shadow-lg ${item.shadow} relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <BatteryCharging className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md group-hover:animate-bounce" />
                </div>

                <h3 className="font-black text-base sm:text-lg text-white mb-1">{item.name}</h3>
                <p className="text-amber-400 font-bold text-xs sm:text-sm mb-5 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">행동력 +{item.ap}</p>
                <button 
                  disabled={ap >= MAX_AP}
                  className="w-full bg-amber-600 group-hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-black py-3 rounded-xl transition-colors text-sm sm:text-base shadow-md group-active:scale-95"
                >
                  {item.cost.toLocaleString()} P
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 외형 스킨 상점 (블랙 & 앰버 테마) */}
        <section className="flex-1 bg-stone-900/80 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border border-stone-800 relative overflow-hidden">

          <div className="border-b-2 border-stone-800 pb-6 mb-8 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3 text-white tracking-tight">
              <Shirt className="text-orange-500 w-8 h-8 sm:w-10 sm:h-10 fill-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" /> 밤콩 부띠끄
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-5 sm:gap-6 relative z-10">
            {SKIN_ITEMS.map((skin) => {
              const isOwned = inventory.includes(skin.id);
              
              return (
                <div 
                  key={skin.id}
                  onClick={() => !isOwned && handleBuySkin(skin.cost, skin.id, skin.name)}
                  className={`relative rounded-[2rem] p-5 sm:p-6 flex flex-col items-center transition-all duration-300 cursor-pointer group
                    ${isOwned ? 'bg-stone-950/80 border border-stone-800 cursor-default' : 'bg-stone-950/80 border-2 border-stone-800 hover:border-orange-500 hover:bg-stone-900 hover:shadow-[0_10px_30px_rgba(249,115,22,0.2)] hover:-translate-y-2'}`}
                >
                  {/* 보유 중 딤 처리 오버레이 */}
                  {isOwned && (
                    <div className="absolute inset-0 bg-stone-950/80 z-20 flex flex-col items-center justify-center backdrop-blur-[2px] rounded-[2rem]">
                      <Lock className="w-8 h-8 text-stone-500 mb-2 drop-shadow-sm" />
                      <span className="font-black text-stone-400 bg-stone-800 px-5 py-2 rounded-full shadow-sm border border-stone-700 text-sm">보유중</span>
                    </div>
                  )}

                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-stone-800 to-stone-700 rounded-[1.5rem] mb-5 overflow-hidden flex items-center justify-center relative shadow-inner border border-stone-600/30">
                    <img src={skin.src} alt={skin.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                  </div>
                  
                  <h3 className="font-black text-base sm:text-lg text-white mb-1">{skin.name}</h3>
                  <p className="text-orange-400 font-bold text-xs sm:text-sm mb-5 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full">스페셜 스킨</p>
                  <button 
                    disabled={isOwned}
                    className={`w-full font-black py-3 rounded-xl transition-all text-sm sm:text-base shadow-md group-active:scale-95
                      ${isOwned ? 'bg-stone-800 text-stone-600 shadow-none' : 'bg-orange-600 group-hover:bg-orange-500 text-stone-950'}`}
                  >
                    {isOwned ? '구매 완료' : `${skin.cost.toLocaleString()} P`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
        
      </main>
    </div>
  );
}