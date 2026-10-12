// app/game/room/page.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Box, ChevronUp, ChevronDown, Package, Lock, Store } from 'lucide-react';
import { useBamkongGrowth } from '../hooks/useBamkongGrowth';
import { INVENTORY_ITEMS, InventoryItem } from './constants/inventory';
import { motion, AnimatePresence } from 'framer-motion';
import { getIsAdmin } from '../actions';
import { toast } from 'sonner';
import {
  adminResetSkins,
  adminSetRoomItems,
  adminUnlockAllSkins,
  giveGameUserPoints,
} from '@/app/admin/game/actions';
import { claimLevelReward, equipSkin, loadRoom, saveRoomLayout } from './roomActions';
import Link from 'next/link';
import IsometricItem from './components/IsometricItem';
import RoamingCharacter from './components/RoamingCharacter';
import ShareRoomModal from './components/ShareRoomModal';
import RandomBoxEffect from './components/RandomBoxEffect';
import AdminRoomPanel from './components/AdminRoomPanel';
import WardrobeModal from './components/WardrobeModal';
interface RoomItem {
  id: string;
  xPos: number;
  yPos: number;
}

const findItem = (itemId: string): InventoryItem | null =>
    INVENTORY_ITEMS.find((item) => item.id === itemId) ?? null;

export default function BamkongRoomPage() {
  const router = useRouter();
  const [placedItems, setPlacedItems] = useState<RoomItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isNight, setIsNight] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]); // 보유한 가구 목록 상태
  const [rewardItem, setRewardItem] = useState<InventoryItem | null>(null);
  const [claimedLevelRewards, setClaimedLevelRewards] = useState<number[]>([]); // 이미 수령한 레벨 기록
  const { user, level, isEvolved, evolutionId } = useBamkongGrowth();

  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [unlockedSkins, setUnlockedSkins] = useState<number[]>([]); 
  const [currentSkin, setCurrentSkin] = useState<number | null>(null);
  const [showEquipEffect, setShowEquipEffect] = useState(false);

  useEffect(() => {
    if (isEvolved && evolutionId) {
      // 해금 목록에 없으면 내 기본 진화형을 추가
      setUnlockedSkins((prev) => 
        prev.includes(evolutionId) ? prev : [...prev, evolutionId]
      );
      // 착용 중인 스킨이 없다면 내 기본 진화형으로 자동 장착
      setCurrentSkin((prev) => prev === null ? evolutionId : prev);
    }
  }, [isEvolved, evolutionId]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    getIsAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
  }, []);
  
  // 하단 인벤토리 슬라이드 상태 추가
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const roomRef = useRef<HTMLElement>(null);

  // 관리자 패널: 보유/배치 강제 설정 (서버에서 관리자 검증)
  const syncAdminActionToDB = async (newOwned: string[], newPlaced: RoomItem[]) => {
    if (!user?.id) return;
    const result = await adminSetRoomItems(user.id, newOwned, newPlaced);
    if (!result.ok) toast.error(result.message);
  };

  // 방 데이터 로드 (첫 방문이면 서버가 랜덤 가구를 지급하고 연출용 ID를 돌려줌)
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        const result = await loadRoom();
        if (cancelled) return;
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        const room = result.data;
        setOwnedItems(room.ownedItems);
        setClaimedLevelRewards(room.claimedLevelRewards);
        setPlacedItems(room.placedItems);
        if (room.unlockedSkins.length > 0) setUnlockedSkins(room.unlockedSkins);
        if (room.equippedSkin !== null) setCurrentSkin(room.equippedSkin);

        if (room.firstBoxItemId) {
          const item = findItem(room.firstBoxItemId);
          if (item) setRewardItem(item);
        }
      } catch (error) {
        console.error('방 데이터 불러오기 실패:', error);
        toast.error('방 데이터를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setIsInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // 받을 수 있는 레벨 보상 (버튼 표시용, 실제 판정은 서버)
  const pendingMilestones = useMemo(() => {
    const milestones: number[] = [];
    for (let i = 110; i <= Math.min(level, 200); i += 10) {
      if (!claimedLevelRewards.includes(i)) milestones.push(i);
    }
    return milestones;
  }, [level, claimedLevelRewards]);

  // 레벨 보상 상자: 서버가 미보유 가구 중 랜덤으로 지급 → 연출만 클라이언트
  const handleOpenLevelReward = async () => {
    if (pendingMilestones.length === 0 || isClaiming) return;
    setIsClaiming(true);
    try {
      const result = await claimLevelReward();
      if (!result.ok) {
        toast(result.message);
        return;
      }
      setOwnedItems(result.data.ownedItems);
      setClaimedLevelRewards(result.data.claimedLevelRewards);
      const item = findItem(result.data.itemId);
      if (item) setRewardItem(item);
    } catch (error) {
      console.error('레벨 보상 수령 실패:', error);
      toast.error('서버와 통신하지 못했습니다.');
    } finally {
      setIsClaiming(false);
    }
  };

  // 상자 연출 닫기 (저장은 이미 서버에서 완료됨)
  const handleClaimReward = () => {
    setRewardItem(null);
  };

  const toggleItemPlacement = (itemId: string) => {
    setPlacedItems(prev => {
      const exists = prev.find(item => item.id === itemId);
      if (exists) {
        return prev.filter(item => item.id !== itemId);
      } else {
        const defaultData = INVENTORY_ITEMS.find(item => item.id === itemId);
        return [...prev, { id: itemId, xPos: defaultData!.xPos, yPos: defaultData!.yPos }]; 
      }
    });
  };

  const handleItemInteract = (itemId: string) => {
    if (itemId === 'camera_01') {
      setIsShareModalOpen(true);
    } else if (itemId === 'bed_01' || itemId === 'window_01') {
      setIsNight((prev) => !prev);
    } else if (itemId === 'album_01') {
      router.push('/album'); 
    } else if (itemId === 'closet_01') {
      setIsWardrobeOpen(true);
    }
  };

    // 옷 갈아입기: 화면 먼저 바꾸고, 서버에서 거절되면 되돌림
  const handleEquipSkin = async (skinId: number) => {
    const prevSkin = currentSkin;
    setCurrentSkin(skinId);

    // 파티클 이펙트 On -> 1.5초 후 Off
    setShowEquipEffect(true);
    setTimeout(() => setShowEquipEffect(false), 1500);

    try {
      const result = await equipSkin(skinId);
      if (!result.ok) {
        setCurrentSkin(prevSkin);
        toast.error(result.message);
      }
    } catch (error) {
      console.error('스킨 장착 저장 실패:', error);
      setCurrentSkin(prevSkin);
      toast.error('서버와 통신하지 못했습니다.');
    }
  };

    const handleAdminUnlockAllSkins = async () => {
    if (!user?.id) return;
    const result = await adminUnlockAllSkins(user.id);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setUnlockedSkins(result.data);
    toast.success(`모든 외형(1~${result.data.length}번)이 성공적으로 해금되었습니다! ✨`);
  };

  // 관리자용: 외형 강제 초기화 (기본 진화형 1개로 롤백)
  const handleAdminResetSkins = async () => {
    if (!user?.id) return;
    const result = await adminResetSkins(user.id);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setUnlockedSkins([result.data]);
    setCurrentSkin(result.data);
    toast.info('외형이 기본 진화형으로 초기화되었습니다. 🔄');
  };

  const handlePositionChange = (id: string, newX: number, newY: number) => {
    setPlacedItems(prev => 
      prev.map(item => item.id === id ? { ...item, xPos: newX, yPos: newY } : item)
    );
  };

    const handleSaveRoom = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const result = await saveRoomLayout(placedItems);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setPlacedItems(result.data);
      toast.success('밤콩이의 방이 예쁘게 저장되었습니다! 🌰');
    } catch (error) {
      console.error('방 저장 실패:', error);
      toast.error('방 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-stone-900 flex items-center justify-center">
        <div className="text-amber-500 font-bold animate-pulse text-xl">밤콩이 방의 문을 여는 중... 🚪</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-stone-900 font-sans selection:bg-amber-200 overflow-hidden relative flex flex-col">
      {/* 상단 네비게이션 */}
      <header className="absolute top-0 w-full z-[60] p-4 sm:p-6 flex justify-between items-start pointer-events-none">
        <Link href="/game" className="pointer-events-auto group flex items-center gap-2 text-stone-200 hover:text-white font-bold bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-sm transition-all h-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>온실로 돌아가기</span>
        </Link>
        
        <div className="flex flex-col items-stretch gap-3 pointer-events-auto">
          <button 
            onClick={handleSaveRoom}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black px-6 py-2.5 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '저장 중...' : '배치 저장'}
          </button>

          <Link 
            href="/game/room/shop"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black py-3 sm:py-3 rounded-2xl shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all duration-200"
          >
            <Store className="w-5 h-5 sm:w-5 sm:h-5" />
            <span>포인트 상점</span>
          </Link>
        </div>
      </header>

      {isAdmin && (
        <AdminRoomPanel 
          ownedItems={ownedItems}
          setOwnedItems={setOwnedItems}
          placedItems={placedItems}
          setPlacedItems={setPlacedItems}
          onSave={syncAdminActionToDB}
          onUnlockAllSkins={handleAdminUnlockAllSkins}
          onResetSkins={handleAdminResetSkins}
          onGivePoints={async () => {
            if (!user) return;
            const result = await giveGameUserPoints(user.id, 10000);
            alert(result.ok ? '10,000 포인트가 지급되었습니다! 새로고침 후 상점을 확인해 보세요.' : result.message);
          }}
        />
      )}
      {pendingMilestones.length > 0 && (
        <button
          onClick={handleOpenLevelReward}
          disabled={isClaiming}
          className="absolute top-24 right-6 z-[60] flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-white px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce font-black border-2 border-white/20 transition-transform hover:scale-105"
        >
          <Package className="w-5 h-5" />
          {isClaiming ? '상자 여는 중...' : `Lv.${pendingMilestones[0]} 달성 보상 열기!`}
        </button>
      )}

      {/* 메인 방 렌더링 영역 */}
      <main ref={roomRef} className="flex-1 w-full h-full relative z-10">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img src="/images/room/isometric-room-bg.jpg" alt="Room Background" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />
          <div className={`absolute inset-0 bg-indigo-950/50 mix-blend-multiply pointer-events-none transition-opacity duration-1000 z-0 ${isNight ? 'opacity-100' : 'opacity-0'}`}></div>
          {level >= 110 ? (
            <Link href="/game/room/minigames" className="absolute top-[85%] left-[70%] z-20 group cursor-pointer hover:scale-105 transition-transform">
              <img src="/images/room/portal.png" alt="포탈" className="w-24 md:w-32 drop-shadow-[0_0_20px_rgba(167,139,250,0.6)] animate-[pulse_3s_infinite]" />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-white font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-opacity border border-white/20 pointer-events-none flex flex-col items-center gap-1 shadow-lg">
                <span className="text-sm">밤콩 미니게임 포탈</span>
                <span className="text-xs text-amber-300 font-black">💰 포인트 획득처</span>
              </div>
            </Link>
          ) : (
            <div className="absolute top-[85%] left-[70%] z-20 group cursor-not-allowed">
              <div className="relative flex items-center justify-center">
                <img src="/images/room/portal.png" alt="포탈(잠금)" className="w-24 md:w-32 opacity-40 grayscale blur-[2px]" />
                <div className="absolute">
                  <Lock className="w-8 h-8 text-stone-300 opacity-80"/>
                </div>
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-red-950/90 text-red-200 font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-opacity border border-red-500/30 pointer-events-none flex flex-col items-center gap-1 shadow-lg">
                <span className="text-sm">🔒 Lv.110 달성 시 해금</span>
                <span className="text-xs text-red-400/80">포인트 획득처</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] h-full">
              {placedItems.map((placedItem) => {
                const defaultItem = INVENTORY_ITEMS.find(item => item.id === placedItem.id);
                if (!defaultItem) return null;
                
                return (
                  <IsometricItem 
                    key={placedItem.id}
                    id={placedItem.id}
                    name={defaultItem.name}
                    src={defaultItem.src}
                    xPos={placedItem.xPos} 
                    yPos={placedItem.yPos}
                    baseZIndex={defaultItem.baseZIndex}
                    sizeClass={defaultItem.sizeClass}
                    isLightSource={defaultItem.isLightSource}
                    isNight={isNight}
                    onPositionChange={handlePositionChange}
                    onInteract={handleItemInteract}
                  />
                )
              })}
              
              <RoamingCharacter 
                level={level} 
                isEvolved={isEvolved} 
                evolutionId={currentSkin || evolutionId}
                userName={user?.guildNickname || user?.name || '밤콩이'}
              />
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showEquipEffect && (
          <div className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center">
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              // 흩어지는 거리와 속도를 랜덤화하여 풍성하게 연출
              const velocity = 150 + Math.random() * 200; 
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: Math.random() * 1.5 + 0.5,
                    x: Math.cos((angle * Math.PI) / 180) * velocity,
                    y: Math.sin((angle * Math.PI) / 180) * velocity,
                  }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  // 둥글고 반짝이는 황금빛 구슬 형태
                  className="absolute w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_#fbbf24]"
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <WardrobeModal 
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        unlockedSkins={unlockedSkins}
        currentSkin={currentSkin || 1}
        onSelectSkin={handleEquipSkin} // 변경된 저장 핸들러 연결
      />

      {/* 공유 모달 */}
      {isShareModalOpen && (
        <ShareRoomModal 
          roomRef={roomRef} 
          onClose={() => setIsShareModalOpen(false)} 
          userName={user?.guildNickname || user?.name || '밤콩이'} 
        />
      )}

      {/* 하단 인벤토리 슬라이드 UI */}
      <footer className={`fixed bottom-0 left-0 w-full z-[60] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isInventoryOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 슬라이드 토글 버튼 */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <button 
            onClick={() => setIsInventoryOpen(!isInventoryOpen)}
            className="flex items-center gap-2 bg-stone-900/95 hover:bg-stone-800 text-stone-200 px-8 py-3 rounded-t-2xl backdrop-blur-md border border-white/10 border-b-0 shadow-[0_-10px_20px_rgba(0,0,0,0.2)] transition-colors"
          >
            <Box className="w-5 h-5 text-amber-500" />
            <span className="font-bold">보관함 열기</span>
            {isInventoryOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>

        {/* 인벤토리 컨텐츠 영역 */}
        <div className="w-full bg-stone-900/95 backdrop-blur-2xl border-t border-white/10 p-6 pt-8 pb-10 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              {INVENTORY_ITEMS.filter(item => ownedItems.includes(item.id)).map((item) => {
                const isPlaced = placedItems.some(p => p.id === item.id); 
                
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItemPlacement(item.id)}
                    className={`group relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 transition-all overflow-hidden flex flex-col items-center justify-center gap-2 ${
                      isPlaced 
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    {isPlaced && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        배치됨
                      </div>
                    )}
                    <img src={item.src} alt={item.name} className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                    <span className={`text-xs font-bold text-center break-keep px-2 ${isPlaced ? 'text-amber-300' : 'text-stone-300'}`}>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
      {rewardItem && (
        <RandomBoxEffect 
          item={rewardItem} 
          onClose={handleClaimReward} 
        />
      )}
    </div>
  );
}