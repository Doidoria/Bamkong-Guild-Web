//app/game/room/components/AdminRoomPanel.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, Unlock, LayoutGrid, Trash2, RotateCcw, X } from 'lucide-react';
import { INVENTORY_ITEMS } from '../constants/inventory';

interface AdminRoomPanelProps {
  ownedItems: string[];
  setOwnedItems: React.Dispatch<React.SetStateAction<string[]>>;
  placedItems: any[];
  setPlacedItems: React.Dispatch<React.SetStateAction<any[]>>;
  onSave: (newOwned: string[], newPlaced: any[]) => void;
  onUnlockAllSkins?: () => void;
  onResetSkins?: () => void;
}

export default function AdminRoomPanel({ 
  ownedItems, setOwnedItems, placedItems, setPlacedItems, onSave, onUnlockAllSkins, onResetSkins
}: AdminRoomPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. 모든 가구 해금 (인벤토리에 모두 추가)
  const handleUnlockAll = () => {
    if (!confirm('[관리자 권한] 모든 가구를 인벤토리에 추가하시겠습니까?')) return;
    const allItemIds = INVENTORY_ITEMS.map(item => item.id);
    setOwnedItems(allItemIds);
    onSave(allItemIds, placedItems);
  };

  // 2. 보유한 가구 일괄 배치
  const handlePlaceAll = () => {
    if (!confirm('[관리자 권한] 보유한 모든 가구를 방에 배치하시겠습니까?')) return;
    const newPlaced = ownedItems.map((itemId, index) => {
      const defaultData = INVENTORY_ITEMS.find(i => i.id === itemId);
      // 겹치지 않게 좌표를 약간씩 띄워서 그리드 형태로 자동 배치
      const xOffset = 20 + (index % 5) * 15;
      const yOffset = 40 + Math.floor(index / 5) * 15;
      return { 
        id: itemId, 
        xPos: defaultData?.xPos ? defaultData.xPos : xOffset, 
        yPos: defaultData?.yPos ? defaultData.yPos : yOffset 
      };
    });
    setPlacedItems(newPlaced);
    onSave(ownedItems, newPlaced);
  };

  // 3. 배치된 가구 모두 회수
  const handleClearAll = () => {
    if (!confirm('[관리자 권한] 배치된 모든 가구를 보관함으로 회수하시겠습니까?')) return;
    setPlacedItems([]);
    onSave(ownedItems, []);
  };

  // 4. 계정 방 데이터 완전 초기화 (첫 접속 상태로)
  const handleResetRoom = async () => {
    if (!confirm('⚠️ [위험] 방의 모든 데이터(보유 가구 포함)를 초기화하시겠습니까? (랜덤박스 다시 테스트 가능)')) return;
    
    setOwnedItems([]);
    setPlacedItems([]);
    
    // DB 초기화가 완료될 때까지 기다림
    await onSave([], []); 
    
    alert('방 데이터가 완전히 초기화되었습니다. 새로고침 됩니다!');
    window.location.reload(); 
  };

  return (
    <>
      {/* 관리자 패널 토글 버튼 */}
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-22 left-6 z-[60] flex items-center gap-2 bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-red-400/50 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all group"
      >
        <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-sm">관리자 도구</span>
      </button>

      {/* 관리자 대시보드 모달/사이드바 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="absolute top-24 left-6 z-[70] w-72 bg-stone-900/95 backdrop-blur-2xl border border-red-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-red-500/20 flex justify-between items-center bg-red-950/30">
              <div className="flex items-center gap-2 text-red-400 font-black">
                <Shield className="w-5 h-5" />
                ADMIN DASHBOARD
              </div>
              <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <button onClick={handleUnlockAll} className="flex items-center gap-3 bg-stone-800 hover:bg-stone-700 text-stone-200 p-3 rounded-xl transition-colors border border-white/5 hover:border-emerald-500/30">
                <Unlock className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="font-bold text-sm text-white">모든 가구 해금</p>
                  <p className="text-[10px] text-stone-400">인벤토리에 전 품목 추가</p>
                </div>
              </button>

              <button onClick={handlePlaceAll} className="flex items-center gap-3 bg-stone-800 hover:bg-stone-700 text-stone-200 p-3 rounded-xl transition-colors border border-white/5 hover:border-blue-500/30">
                <LayoutGrid className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="font-bold text-sm text-white">전체 가구 배치</p>
                  <p className="text-[10px] text-stone-400">보유 가구를 방에 일괄 세팅</p>
                </div>
              </button>

              <button onClick={handleClearAll} className="flex items-center gap-3 bg-stone-800 hover:bg-stone-700 text-stone-200 p-3 rounded-xl transition-colors border border-white/5 hover:border-amber-500/30">
                <Trash2 className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <p className="font-bold text-sm text-white">전체 가구 회수</p>
                  <p className="text-[10px] text-stone-400">방을 빈 상태로 만듦</p>
                </div>
              </button>

              <div className="h-px w-full bg-white/5 my-2"></div>

              <button onClick={handleResetRoom} className="flex items-center gap-3 bg-red-950/40 hover:bg-red-900/60 text-red-200 p-3 rounded-xl transition-colors border border-red-900 hover:border-red-500/50">
                <RotateCcw className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <p className="font-bold text-sm text-red-400">방 데이터 완전 초기화</p>
                  <p className="text-[10px] text-red-300/60">랜덤박스 튜토리얼 재시작용</p>
                </div>
              </button>

              <button onClick={() => {
                  if (confirm('모든 외형(1~10번)을 강제로 해금하시겠습니까?')) {
                    onUnlockAllSkins?.();
                  }
                }}
                className="w-full bg-stone-800 hover:bg-stone-700 text-amber-400 py-2.5 rounded-xl font-bold text-sm transition-colors border border-amber-500/30"
              >
                모든 옷장 외형 해금
              </button>

              <button onClick={() => {
                  if (confirm('외형 데이터를 기본 진화형으로 초기화하시겠습니까?')) {
                    onResetSkins?.();
                  }
                }}
                className="w-full bg-stone-800 hover:bg-stone-700 text-red-400 py-2.5 rounded-xl font-bold text-sm transition-colors border border-red-500/30"
              >
                옷장 외형 초기화
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}