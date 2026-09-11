// app/game/components/EvolutionModal.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, AlertTriangle } from 'lucide-react'; // 🟢 아이콘 추가

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
  
  // 애니메이션 단계를 세밀하게 관리하기 위한 상태 추가
  const [selectedEvolutionId, setSelectedEvolutionId] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'evolving' | 'flash' | 'revealed'>('idle');
  
  // 🟢 실수 방지용 확인창 상태 추가
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  if (!isOpen) return null;

  // 🟢 1단계: 실루엣 클릭 시 바로 진화하지 않고 확인창 띄우기
  const handleInitialSelect = (evoId: number) => {
    if (phase !== 'idle') return;
    setConfirmingId(evoId);
  };

  // 🟢 2단계: 확인창에서 '진화 시작' 버튼을 눌렀을 때 실행되는 런너님의 오리지널 애니메이션 로직
  const confirmEvolution = () => {
    if (confirmingId === null) return;
    const evoId = confirmingId;
    setConfirmingId(null); // 확인창 닫기
    
    setSelectedEvolutionId(evoId); 
    setPhase('evolving'); 
    
    setTimeout(() => {
      setPhase('flash'); 
      
      setTimeout(() => {
        setPhase('revealed'); 
        
        setTimeout(async () => {
          await saveEvolution(evoId); 
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

      {/* 🟢 실수 방지용 확인창 오버레이 (카드 위에 부드럽게 나타남) */}
      {confirmingId !== null && phase === 'idle' && (
        <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-[320px] w-full mx-4 border-2 border-purple-200 transform-gpu animate-[bounce_0.3s_ease-out]">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-stone-800 mb-2">이 실루엣을 선택할까요?</h3>
            <p className="text-sm text-stone-500 mb-6 text-center break-keep font-medium">
              한 번 진화가 시작되면 다른 모습으로 되돌릴 수 없습니다!
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmingId(null)} className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl transition-colors">
                취소
              </button>
              <button onClick={confirmEvolution} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                진화 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 컨테이너 */}
      <div className={`w-full max-w-6xl rounded-[2rem] flex flex-col items-center justify-center overflow-hidden relative p-6 sm:p-10 transition-all duration-700
        ${phase === 'idle' ? 'bg-[#faf8f5]/95 shadow-2xl border border-purple-300/50' : 'bg-transparent'}
      `}>

        {/* 안내 텍스트 */}
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

            let cardClasses = "relative rounded-2xl border-4 transition-all duration-1000 transform-gpu cursor-pointer overflow-hidden flex-shrink-0 ";

            if (phase === 'idle') {
              cardClasses += "w-28 h-40 sm:w-36 sm:h-52 md:w-44 md:h-60 border-purple-200 hover:border-purple-400 bg-white shadow-lg hover:scale-105 hover:shadow-purple-500/50";
            } else if (notSelected) {
              cardClasses += "w-28 h-40 opacity-0 scale-50 absolute pointer-events-none"; 
            } else if (isSelected) {
              cardClasses += "w-48 h-64 sm:w-64 sm:h-80 md:w-72 md:h-96 z-50 absolute mx-auto ";
              
              if (phase === 'evolving') {
                cardClasses += "border-pink-500 shadow-[0_0_80px_rgba(236,72,153,0.9)] brightness-150 animate-[bounce_0.3s_ease-in-out_infinite]";
              } else if (phase === 'revealed') {
                cardClasses += "border-yellow-300 shadow-[0_0_100px_rgba(253,224,71,1)] bg-white/10 backdrop-blur-md";
              }
            }

            return (
              // 🟢 변경됨: onClick 시 handleEvolutionSelect 대신 handleInitialSelect 실행
              <div key={evo.id} onClick={() => handleInitialSelect(evo.id)} className={cardClasses}>
                
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