'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Droplet, Sun, Heart, Sparkles, Zap, FastForward, Gamepad2, Gift, HelpCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBamkongGrowth } from './hooks/useBamkongGrowth';
import Leaderboard from './components/Leaderboard';

export default function GamePage() {
  const { 
    user, level, exp, maxExp, ap, MAX_AP, isLoading, timeUntilNextAp, 
    gainExp, resetGame, fillAp, levelUpTen 
  } = useBamkongGrowth();
  
  const [actionType, setActionType] = useState<'none'|'water'|'sun'|'fertilizer'>('none');
  const [showEvolutionEffect, setShowEvolutionEffect] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(level);

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  
  const prevLevelRef = useRef(level);
  const isInitialLoad = useRef(true);
  const characterRef = useRef<HTMLImageElement>(null);

  // 초(Seconds)를 MM:SS 형식으로 변환하는 유틸리티 함수
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 초기 로딩 완료 시 화면 레벨 동기화
  useEffect(() => {
    if (!isLoading) {
      setDisplayLevel(level);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      prevLevelRef.current = level;
      setDisplayLevel(level);
      return; 
    }

    if (level > prevLevelRef.current) {
      if (level % 10 === 0 || level === 1) { 
        setShowEvolutionEffect(true);
        setTimeout(() => {
          setShowEvolutionEffect(false);
          setDisplayLevel(level);
        }, 1500); 
      } else {
        setDisplayLevel(level);
        confetti({ 
          particleCount: 150, 
          spread: 80, 
          origin: { y: 0.5 }, 
          colors: ['#f59e0b', '#fbbf24', '#d97706'] 
        });
      }
    } else if (level < prevLevelRef.current) {
      setDisplayLevel(level);
    }
    
    prevLevelRef.current = level;
  }, [level, isLoading]);

  const handleAction = (type: 'water'|'sun'|'fertilizer', amount: number, cost: number) => {
    if (gainExp(amount, cost)) {
      setActionType(type);
      setTimeout(() => setActionType('none'), 1500); 
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-sans">
        <div className="text-lg sm:text-xl font-bold text-amber-700 animate-pulse">밤콩이 온실 입장 중... 🌰</div>
      </div>
    );
  }

  const getCharacterAnimation = () => {
    switch (actionType) {
      case 'water': return 'scale-90 translate-y-2';
      case 'sun': return 'scale-110 -translate-y-4 rotate-3';
      case 'fertilizer': return 'scale-125 -translate-y-8';
      default: return 'scale-100 translate-y-0 animate-bounce-slow';
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-amber-200 overflow-x-hidden relative text-stone-800">
      <div className="fixed inset-0 -z-20 bg-[url('/images/bg-mobile.jpg')] md:bg-[url('/images/bg-main.jpg')] bg-cover bg-top opacity-90"></div>
      
      {/* 📱 모바일 헤더 패딩 및 텍스트 최적화 */}
      <header className="absolute top-0 w-full z-50 p-4 sm:p-6 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-1.5 sm:gap-2 text-stone-600 hover:text-amber-800 font-bold bg-white/80 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-stone-200 shadow-sm transition-all text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">메인으로</span>
          <span className="sm:hidden">뒤로</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md pl-1.5 sm:pl-2 pr-3 sm:pr-4 py-1.5 rounded-full border border-stone-200 shadow-sm max-w-[140px] sm:max-w-none">
              <img 
                src={user.image} 
                alt="프로필" 
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-stone-200 object-cover bg-stone-100 shrink-0" 
              />
              <span className="text-[13px] sm:text-[15px] font-bold text-stone-700 truncate">
                {user.guildNickname || user.name}님
              </span>
            </div>
          )}
        </div>
      </header>

      {/* 📱 메인 컨텐츠 영역 모바일 여백(pt-20) 조정 */}
      <main className="min-h-screen pt-20 sm:pt-24 pb-12 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 sm:gap-10 p-4 sm:p-6">
        
        <div className="w-full flex flex-col items-center flex-1 relative z-10">
          
          {/* 📱 상태창(Lv, AP, EXP) 구조 모바일 맞춤 정렬 */}
          <div className="w-full max-w-xl bg-white/90 backdrop-blur-lg border border-amber-200/50 p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl mb-8 sm:mb-10 flex flex-col gap-4 sm:gap-5 transform-gpu relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-orange-400"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0">
              <div>
                <span className="text-amber-600 font-black text-xl sm:text-2xl md:text-3xl drop-shadow-sm tracking-tight">
                  {level >= 100 ? 'MAX Lv. 100' : `Lv. ${level}`}
                </span>
                <h2 className="text-stone-700 font-bold text-sm sm:text-lg mt-1">무럭무럭 자라는 밤콩</h2>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-orange-100 px-3 sm:px-4 py-1.5 rounded-full border border-amber-300/50 shadow-sm w-full sm:w-auto justify-center">
                  <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${ap > 0 ? 'text-amber-600 fill-amber-300 animate-pulse' : 'text-stone-400'}`} />
                  <span className="text-xs sm:text-sm font-black text-amber-900">행동력 {ap}/{MAX_AP}</span>
                </div>
                {level < 100 && (
                  <div className="text-stone-500 font-black text-xs sm:text-sm drop-shadow-sm w-full sm:w-auto text-right">
                    {exp} / {maxExp} EXP
                  </div>
                )}
              </div>
            </div>
            
            {level < 100 && (
              <div className="w-full h-4 sm:h-6 bg-stone-200/50 rounded-full overflow-hidden shadow-inner border border-stone-300/30">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-[length:200%_auto] animate-gradient transition-all duration-500 ease-out transform-gpu"
                  style={{ width: `${(exp / maxExp) * 100}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* 캐릭터 렌더링 룸 */}
          <div className="relative w-full max-w-[16rem] sm:max-w-sm aspect-square bg-white border border-amber-50 rounded-[2.5rem] sm:rounded-[3rem] shadow-xl flex flex-col items-center justify-center mb-8 sm:mb-10 overflow-hidden">
            <div className={`absolute inset-0 bg-amber-100/50 transition-opacity duration-300 transform-gpu ${actionType !== 'none' ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="absolute bottom-8 sm:bottom-12 w-2/3 h-4 sm:h-6 bg-black/5 rounded-[100%]"></div>
            
            {showEvolutionEffect && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/50 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-600 drop-shadow-md animate-[bounce_0.5s_ease-in-out_infinite]">
                  성장중...
                </h1>
              </div>
            )}

            {actionType === 'water' && (
              <div className="absolute top-4 right-6 sm:right-8 z-30 flex flex-col items-center animate-[fadeIn_0.2s_ease-out]">
                <img 
                  src="/images/water-can.png" 
                  alt="물 주기" 
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-lg -rotate-48 scale-x-[-1] mb-1" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="flex gap-1 text-blue-400 text-xs sm:text-sm md:text-base">
                  <span className="animate-[ping_0.8s_ease-in-out_infinite]">💧</span>
                  <span className="animate-[ping_0.8s_ease-in-out_infinite_100ms]">💧</span>
                </div>
              </div>
            )}
            
            {actionType === 'sun' && (
              <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30">
                <span className="text-5xl sm:text-6xl md:text-7xl drop-shadow-[0_0_40px_rgba(251,191,36,0.8)] inline-block animate-[spin_4s_linear_infinite]">☀️</span>
              </div>
            )}
            
            {actionType === 'fertilizer' && (
              <div className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 z-30 animate-[fadeIn_0.2s_ease-out]">
                <img 
                  src="/images/fertilizer.png" 
                  alt="영양제 주기" 
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-lg" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            <div className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 z-10 transition-transform duration-300 transform-gpu ${getCharacterAnimation()}`}>
              <img 
                ref={characterRef}
                src={`/images/characters/level-${Math.min(Math.floor(displayLevel / 10) + 1, 10)}.png`} 
                alt={`밤콩 캐릭터 레벨 ${displayLevel}`} 
                className="w-full h-full object-contain drop-shadow-lg transition-opacity duration-300 animate-fadeIn"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* 📱 액션 버튼 3개 모바일 여백 및 텍스트 축소 */}
          <div className="flex w-full max-w-xl justify-center gap-2 sm:gap-3 md:gap-5">
            <button 
              onClick={() => handleAction('water', 10, 1)}
              disabled={ap < 1 || level >= 100}
              className={`group relative flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 p-3 sm:p-4 md:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-md border-2 transition-all overflow-hidden ${ap < 1 || level >= 100 ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-80' : 'bg-blue-50/80 backdrop-blur-sm hover:bg-blue-100 text-blue-600 border-blue-200 hover:-translate-y-1'}`}
            >
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 bg-white/90 px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-100 text-[9px] sm:text-[11px] font-black shadow-sm">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-300" /> 1
              </div>
              <Droplet className={`w-6 h-6 sm:w-8 sm:h-8 ${ap >= 1 && level < 100 && 'group-active:scale-75 transition-transform'}`} />
              <span className="font-black text-xs sm:text-sm tracking-tighter">물 주기 (+10)</span>
            </button>
            
            <button 
              onClick={() => handleAction('sun', 22, 2)}
              disabled={ap < 2 || level >= 100}
              className={`group relative flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 p-3 sm:p-4 md:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-md border-2 transition-all overflow-hidden ${ap < 2 || level >= 100 ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-80' : 'bg-orange-50/80 backdrop-blur-sm hover:bg-orange-100 text-orange-600 border-orange-200 hover:-translate-y-1'}`}
            >
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 bg-white/90 px-1.5 sm:px-2 py-0.5 rounded-full border border-orange-100 text-[9px] sm:text-[11px] font-black shadow-sm">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-300" /> 2
              </div>
              <Sun className={`w-6 h-6 sm:w-8 sm:h-8 ${ap >= 2 && level < 100 && 'group-active:scale-75 transition-transform'}`} />
              <span className="font-black text-xs sm:text-sm tracking-tighter">햇빛 쬐기 (+22)</span>
            </button>
            
            <button 
              onClick={() => handleAction('fertilizer', 35, 3)}
              disabled={ap < 3 || level >= 100}
              className={`group relative flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 p-3 sm:p-4 md:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-md border-2 transition-all overflow-hidden ${ap < 3 || level >= 100 ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-80' : 'bg-pink-50/80 backdrop-blur-sm hover:bg-pink-100 text-pink-600 border-pink-200 hover:-translate-y-1'}`}
            >
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 bg-white/90 px-1.5 sm:px-2 py-0.5 rounded-full border border-pink-100 text-[9px] sm:text-[11px] font-black shadow-sm">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-300" /> 3
              </div>
              {ap >= 3 && level < 100 && <Sparkles className="absolute top-3 right-3 sm:top-5 sm:right-5 w-3 h-3 sm:w-4 sm:h-4 text-pink-400 animate-pulse" />}
              <Heart className={`w-6 h-6 sm:w-8 sm:h-8 ${ap >= 3 && level < 100 && 'group-active:scale-75 transition-transform'}`} />
              <span className="font-black text-xs sm:text-sm tracking-tighter">영양제 (+35)</span>
            </button>
          </div>

          {/* 실시간 타이머 UI 적용 */}
          {ap < MAX_AP && level < 100 && (
            <p className="mt-5 sm:mt-6 text-stone-600 font-bold text-xs sm:text-sm bg-white/80 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-amber-200 shadow-sm animate-pulse flex items-center justify-center gap-1.5 sm:gap-2 break-keep text-center w-fit mx-auto">
              ⏳ 다음 행동력 1 충전까지 <span className="text-amber-600 bg-amber-100/50 px-1.5 sm:px-2 py-0.5 rounded-md">{formatTime(timeUntilNextAp)}</span> 남았어요!
            </p>
          )}
        </div>

        {/* 📱 우측 랭킹 리더보드 영역 패딩 간격 조정 */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 sm:gap-6 shrink-0 relative z-10 mt-4 lg:mt-0">
          <Leaderboard />
          
          <Link
            href="/minigames"
            className="group relative w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-[1.2rem] sm:rounded-[1.5rem] shadow-[0_6px_0_0_#92400e,0_10px_15px_rgba(245,158,11,0.3)] sm:shadow-[0_8px_0_0_#92400e,0_15px_20px_rgba(245,158,11,0.3)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all duration-200 border border-orange-400/50"
          >
            <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6 bg-white text-orange-600 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[12px] font-black shadow-md border border-orange-200 animate-bounce">
              행동력이 부족하다면?
            </div>
            <Gamepad2 className="w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform" />
            <span className="font-black text-base sm:text-lg drop-shadow-sm">미니게임하고 행동력 얻기</span>
          </Link>
          <button onClick={() => setIsRewardModalOpen(true)}
            className="group relative w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-stone-700 to-stone-800 text-amber-400 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-[0_6px_0_0_#44403c,0_10px_15px_rgba(0,0,0,0.2)] sm:shadow-[0_8px_0_0_#44403c,0_15px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_0_0_#44403c,0_5px_10px_rgba(0,0,0,0.2)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all duration-200 border border-stone-600"
          >
            <Gift className="w-5 h-5 sm:w-7 sm:h-7 group-hover:-rotate-12 transition-transform" />
            <span className="font-black text-base sm:text-lg drop-shadow-sm">Lv.100 달성 보상 확인</span>
            {level >= 100 && (
              <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 flex h-4 w-4 sm:h-5 sm:w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-red-500 border-2 border-white shadow-sm"></span>
              </span>
            )}
          </button>
        </div>
      </main>

      {/* 만렙 보상 팝업창 (모달) - 모바일 사이즈 최적화 */}
      {isRewardModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsRewardModalOpen(false)}
        >
          <div 
            className="w-full max-w-[90vw] sm:max-w-sm bg-[#faf8f5] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-amber-200/50 flex flex-col overflow-hidden transform-gpu animate-[bounce_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="relative bg-gradient-to-r from-amber-400 to-orange-400 p-4 sm:p-6 text-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRewardModalOpen(false);
                }}
                className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-50 text-white/90 hover:text-white bg-black/10 hover:bg-black/20 p-2 sm:p-3 rounded-full transition-all cursor-pointer hover:rotate-90"
              >
                <X className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
              <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-md flex items-center justify-center gap-1.5 sm:gap-2 pr-6">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6" /> 100레벨 달성 보상
              </h3>
            </div>

            {/* 모달 바디 (보상 목록) */}
            <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 relative z-10">
              <p className="text-center text-xs sm:text-sm font-bold text-stone-600 mb-1 sm:mb-2 break-keep">
                밤콩이를 끝까지 정성껏 키워주신 런너님을 위해<br/>작은 선물을 준비했어요! 🌰
              </p>

              {/* 1번 보상: 5천원 상품권 */}
              <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 shadow-sm hover:border-amber-300 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-amber-100 text-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-xl sm:text-2xl font-black">₩</span>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-bold text-amber-600 mb-0.5 sm:mb-1">확정 보상</div>
                  <h4 className="text-stone-800 font-black text-base sm:text-lg">5,000원 상품권</h4>
                  <p className="text-[11px] sm:text-[12px] text-stone-500 font-medium break-keep">문화상품권 또는 기프티콘 선택 가능</p>
                </div>
              </div>

              {/* 2번 보상: 미정 (물음표) */}
              <div className="flex items-center gap-3 sm:gap-4 bg-stone-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 shadow-sm border-dashed opacity-80">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-stone-200 text-stone-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner">
                  <HelpCircle className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-bold text-stone-400 mb-0.5 sm:mb-1">추가 보상 (준비 중)</div>
                  <h4 className="text-stone-600 font-black text-base sm:text-lg">??? (비밀)</h4>
                  <p className="text-[11px] sm:text-[12px] text-stone-400 font-medium break-keep">어떤 보상이 추가될지 기대해 주세요!</p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-3 sm:p-4 bg-stone-100/50 border-t border-stone-200 text-center relative z-10">
              <p className="text-[10px] sm:text-[11px] font-bold text-stone-500 break-keep">
                ※ 보상 내용은 길드 상황에 따라 변경될 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}