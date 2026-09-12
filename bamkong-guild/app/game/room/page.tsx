// app/game/room/page.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Box, ChevronUp, ChevronDown, Package, Lock, Store } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useBamkongGrowth } from '../hooks/useBamkongGrowth';
import { INVENTORY_ITEMS, InventoryItem } from './constants/inventory';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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

export default function BamkongRoomPage() {
  const router = useRouter();
  const [placedItems, setPlacedItems] = useState<RoomItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isNight, setIsNight] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]); // 보유한 가구 목록 상태
  const [rewardItem, setRewardItem] = useState<InventoryItem | null>(null);
  const [claimedLevelRewards, setClaimedLevelRewards] = useState<number[]>([]); // 이미 수령한 레벨 기록
  const [pendingRewardLevel, setPendingRewardLevel] = useState<number | null>(null); // 현재 모달로 까고 있는 상자의 레벨
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

  const ADMIN_DISCORD_ID = process.env.NEXT_PUBLIC_ADMIN_DISCORD_ID;
  const isAdmin = user?.id === ADMIN_DISCORD_ID;
  
  // 하단 인벤토리 슬라이드 상태 추가
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const roomRef = useRef<HTMLElement>(null);

  const syncAdminActionToDB = async (newOwned: string[], newPlaced: any[]) => {
    if (!user?.id) return;
    try {
      const roomDocRef = doc(db, 'bamkong_rooms', user.id);
      await setDoc(roomDocRef, { 
        ownedItems: newOwned,
        placedItems: newPlaced 
      }, { merge: true });
    } catch (error) {
      console.error('관리자 권한 DB 동기화 실패:', error);
    }
  };

  useEffect(() => {
    const loadRoomData = async () => {
      if (!user?.id) return;
      try {
        const roomDocRef = doc(db, 'bamkong_rooms', user.id);
        const roomSnap = await getDoc(roomDocRef);
        
        if (roomSnap.exists()) {
          const data = roomSnap.data();
          setOwnedItems(data.ownedItems || []); // DB에서 보유 가구 불러오기
          setClaimedLevelRewards(data.claimedLevelRewards || []); // DB에서 레벨 보상 수령 기록 가져오기
          
          if (data.placedItems) {
            const formattedItems = data.placedItems.map((item: string | RoomItem) => {
              if (typeof item === 'string') {
                const defaultData = INVENTORY_ITEMS.find(i => i.id === item);
                return { id: item, xPos: defaultData?.xPos || 50, yPos: defaultData?.yPos || 50 };
              }
              return item;
            });
            setPlacedItems(formattedItems);
          } else {
            setPlacedItems([]); // 가구 없는 상태로 시작
          }

          // 보유한 가구가 아예 없다면(첫 접속) 랜덤 상자 지급
          if (!data.ownedItems || data.ownedItems.length === 0) {
            triggerFirstRandomBox(); 
          }
          if (data.unlockedSkins) setUnlockedSkins(data.unlockedSkins);
          if (data.equippedSkin) setCurrentSkin(data.equippedSkin);
        } else {
          setPlacedItems([]);
          triggerFirstRandomBox(); 
        }
      } catch (error) {
        console.error('방 데이터 불러오기 실패:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadRoomData();
  }, [user?.id]);

  // 첫 방문 랜덤 가구 상자 지급 함수
  const triggerFirstRandomBox = () => {
    const randomItem = INVENTORY_ITEMS[Math.floor(Math.random() * INVENTORY_ITEMS.length)];
    setRewardItem(randomItem); 
  };

  // 현재 레벨을 기준으로 받을 수 있는 10단위 보상 레벨 도출 (예: 25렙이면 [10, 20])
  const pendingMilestones = useMemo(() => {
    const milestones = [];
    
    for (let i = 110; i <= Math.min(level, 200); i += 10) {
      if (!claimedLevelRewards.includes(i)) {
        milestones.push(i);
      }
    }
    return milestones;
  }, [level, claimedLevelRewards]);

  // 10레벨 달성 보상 상자 열기 (중복 없음)
  const handleOpenLevelReward = () => {
    if (pendingMilestones.length === 0) return;
    const targetLevel = pendingMilestones[0];

    // 핵심 로직: 전체 가구 중 내가 보유하지 않은(중복 아닌) 가구만 필터링
    const unownedItems = INVENTORY_ITEMS.filter(item => !ownedItems.includes(item.id));

    if (unownedItems.length === 0) {
      toast('모든 가구와 아이템을 다 모으셨습니다! 🎉');
      return;
    }

    // 안 가진 가구 중에서만 랜덤 픽
    const randomItem = unownedItems[Math.floor(Math.random() * unownedItems.length)];
    
    setPendingRewardLevel(targetLevel);
    setRewardItem(randomItem); 
  };

  // 상자 애니메이션 시청 후 '방 꾸미기 시작' 눌렀을 때 DB 최종 저장
  const handleClaimReward = async () => {
    if (!user?.id || !rewardItem) return;
    
    const roomDocRef = doc(db, 'bamkong_rooms', user.id);
    
    // 새 가구 추가 (중복을 방지하기 위해 Set 활용 후 배열 변환)
    const newOwnedItems = Array.from(new Set([...ownedItems, rewardItem.id]));
    
    // 레벨 보상이었다면 수령 기록 추가
    let newClaimed = claimedLevelRewards;
    if (pendingRewardLevel !== null) {
      newClaimed = [...claimedLevelRewards, pendingRewardLevel];
    }
    
    setOwnedItems(newOwnedItems);
    setClaimedLevelRewards(newClaimed);
    
    // DB 최종 병합 저장
    await setDoc(roomDocRef, { 
      placedItems, // 현재 배치 상태 유지
      ownedItems: newOwnedItems,
      claimedLevelRewards: newClaimed
    }, { merge: true });

    setRewardItem(null); 
    setPendingRewardLevel(null);
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

  // 옷 갈아입기 및 Firebase DB 자동 저장 함수
  const handleEquipSkin = async (skinId: number) => {
    setCurrentSkin(skinId); 
    
    // 파티클 이펙트 On -> 1.5초 후 Off
    setShowEquipEffect(true);
    setTimeout(() => setShowEquipEffect(false), 1500);
    
    if (user?.id) {
      try {
        const roomDocRef = doc(db, 'bamkong_rooms', user.id);
        await setDoc(roomDocRef, { equippedSkin: skinId }, { merge: true });
      } catch (error) {
        console.error('스킨 장착 저장 실패:', error);
      }
    }
  };

  const handleAdminUnlockAllSkins = async () => {
    if (!user?.id) return;
    const allSkins = Array.from({ length: 10 }, (_, i) => i + 1);
    
    setUnlockedSkins(allSkins);
    await setDoc(doc(db, 'bamkong_rooms', user.id), { unlockedSkins: allSkins }, { merge: true });
    toast.success('모든 외형(1~10번)이 성공적으로 해금되었습니다! ✨');
  };

  // 관리자용: 외형 강제 초기화 함수 (기본 진화형 1개로 롤백)
  const handleAdminResetSkins = async () => {
    if (!user?.id || !evolutionId) return;
    
    setUnlockedSkins([evolutionId]);
    setCurrentSkin(evolutionId);
    await setDoc(doc(db, 'bamkong_rooms', user.id), { 
      unlockedSkins: [evolutionId], 
      equippedSkin: evolutionId 
    }, { merge: true });
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
      const roomDocRef = doc(db, 'bamkong_rooms', user.id);
      await setDoc(roomDocRef, { placedItems }, { merge: true });
      
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
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black py-3 sm:py-3.5 rounded-2xl shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all duration-200"
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
        />
      )}
      {pendingMilestones.length > 0 && (
        <button
          onClick={handleOpenLevelReward}
          className="absolute top-24 right-6 z-[60] flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce font-black border-2 border-white/20 transition-transform hover:scale-105"
        >
          <Package className="w-5 h-5" />
          Lv.{pendingMilestones[0]} 달성 보상 열기!
        </button>
      )}

      {/* 메인 방 렌더링 영역 */}
      <main ref={roomRef} className="flex-1 w-full h-full relative z-10">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img src="/images/room/isometric-room-bg.jpg" alt="Room Background" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />
          <div className={`absolute inset-0 bg-indigo-950/50 mix-blend-multiply pointer-events-none transition-opacity duration-1000 z-0 ${isNight ? 'opacity-100' : 'opacity-0'}`}></div>
          {level >= 110 ? (
            <Link href="/minigames/acorn-dodge" className="absolute top-[85%] left-[70%] z-20 group cursor-pointer hover:scale-105 transition-transform">
              <img src="/images/room/portal.png" alt="포탈" className="w-24 md:w-32 drop-shadow-[0_0_20px_rgba(167,139,250,0.6)] animate-[pulse_3s_infinite]" />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-white font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-opacity border border-white/20 pointer-events-none flex flex-col items-center gap-1 shadow-lg">
                <span className="text-sm">미니게임 포탈</span>
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
              
              <div className="absolute inset-0 z-110 pointer-events-none [&>*]:pointer-events-auto">
                <RoamingCharacter 
                  level={level} 
                  isEvolved={isEvolved} 
                  evolutionId={currentSkin || evolutionId}
                  userName={user?.guildNickname || user?.name || '밤콩이'}
                />
              </div>
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