// app/game/components/EvolutionModal.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface EvolutionModalProps {
  isOpen: boolean;
  saveEvolution: (evolutionId: number) => Promise<void>;
}

// 유지보수를 위해 8개의 진화 데이터를 배열로 관리합니다.
const EVOLUTIONS = [
  { id: 1, name: '공주' },
  { id: 2, name: '마법사' },
  { id: 3, name: '숲요정' },
  { id: 4, name: '무지개' },
  { id: 5, name: '얼음' },
  { id: 6, name: '조개' },
  { id: 7, name: '천사' },
  { id: 8, name: '태양' },
];

export default function EvolutionModal({ isOpen, saveEvolution }: EvolutionModalProps) {
  const router = useRouter();
  
  // 🟢 [수정됨] 애니메이션 단계를 세밀하게 관리하기 위한 상태 추가
  const [selectedEvolutionId, setSelectedEvolutionId] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'evolving' | 'flash' | 'revealed'>('idle');

  if (!isOpen) return null;

  // 🟢 [수정됨] 진화 선택 로직 (랜덤 삭제, 페이즈 애니메이션 적용)
  const handleEvolutionSelect = (evoId: number) => {
    if (phase !== 'idle') return; // 중복 클릭 방지
    
    setSelectedEvolutionId(evoId); // 클릭한 실루엣의 ID를 그대로 확정
    setPhase('evolving'); // 1단계: 기 모으기 애니메이션 시작
    
    // 2.5초간 진화 이펙트 진행 후 화면 번쩍임
    setTimeout(() => {
      setPhase('flash'); // 2단계: 화면 화이트아웃
      
      // 0.2초 후 결과 공개
      setTimeout(() => {
        setPhase('revealed'); // 3단계: 최종 형태와 후광 공개
        
        // 결과 확인 후 3초 뒤 방 꾸미기로 이동
        setTimeout(async () => {
          await saveEvolution(evoId); // 확정된 ID 저장
          router.push('/game/room');
        }, 3000);
      }, 200); 
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl transition-all duration-500">
      
      {/* ⚡ 번쩍임 이펙트 (화면 전체 화이트아웃) */}
      {phase === 'flash' && (
        <div className="fixed inset-0 bg-white z-[120] animate-[pulse_0.2s_ease-in-out]" />
      )}

      {/* 메인 컨테이너 - 진화가 시작되면 배경과 테두리를 없애서 몰입감 극대화 */}
      <div className={`w-full max-w-6xl rounded-[2rem] flex flex-col items-center justify-center overflow-hidden relative p-6 sm:p-10 transition-all duration-700
        ${phase === 'idle' ? 'bg-[#faf8f5]/95 shadow-2xl border border-purple-300/50' : 'bg-transparent'}
      `}>

        {/* 안내 텍스트 (진화 시작 시 부드럽게 페이드아웃) */}
        <div className={`transition-opacity duration-500 ${phase !== 'idle' ? 'opacity-0 absolute pointer-events-none' : 'opacity-100 mb-8 w-full'}`}>
          <h2 className="text-2xl sm:text-4xl font-black text-center text-purple-800 drop-shadow-sm mb-2">
            최종 진화의 순간!
          </h2>
          <p className="text-center text-stone-600 font-bold">
            원하는 실루엣을 선택해 밤콩이를 진화시키세요.
          </p>
        </div>

        {/* 카드 그리드 영역 */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 relative w-full max-w-4xl min-h-[300px] items-center">
          {EVOLUTIONS.map((evo) => {
            const isSelected = selectedEvolutionId === evo.id;
            const notSelected = selectedEvolutionId !== null && !isSelected;

            // 🎨 상태에 따른 압도적인 CSS 동적 연출
            let cardClasses = "relative rounded-2xl border-4 transition-all duration-1000 transform-gpu cursor-pointer overflow-hidden flex-shrink-0 ";

            if (phase === 'idle') {
              // 1. 대기 상태 (8개 카드 배치)
              cardClasses += "w-28 h-40 sm:w-36 sm:h-52 md:w-44 md:h-60 border-purple-200 hover:border-purple-400 bg-white shadow-lg hover:scale-105 hover:shadow-purple-500/50";
            } else if (notSelected) {
              // 2. 다른 카드들 (투명해지며 축소되어 사라짐)
              cardClasses += "w-28 h-40 opacity-0 scale-50 absolute pointer-events-none"; 
            } else if (isSelected) {
              // 3. 선택된 카드 (화면 중앙 고정 및 사이즈 확장)
              cardClasses += "w-48 h-64 sm:w-64 sm:h-80 md:w-72 md:h-96 z-50 absolute mx-auto ";
              
              if (phase === 'evolving') {
                // 3-1. 기 모으는 중 (격렬한 흔들림 + 보랏빛 폭풍 발광)
                cardClasses += "border-pink-500 shadow-[0_0_80px_rgba(236,72,153,0.9)] brightness-150 animate-[bounce_0.3s_ease-in-out_infinite]";
              } else if (phase === 'revealed') {
                // 3-2. 진화 완료 (성스러운 황금빛 후광)
                cardClasses += "border-yellow-300 shadow-[0_0_100px_rgba(253,224,71,1)] bg-white/10 backdrop-blur-md";
              }
            }

            return (
              <div key={evo.id} onClick={() => handleEvolutionSelect(evo.id)} className={cardClasses}>
                
                {/* 카드 뒷면 (모자이크 실루엣) */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 bg-black/5 ${phase === 'revealed' && isSelected ? 'opacity-0' : 'opacity-100'}`}>
                  <img 
                    src={`/images/evolutions/silhouette-${evo.id}.png`} 
                    alt={`${evo.name} 실루엣`} 
                    className={`w-full h-full object-cover transition-all duration-500 ${phase === 'evolving' ? 'blur-sm scale-110' : 'blur-xl hover:blur-md'}`} 
                  />
                  {phase === 'idle' && (
                    <span className="absolute text-4xl sm:text-5xl font-black text-purple-900/50 drop-shadow-lg animate-pulse">?</span>
                  )}
                </div>

                {/* 카드 앞면 (결과 이미지 및 텍스트 렌더링) */}
                {phase === 'revealed' && isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-yellow-50/80 to-pink-50/80 animate-[fadeIn_0.5s_ease-in-out] overflow-hidden">
                    {/* 황금빛 소용돌이 후광 이펙트 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent w-[200%] h-[200%] animate-[spin_3s_linear_infinite] origin-center -ml-[50%] -mt-[50%]" />
                    <img 
                      src={`/images/evolutions/final-${evo.id}.png`} 
                      alt="최종 진화체" 
                      className="w-full h-full object-contain p-4 z-10 animate-[bounce_1s_ease-in-out]" 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 결과 텍스트 안내 */}
        {phase === 'revealed' && (
          <div className="mt-48 sm:mt-56 text-center animate-[fadeIn_0.5s_ease-out] z-50">
            <p className="text-2xl sm:text-4xl font-black text-yellow-300 drop-shadow-[0_2px_10px_rgba(253,224,71,0.6)] flex items-center justify-center gap-2 sm:gap-3">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse text-yellow-300" />
              아름다운 모습으로 진화했습니다!
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse text-yellow-300" />
            </p>
            <p className="text-white/80 font-bold mt-3 text-sm sm:text-base animate-pulse">
              잠시 후 방으로 이동합니다...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}