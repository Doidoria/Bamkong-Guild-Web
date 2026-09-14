// app/minigames/page.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Lock, Coins, Trophy, Sparkles } from 'lucide-react';
import { useBamkongGrowth } from '@/app/game/hooks/useBamkongGrowth';

export default function MinigameHubPage() {
  const { gamePoints, isLoading } = useBamkongGrowth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center font-sans">
        <Gamepad2 className="w-12 h-12 text-amber-500 animate-bounce mb-4" />
        <div className="text-xl font-black text-amber-500 animate-pulse">게임기 켜는 중...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-stone-950 text-stone-200 font-sans relative flex flex-col selection:bg-amber-500/30">
      
      {/* 배경 데코레이션 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 헤더 */}
      <header className="w-full p-4 sm:p-6 lg:px-12 flex justify-between items-center bg-stone-950/60 backdrop-blur-xl border-b border-stone-800 sticky top-0 z-50 transition-all">
        <Link href="/game/room" className="group flex items-center gap-2 text-stone-300 hover:text-amber-400 font-bold bg-stone-900 px-5 py-2.5 rounded-full border border-stone-800 shadow-sm hover:border-amber-500/50 transition-all text-sm sm:text-base">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 내 방으로
        </Link>
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(217,119,6,0.4)] text-white border border-amber-500/50">
          <Coins className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
          <span className="font-black text-base sm:text-lg drop-shadow-sm">{gamePoints.toLocaleString()} P</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 lg:p-12 relative z-10 flex flex-col items-center justify-center">
        
        {/* 타이틀 영역 */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-stone-900 rounded-full border border-stone-700 mb-6 shadow-xl shadow-amber-900/20">
            <Gamepad2 className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">밤콩 오락실</h1>
          <p className="text-stone-400 font-medium text-sm sm:text-base">
            미니게임을 플레이하고 포인트를 모아 상점에서 다양한 아이템을 구매하세요!
          </p>
        </div>

        {/* 게임 리스트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          
          {/* 1. 플레이 가능한 미니게임 (도토리 피하기) */}
          <Link href="/game/room/minigames/acorn-dodge" className="group relative bg-stone-900/80 backdrop-blur-md rounded-[2rem] p-6 border-2 border-stone-800 hover:border-amber-500 hover:bg-stone-900 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20"></div>
            
            <div className="w-full aspect-video bg-gradient-to-br from-amber-900/50 to-stone-950 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden border border-stone-700/50 group-hover:border-amber-500/50 transition-colors">
              <div className="absolute inset-0 bg-[url('/images/minigame/acorn-bg.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
              <Trophy className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] group-hover:scale-110 transition-transform duration-300 relative z-10" />
            </div>
            
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">도토리 피하기</h3>
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded border border-amber-500/30">HOT</span>
            </div>
            <p className="text-stone-400 text-sm mb-6 flex-1 break-keep">
              하늘에서 쏟아지는 도토리를 피하세요! 오래 버틸수록 더 많은 포인트를 획득합니다.
            </p>
            
            <button className="w-full py-4 bg-amber-600 group-hover:bg-amber-500 text-stone-950 font-black rounded-xl transition-colors flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> 플레이하기
            </button>
          </Link>

          {/* 2. 플레이 가능한 미니게임 (달려라 밤콩) */}
          <Link href="/game/room/minigames/dash" className="group relative bg-stone-900/80 backdrop-blur-md rounded-[2rem] p-6 border-2 border-stone-800 hover:border-amber-500 hover:bg-stone-900 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20"></div>
            
            <div className="w-full aspect-video bg-gradient-to-br from-amber-900/50 to-stone-950 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden border border-stone-700/50 group-hover:border-amber-500/50 transition-colors">
              <div className="absolute inset-0 opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: 'linear-gradient(90deg, #f59e0b 1px, transparent 1px)', backgroundSize: '20px 100%' }}></div>
              <Gamepad2 className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] group-hover:scale-110 transition-transform duration-300 relative z-10" />
            </div>
            
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">달려라 밤콩!</h3>
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded border border-amber-500/30">NEW</span>
            </div>
            <p className="text-stone-400 text-sm mb-6 flex-1 break-keep">
              장애물을 뛰어넘고 끝없이 달려보세요! 달린 거리에 비례하여 포인트를 획득합니다.
            </p>
            
            <button className="w-full py-4 bg-amber-600 group-hover:bg-amber-500 text-stone-950 font-black rounded-xl transition-colors flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> 플레이하기
            </button>
          </Link>

          {/* 🟢 3. 오픈 예정 게임 2 */}
          <div className="relative bg-stone-950/50 rounded-[2rem] p-6 border-2 border-stone-800/50 flex flex-col opacity-75 grayscale hover:grayscale-0 transition-all duration-500 cursor-not-allowed">
            <div className="absolute inset-0 bg-stone-950/40 z-10 rounded-[2rem] flex flex-col items-center justify-center backdrop-blur-[2px]">
              <Lock className="w-12 h-12 text-stone-500 mb-3 drop-shadow-md" />
              <span className="bg-stone-800 text-stone-300 font-bold px-4 py-2 rounded-full border border-stone-700 text-sm tracking-widest">COMING SOON</span>
            </div>

            <div className="w-full aspect-video bg-stone-900 rounded-2xl mb-6 flex items-center justify-center border border-stone-800">
              <span className="text-6xl font-black text-stone-800">?</span>
            </div>
            
            <h3 className="text-xl font-black text-stone-500 mb-2">비밀의 미니게임</h3>
            <p className="text-stone-600 text-sm mb-6 flex-1">
              새로운 게임이 곧 업데이트될 예정입니다. 조금만 기다려주세요!
            </p>
            <div className="w-full py-4 bg-stone-800 text-stone-600 font-black rounded-xl text-center">
              준비 중
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}