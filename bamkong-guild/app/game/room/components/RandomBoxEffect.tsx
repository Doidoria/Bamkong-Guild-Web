'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package } from 'lucide-react';
import { InventoryItem } from '../constants/inventory';

interface RandomBoxEffectProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export default function RandomBoxEffect({ item, onClose }: RandomBoxEffectProps) {
  const [step, setStep] = useState<'waiting' | 'opening' | 'opened'>('waiting');

  if (!item) return null;

  const handleBoxClick = () => {
    if (step !== 'waiting') return;
    setStep('opening');
    
    // 1.2초 동안 흔들리는 애니메이션 후 오픈 상태로 전환
    setTimeout(() => {
      setStep('opened');
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-sm"
      >
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          
          {/* 빛 번짐 배경 효과 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                scale: step === 'opened' ? [1, 3, 2] : 1,
                opacity: step === 'opened' ? [0, 1, 0.4] : 0 
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="w-[50vw] h-[50vw] bg-amber-500/20 rounded-full blur-[100px]"
            />
          </div>

          {step !== 'opened' ? (
            <motion.div
              onClick={handleBoxClick}
              animate={step === 'opening' ? {
                x: [-10, 10, -10, 10, -5, 5, 0],
                y: [0, -10, 0, -10, 0],
                scale: [1, 1.1, 1.1, 1.1, 1],
              } : { 
                y: [0, -15, 0] 
              }}
              transition={step === 'opening' 
                ? { duration: 0.6, repeat: 1 } 
                : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }
              className="relative cursor-pointer group z-10 flex flex-col items-center gap-6"
            >
              {/* 실제 프로젝트에서는 /images/room/random-box.png 와 같은 에셋 사용 권장 */}
              <div className="w-48 h-48 bg-stone-800 rounded-3xl border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-24 h-24 text-amber-500" />
              </div>
              <p className="text-amber-400 font-bold text-xl animate-pulse">
                {step === 'waiting' ? '클릭해서 상자 열기!' : '두구두구두구...'}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="relative">
                <Sparkles className="absolute -top-10 -left-10 w-12 h-12 text-amber-300 animate-[spin_3s_linear_infinite]" />
                <Sparkles className="absolute -bottom-10 -right-10 w-16 h-16 text-yellow-400 animate-[spin_4s_linear_infinite_reverse]" />
                
                <img 
                  src={item.src} 
                  alt={item.name} 
                  className="w-64 h-64 object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.8)]"
                />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col items-center gap-6"
              >
                <div className="text-center">
                  <h2 className="text-4xl font-black text-white drop-shadow-lg mb-2">{item.name}</h2>
                  <p className="text-amber-300 text-lg">새로운 가구를 획득했습니다!</p>
                </div>
                
                <button 
                  onClick={onClose}
                  className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-black px-10 py-4 rounded-2xl text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  방 꾸미기 시작
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}