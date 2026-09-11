// app/game/hooks/useBamkongGrowth.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { getGameSession } from '../actions';

interface UserData {
  id: string;
  name: string;
  image: string;
  guildNickname?: string;
  isBamkongMember?: boolean;
}

export function useBamkongGrowth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [ap, setAp] = useState(3);
  
  // 🟢 신규 상태: 게임 포인트와 인벤토리(가구 박스 등)
  const [gamePoints, setGamePoints] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNextAp, setTimeUntilNextAp] = useState<number>(0); 
  const [playedGames, setPlayedGames] = useState({ roulette: false, dice: false, card: false, acorn: false });
  const [isEvolved, setIsEvolved] = useState(false);
  const [evolutionId, setEvolutionId] = useState<number | null>(null);
  
  // 🟢 100레벨 이상일 경우 필요 경험치 2배 (100 -> 200)
  const maxExp = level >= 100 ? 200 : 100; 
  const MAX_LEVEL = 200;
  const MAX_AP = 15;
  const RECHARGE_MS = 10 * 60 * 1000;

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActionRef = useRef<Date>(new Date());

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const user = await getGameSession() as UserData | null;
        
        if (!user) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        setUser(user);
        const userRef = doc(db, 'bamkong_growth', user.id!);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setLevel(data.level || 1);
          setExp(data.exp || 0);
          setIsEvolved(data.isEvolved || false);
          setEvolutionId(data.evolutionId || null);
          
          // 게임 포인트 및 인벤토리 로드
          setGamePoints(data.gamePoints || 0);
          setInventory(data.inventory || []);

          const sessionNickname = user.guildNickname;
          const dbNickname = data.guildNickname;
          const hasValidNickname = sessionNickname !== null && sessionNickname !== undefined;
          const isNicknameChanged = hasValidNickname && dbNickname !== sessionNickname;
          const isNameChanged = data.name !== user.name;
          const isImageChanged = data.image !== user.image;

          if (isNicknameChanged || isNameChanged || isImageChanged) {
            const updateData: any = { name: user.name, image: user.image };
            if (hasValidNickname) updateData.guildNickname = sessionNickname;
            await setDoc(userRef, updateData, { merge: true });
          }

          let currentAP = data.ap ?? MAX_AP;
          let lastTime = data.lastActionTime ? data.lastActionTime.toDate() : new Date();
          
          if (currentAP < MAX_AP) {
            const now = new Date();
            const diffMs = now.getTime() - lastTime.getTime();
            const recharged = Math.floor(diffMs / RECHARGE_MS);
            if (recharged > 0) {
              currentAP = Math.min(MAX_AP, currentAP + recharged);
              const remainder = diffMs % RECHARGE_MS;
              lastTime = new Date(now.getTime() - remainder);
            }
          }

          if (data.playedGamesTime) {
            const now = new Date();
            const checkToday = (timestamp: any) => {
              if (!timestamp) return false;
              const t = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
              return (
                t.getFullYear() === now.getFullYear() &&
                t.getMonth() === now.getMonth() &&
                t.getDate() === now.getDate()
              );
            };

            setPlayedGames({
              roulette: checkToday(data.playedGamesTime.roulette),
              dice: checkToday(data.playedGamesTime.dice),
              card: checkToday(data.playedGamesTime.card),
              acorn: checkToday(data.playedGamesTime.acorn),
            });
          }
          
          setAp(currentAP);
          lastActionRef.current = lastTime;
        } else {
          await setDoc(userRef, { 
            level: 1, exp: 0, ap: MAX_AP, lastActionTime: new Date(),
            gamePoints: 0, inventory: [],
            name: user.name, image: user.image,
            guildNickname: user.guildNickname || null
          });
        }
      } catch (error) {
        console.error('게임 초기화 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

  useEffect(() => {
    if (ap >= MAX_AP || isLoading) {
      setTimeUntilNextAp(0);
      return;
    }
    const updateTimer = () => {
      const now = new Date().getTime();
      const diffMs = now - lastActionRef.current.getTime();
      if (diffMs >= RECHARGE_MS) {
        const recharged = Math.floor(diffMs / RECHARGE_MS);
        setAp((prev) => Math.min(MAX_AP, prev + recharged));
        const remainder = diffMs % RECHARGE_MS;
        lastActionRef.current = new Date(now - remainder);
        return;
      }
      setTimeUntilNextAp(Math.ceil((RECHARGE_MS - diffMs) / 1000));
    };
    updateTimer(); 
    const intervalId = setInterval(updateTimer, 1000); 
    return () => clearInterval(intervalId);
  }, [ap, isLoading]);

  const syncToDatabase = useCallback(async (newLevel: number, newExp: number, newAp: number, actionTime: Date) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { 
        level: newLevel, exp: newExp, ap: newAp, 
        lastActionTime: actionTime, name: user.name, image: user.image,
        guildNickname: user.guildNickname || null
      }, { merge: true });
    } catch (error) {
      console.error('DB 저장 실패:', error);
    }
  }, [user]);

  const gainExp = useCallback(async (amount: number, cost: number) => {
    if (!user) {
      alert('로그인이 필요합니다!');
      window.location.href = '/api/auth/discord';
      return false;
    }

    if (level >= MAX_LEVEL) return false;
    if (ap < cost) return false;

    const now = new Date();
    let nextAp = ap - cost;
    let nextExp = exp + amount;
    let nextLevel = level;
    let earnedBox = false;

    const currentMaxExp = level >= 100 ? 200 : 100;

    if (nextExp >= currentMaxExp) {
      nextLevel = Math.min(MAX_LEVEL, level + 1);
      nextExp = nextLevel === MAX_LEVEL ? 0 : nextExp - currentMaxExp;
      setLevel(nextLevel);
      
      if (nextLevel >= 110 && nextLevel % 10 === 0) {
        earnedBox = true;
        setInventory(prev => [...prev, 'random_box_01']);
      }
    }
    
    setExp(nextExp);
    setAp(nextAp);
    
    if (ap === MAX_AP) {
      lastActionRef.current = now;
    }

    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      const updatePayload: any = { 
        level: nextLevel, 
        exp: nextExp, 
        ap: nextAp, 
        lastActionTime: lastActionRef.current 
      };
      if (earnedBox) {
        updatePayload.inventory = arrayUnion('random_box_01');
      }
      await setDoc(userRef, updatePayload, { merge: true });
    } catch (error) {
      console.error('DB 즉시 저장 실패:', error);
    }

    return true;
  }, [level, exp, ap, user]);

  // 미니게임 보상을 게임
  const handleMinigamePlay = useCallback(async (
    gameId: 'roulette'|'dice'|'card'|'acorn', 
    rewardAmount: number,
    rewardType: 'ap' | 'point' = 'ap' // 기본값은 기존 게임들을 위해 'ap'로 설정
  ) => {
    if (!user) return;
    if (playedGames[gameId]) {
      alert('오늘 이미 해당 미니게임에 참여하셨습니다! 내일 다시 도전해 주세요.');
      return;
    }

    const now = new Date();
    setPlayedGames((prev) => ({ ...prev, [gameId]: true })); 

    let updatePayload: any = {
      [`playedGamesTime.${gameId}`]: now
    };

    // 타입에 따라 지급 재화 분기 처리
    if (rewardType === 'point') {
      const nextPoints = gamePoints + rewardAmount;
      setGamePoints(nextPoints);
      updatePayload.gamePoints = nextPoints;
    } else {
      const nextAp = Math.min(MAX_AP, ap + rewardAmount);
      setAp(nextAp);
      updatePayload.ap = nextAp;
    }

    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, updatePayload, { merge: true });
    } catch (error) {
      console.error('미니게임 결과 저장 실패:', error);
    }
  }, [user, gamePoints, ap, playedGames, MAX_AP]);

  // 상점 구매 로직
  const spendGamePoints = useCallback(async (cost: number, itemId?: string, isApPotion?: boolean) => {
    if (!user || gamePoints < cost) return false;

    const nextPoints = gamePoints - cost;
    setGamePoints(nextPoints);

    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      const updateData: any = { gamePoints: nextPoints };
      
      if (isApPotion) {
        const nextAp = Math.min(MAX_AP, ap + 5);
        setAp(nextAp);
        updateData.ap = nextAp;
      }
      
      await setDoc(userRef, updateData, { merge: true });
      return true;
    } catch (error) {
      console.error('아이템 구매 실패:', error);
      return false;
    }
  }, [user, gamePoints, ap]);

  const saveEvolution = useCallback(async (evolutionId: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { isEvolved: true, evolutionId: evolutionId }, { merge: true });
    } catch (error) {
      console.error('진화 캐릭터 저장 실패:', error);
    }
  }, [user]);

  // 테스트용: 게임 초기화
  const resetGame = useCallback(async () => {
    if (!user) return;
    setLevel(1);
    setExp(0);
    setAp(MAX_AP);
    setIsEvolved(false);
    setEvolutionId(null);
    setGamePoints(0);
    setInventory([]);
    
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { 
        level: 1, exp: 0, ap: MAX_AP, lastActionTime: new Date(),
        isEvolved: false, evolutionId: null, gamePoints: 0, inventory: []
      }, { merge: true });
      alert('🛠️ 테스트: 1레벨 및 상점 내역 초기화 완료!');
    } catch (error) {
      console.error('초기화 실패:', error);
    }
  }, [user]);

  // 테스트용: 행동력 충전
  const fillAp = useCallback(async () => {
    if (!user) return;
    setAp(MAX_AP);
    lastActionRef.current = new Date();
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { ap: MAX_AP, lastActionTime: new Date() }, { merge: true });
    } catch (error) {
      console.error('행동력 충전 실패:', error);
    }
  }, [user]);

  // 테스트용: 레벨 +10업
  const levelUpTen = useCallback(async () => {
    if (!user) return;
    const nextLevel = Math.min(MAX_LEVEL, level + 9);
    setLevel(nextLevel);
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { level: nextLevel }, { merge: true });
    } catch (error) {
      console.error('10업 실패:', error);
    }
  }, [level, user]);

  // 테스트용: 미니게임 횟수 초기화
  const resetMinigameStatus = useCallback(async () => {
    if (!user) return;
    setPlayedGames({ roulette: false, dice: false, card: false, acorn: false });
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { playedGamesTime: {} }, { merge: true });
      alert('🛠️ 테스트: 미니게임 플레이 횟수가 초기화되었습니다!');
    } catch (error) {
      console.error('횟수 초기화 실패:', error);
    }
  }, [user]);

  return { 
    user, level, exp, maxExp, ap, MAX_AP, isLoading, timeUntilNextAp, 
    gamePoints, inventory, spendGamePoints,
    gainExp, resetGame, fillAp, levelUpTen, 
    playedGames, handleMinigamePlay, resetMinigameStatus,
    saveEvolution, isEvolved, evolutionId
  };
}