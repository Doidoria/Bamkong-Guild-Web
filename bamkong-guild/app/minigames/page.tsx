// app/minigames/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gamepad2, Sparkles, Dices, Layers, Zap } from 'lucide-react';
import { useBamkongGrowth } from '../game/hooks/useBamkongGrowth';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface MinigameProps {
  onPlay: (gameId: 'roulette'|'dice'|'card', reward: number) => void;
  hasPlayedToday: boolean;
}

// --- 공통 보상 처리 유틸리티 ---
const REWARDS = [0, 1, 2, 3]; 
const getRandomReward = () => REWARDS[Math.floor(Math.random() * REWARDS.length)];

const triggerWinEffect = () => {
  confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#f59e0b', '#fbbf24', '#d97706'] });
};

// ==========================================
// 1. 🎰 행운의 룰렛 게임
// ==========================================
function RouletteGame({ onPlay, hasPlayedToday }: MinigameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const sections = [0, 1, 0, 2, 0, 3];

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const randomIndex = Math.floor(Math.random() * sections.length);
    const targetReward = sections[randomIndex];
    
    const extraSpins = 360 * 5; 
    const sectionAngle = 360 / sections.length;
    const targetRotation = extraSpins + (360 - (randomIndex * sectionAngle));

    setRotation((prev) => prev + targetRotation + Math.floor(Math.random() * 30));

    setTimeout(() => {
      setIsSpinning(false);
      setResult(targetReward);
      if (targetReward > 0) triggerWinEffect();
      onPlay('roulette', targetReward);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center gap-10 animate-fadeIn">
      <div className="relative w-64 h-64 md:w-80 md:h-80 drop-shadow-2xl">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-4xl drop-shadow-md animate-bounce">👇</div>
        <div 
          className="w-full h-full rounded-full border-4 border-amber-500 shadow-inner overflow-hidden transition-all duration-[4000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(
              #fef3c7 0deg 60deg, #fde68a 60deg 120deg, 
              #fef3c7 120deg 180deg, #fde68a 180deg 240deg, 
              #fef3c7 240deg 300deg, #fde68a 300deg 360deg)` 
          }}
        >
          {sections.map((reward, idx) => (
            <React.Fragment key={idx}>
              <div 
                className="absolute top-0 left-1/2 w-[3px] h-1/2 bg-amber-600/40 -translate-x-1/2 origin-bottom z-10"
                style={{ transform: `rotate(${idx * 60}deg)` }}
              ></div>
              <div 
                className="absolute inset-0 w-full h-full flex justify-center text-xl font-black pt-5 text-amber-900 z-20"
                style={{ transform: `rotate(${idx * 60 + 30}deg)` }}
              >
                {reward === 0 ? '💥 꽝' : `⚡ ${reward}`}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full border-4 border-white shadow-lg z-10"></div>
      </div>

      <div className="text-center h-16 flex items-center justify-center">
        {result !== null || hasPlayedToday ? (
          <p className="text-2xl font-black text-amber-600 animate-[bounce_0.5s_ease-in-out]">
            {result !== null ? (result > 0 ? `축하합니다! 행동력 ${result} 획득!` : '앗... 꽝입니다! 내일 다시 도전하세요.') : '오늘 이미 참여하셨습니다! 내일 봬요!'}
          </p>
        ) : (
          <button onClick={spin} disabled={isSpinning || hasPlayedToday} className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-full shadow-[0_6px_0_0_#92400e] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-y-1 hover:shadow-[0_3px_0_0_#92400e] active:translate-y-2 active:shadow-none text-lg border border-orange-400/50">
            {isSpinning ? '돌아가는 중...' : '룰렛 돌리기!'}
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. 🎲 주사위 굴리기 게임
// ==========================================
function DiceGame({ onPlay, hasPlayedToday }: MinigameProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [dice, setDice] = useState([1, 1]);
  const [result, setResult] = useState<number | null>(null);

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);

    let rolls = 0;
    const interval = setInterval(() => {
      setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      rolls++;
      if (rolls > 15) {
        clearInterval(interval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDice([d1, d2]);
        const sum = d1 + d2;
        
        let reward = 0;
        if (sum >= 6 && sum <= 8) reward = 1;
        else if (sum >= 9 && sum <= 10) reward = 2;
        else if (sum >= 11) reward = 3;

        setResult(reward);
        setIsRolling(false);
        if (reward > 0) triggerWinEffect();
        onPlay('dice', reward);
      }
    }, 100);
  };

  const getDiceEmoji = (num: number) => ['⚀','⚁','⚂','⚃','⚄','⚅'][num - 1];

  return (
    <div className="flex flex-col items-center gap-12 animate-fadeIn">
      <div className="flex gap-8">
        {dice.map((d, i) => (
          <div key={i} className={`text-8xl md:text-[9rem] text-amber-600 drop-shadow-xl transition-transform ${isRolling ? 'animate-[bounce_0.3s_infinite]' : 'hover:scale-110'}`}>
            {getDiceEmoji(d)}
          </div>
        ))}
      </div>
      <div className="text-center h-20 flex items-center justify-center">
        {result !== null || hasPlayedToday ? (
          <p className="text-xl md:text-2xl font-black text-amber-600 leading-tight">
            {hasPlayedToday && result !== null && (
              <>
                주사위 합: {dice[0] + dice[1]} <br/>
              </>
            )}
            {result !== null 
              ? (result > 0 ? `행동력 ${result} 획득!` : '꽝! 눈물이 주르륵...')
              : '오늘 이미 참여하셨습니다! 내일 봬요!'
            }
          </p>
        ) : (
          <button onClick={rollDice} disabled={isRolling || hasPlayedToday} className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-full shadow-[0_6px_0_0_#92400e] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-y-1 hover:shadow-[0_3px_0_0_#92400e] active:translate-y-2 active:shadow-none text-lg border border-orange-400/50">
            주사위 굴리기!
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. 🃏 행운의 카드 뒤집기
// ==========================================
function CardGame({ onPlay, hasPlayedToday }: MinigameProps) {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [rewards, setRewards] = useState<number[]>([]);

  useEffect(() => {
    setRewards([getRandomReward(), getRandomReward(), getRandomReward()]);
  }, []);

  const flipCard = (idx: number) => {
    if (flippedIndex !== null || hasPlayedToday) return; // 이미 했으면 클릭 방지
    setFlippedIndex(idx);
    if (rewards[idx] > 0) triggerWinEffect();
    onPlay('card', rewards[idx]);
  };

  return (
    <div className="flex flex-col items-center gap-12 animate-fadeIn">
      <div className="flex gap-4 md:gap-10 [perspective:1000px]">
        {rewards.map((reward, idx) => (
          <div 
            key={idx} 
            onClick={() => flipCard(idx)}
            className={`relative w-28 h-40 md:w-36 md:h-52 cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${flippedIndex === idx ? '[transform:rotateY(180deg)]' : 'hover:-translate-y-3'}`}
          >
            {/* 카드 뒷면 */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl border-4 border-amber-300 shadow-xl flex items-center justify-center [backface-visibility:hidden]">
              <div className="w-[85%] h-[85%] border-2 border-dashed border-amber-400/50 rounded-xl flex items-center justify-center">
                <span className="text-5xl drop-shadow-md">❓</span>
              </div>
            </div>
            {/* 카드 앞면 */}
            <div className="absolute inset-0 w-full h-full bg-white rounded-2xl border-4 border-amber-400 shadow-xl flex flex-col items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <span className="text-5xl md:text-6xl mb-3 drop-shadow-md">{reward > 0 ? '⚡' : '💥'}</span>
              <span className="font-black text-amber-800 text-xl md:text-2xl">{reward > 0 ? `+${reward}` : '꽝'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="h-8 flex items-center">
        <p className="text-lg font-black text-stone-600 bg-white/60 px-6 py-2 rounded-full border border-stone-200/50 shadow-sm">
          {flippedIndex !== null || hasPlayedToday ? '내일 다시 도전해 보세요!' : '세 장의 카드 중 하나를 선택하세요!'}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 메인 미니게임 허브 페이지
// ==========================================
export default function MiniGamesPage() {
  const [activeTab, setActiveTab] = useState<'roulette' | 'dice' | 'card'>('roulette');
  const { ap, MAX_AP, playedGames, handleMinigamePlay, isLoading, resetMinigameStatus } = useBamkongGrowth();
  const isAllPlayed = playedGames.roulette && playedGames.dice && playedGames.card;

  const tabs = [
    { id: 'roulette', name: '룰렛 돌리기', icon: Sparkles },
    { id: 'dice', name: '주사위 굴리기', icon: Dices },
    { id: 'card', name: '카드 뽑기', icon: Layers },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-sans">
        <div className="text-xl font-bold text-amber-700 animate-pulse">밤콩 행동력 충전소 입장 중... 🎲</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-amber-200 overflow-x-hidden relative text-stone-800">
      <div className="fixed inset-0 -z-20 bg-[url('/images/bg-mobile.jpg')] md:bg-[url('/images/bg-main.jpg')] bg-cover bg-top opacity-50"></div>
      
      {/* 상단 헤더 */}
      <header className="absolute top-0 w-full z-50 p-6 flex justify-between items-center">
        <Link 
          href="/game" 
          className="group flex items-center gap-2 text-stone-600 hover:text-amber-800 font-bold bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-stone-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          밤콩 온실로 돌아가기
        </Link>
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200 shadow-sm font-black text-stone-700">
          <Gamepad2 className="w-5 h-5 text-amber-600" />
          <span>행동력 충전소</span>
        </div>
      </header>

      <main className="min-h-screen pt-20 pb-12 px-6 w-full max-w-4xl mx-auto flex flex-col items-center">
        
        <div className="text-center mb-8 relative">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-600 to-orange-600 mb-3 drop-shadow-sm">
            오늘의 운세 테스트 🍀
          </h1>
          <p className="text-stone-600 font-bold text-sm sm:text-base break-keep bg-white/60 px-6 py-2 rounded-full border border-stone-200/50 shadow-sm inline-block">
            매일 한 번씩 원하는 미니게임에 도전해서 밤콩 행동력(AP)을 획득하세요!
          </p>
        </div>

        {/* 행동력 현황 카드 */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-amber-200 shadow-md w-full max-w-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
          <div className="flex items-center gap-4 mb-3 md:mb-0">
            <div className="p-2.5 bg-amber-100 rounded-xl shadow-inner">
              <Zap className="w-6 h-6 text-amber-600 fill-amber-300 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-stone-500">내 행동력 현황</p>
              <p className="text-xl font-black text-stone-800 tracking-tight">{ap} <span className="text-stone-400 text-sm">/ {MAX_AP}</span></p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end shrink-0">
            {isAllPlayed ? (
              <span className="px-3 py-1.5 bg-stone-100 text-stone-500 text-[11px] font-black rounded-lg border border-stone-200 shadow-sm text-center">
                오늘 게임 완료 💤
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-black rounded-lg border border-emerald-200 shadow-sm animate-pulse text-center">
                플레이 가능 🎲
              </span>
            )}
            
            {/* 테스트용 미니게임 횟수 초기화 버튼 */}
            {/* <button onClick={resetMinigameStatus}
              className="px-3 py-1 bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-500 text-[10px] font-bold rounded border border-stone-200 transition-colors shadow-sm"
            > 🛠️ 횟수 초기화
            </button> */}
          </div>
        </div>

        {/* 탭 버튼 영역 */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] max-w-[180px] flex flex-col items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-sm md:text-base transition-all shadow-md border-2 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-400 text-orange-600 -translate-y-1 scale-105 shadow-orange-200' 
                  : 'bg-white/80 border-transparent text-stone-500 hover:bg-white hover:text-amber-600 hover:border-amber-200'
              }`}
            >
              <tab.icon className={`w-7 h-7 ${activeTab === tab.id ? 'animate-bounce' : ''}`} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* 게임 렌더링 룸 */}
        <div className="w-full bg-white/90 backdrop-blur-lg border border-amber-200/50 rounded-[3rem] shadow-2xl p-8 md:p-16 min-h-[450px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-[length:200%_auto] animate-gradient"></div>
          
          {activeTab === 'roulette' && <RouletteGame onPlay={handleMinigamePlay} hasPlayedToday={playedGames.roulette} />}
          {activeTab === 'dice' && <DiceGame onPlay={handleMinigamePlay} hasPlayedToday={playedGames.dice} />}
          {activeTab === 'card' && <CardGame onPlay={handleMinigamePlay} hasPlayedToday={playedGames.card} />}
        </div>

      </main>
    </div>
  );
}