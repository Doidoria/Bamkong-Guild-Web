// app/game/components/RewardModal.tsx
'use client';
import React from 'react';
import { X, Gift, HelpCircle, PackageOpen } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
}

export default function RewardModal({ isOpen, onClose, level }: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[90vw] sm:max-w-md bg-[#faf8f5] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-amber-200/50 flex flex-col overflow-hidden transform-gpu animate-[bounce_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-amber-400 to-orange-400 p-4 sm:p-6 text-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-50 text-white/90 hover:text-white bg-black/10 hover:bg-black/20 p-2 sm:p-3 rounded-full transition-all cursor-pointer hover:rotate-90"
          >
            <X className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-md flex items-center justify-center gap-1.5 sm:gap-2 pr-6">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6" /> 달성 보상 확인
          </h3>
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 relative z-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <p className="text-center text-xs sm:text-sm font-bold text-stone-600 mb-1 break-keep">
            밤콩이를 정성껏 키워주시는 런너님을 위해<br/>레벨업 구간마다 특별한 선물이 기다리고 있어요! 🌰
          </p>

          <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border shadow-sm transition-colors ${level >= 110 ? 'bg-white border-stone-200 hover:border-amber-300' : 'bg-stone-50 border-stone-200 border-dashed opacity-80'}`}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner ${level >= 110 ? 'bg-amber-100 text-amber-600' : 'bg-stone-200 text-stone-500'}`}>
              {level >= 110 ? <PackageOpen className="w-5 h-5 sm:w-7 sm:h-7" /> : <HelpCircle className="w-5 h-5 sm:w-7 sm:h-7" />}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold text-amber-600 mb-0.5 sm:mb-1">
                {level >= 110 ? '110레벨 이후 10레벨 마다 지급' : '110레벨 달성 시 공개'}
              </div>
              <h4 className={`font-black text-base sm:text-lg ${level >= 110 ? 'text-stone-800' : 'text-stone-600'}`}>
                {level >= 110 ? '가구 랜덤 박스' : '??? (비밀 상자)'}
              </h4>
              <p className="text-[11px] sm:text-[12px] text-stone-500 font-medium break-keep">
                {level >= 110 ? `현재까지 총 ${Math.floor((level - 100) / 10)}개 획득 가능` : '방을 꾸밀 수 있는 특별한 아이템이 나와요!'}
              </p>
            </div>
          </div>

          {level >= 200 ? (
            <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-200 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="relative z-10">
                <div className="text-[10px] sm:text-xs font-black text-purple-600 mb-0.5 sm:mb-1 animate-pulse">최종 해금 보상 ✨</div>
                <h4 className="text-purple-900 font-black text-base sm:text-lg break-keep leading-tight">
                  5,000원 상품권 +<br className="sm:hidden" /> 밤콩마스터 칭호
                </h4>
                <p className="text-[11px] sm:text-[12px] text-purple-600/80 font-bold break-keep mt-1">200레벨 달성의 영광스러운 증표!</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 bg-stone-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 shadow-sm border-dashed opacity-80">
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-stone-200 text-stone-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner">
                <HelpCircle className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-bold text-stone-400 mb-0.5 sm:mb-1">최종 보상 (200레벨 달성 시 공개)</div>
                <h4 className="text-stone-600 font-black text-base sm:text-lg">??? (비밀)</h4>
                <p className="text-[11px] sm:text-[12px] text-stone-400 font-medium break-keep">만렙을 달성하고 특별한 보상을 확인하세요!</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 bg-stone-100/50 border-t border-stone-200 text-center relative z-10">
          <p className="text-[10px] sm:text-[11px] font-bold text-stone-500 break-keep">
            ※ 보상 내용은 길드 상황에 따라 변경될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}