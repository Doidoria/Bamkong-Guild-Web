'use client';

import React from 'react';
import { X, Lock, Check } from 'lucide-react';
// 💡 1. Framer Motion 임포트 추가
import { motion, AnimatePresence } from 'framer-motion'; 

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedSkins: number[]; 
  currentSkin: number; 
  onSelectSkin: (id: number) => void;
}

export default function WardrobeModal({ 
  isOpen, 
  onClose, 
  unlockedSkins, 
  currentSkin, 
  onSelectSkin 
}: WardrobeModalProps) {
  const totalSkins = 10;
  const skins = Array.from({ length: totalSkins }, (_, i) => i + 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          // 배경 오버레이 페이드 인/아웃
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-stone-900 border-2 border-amber-500 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.2)] w-full max-w-4xl overflow-hidden flex flex-col"
          >
            
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-amber-500/30 flex justify-between items-center bg-stone-800/50">
              <h3 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
                밤콩이 옷장
              </h3>
              <button onClick={onClose} className="text-stone-400 hover:text-white transition-transform hover:rotate-90 duration-300">
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* 외형 리스트 그리드 */}
            <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-stone-800">
              {skins.map((skinId) => {
                const isUnlocked = unlockedSkins.includes(skinId);
                const isEquipped = currentSkin === skinId;

                return (
                  <div 
                    key={skinId}
                    onClick={() => isUnlocked && onSelectSkin(skinId)}
                    className={`relative aspect-square rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                      isUnlocked 
                        ? isEquipped
                          ? 'border-amber-400 bg-amber-900/30 cursor-default shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'border-stone-600 bg-stone-800 hover:border-amber-500 hover:bg-stone-700 cursor-pointer hover:-translate-y-1'
                        : 'border-stone-800 bg-stone-950/80 cursor-not-allowed'
                    }`}
                  >
                    <img 
                      src={`/images/evolutions/final-${skinId}.png`} 
                      alt={`외형 ${skinId}`}
                      className={`w-full h-full object-contain p-4 transition-all duration-300 ${
                        !isUnlocked 
                          ? 'blur-md grayscale opacity-40 brightness-50'
                          : 'hover:scale-110 drop-shadow-lg'
                      }`}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500">
                        <Lock className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-bold bg-black/80 px-2 py-1 rounded-md">미해금</span>
                      </div>
                    )}

                    {isEquipped && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-amber-950 p-1.5 rounded-full shadow-lg">
                        <Check className="w-4 h-4 font-black" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}