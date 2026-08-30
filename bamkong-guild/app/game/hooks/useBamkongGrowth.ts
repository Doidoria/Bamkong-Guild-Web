// app/game/hooks/useBamkongGrowth.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { getGameSession } from '../actions';

interface UserData {
  id: string;
  name: string;        // NextAuth 기본 닉네임
  image: string;       // NextAuth 기본 프로필 (전체 URL로 들어옴)
  guildNickname?: string;
  isBamkongMember?: boolean;
}

export function useBamkongGrowth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [ap, setAp] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  
  // 실시간 남은 충전 시간(초)을 저장하는 상태
  const [timeUntilNextAp, setTimeUntilNextAp] = useState<number>(0); 

  // 미니게임을 플레이했는지 확인하는 상태
  const [playedGames, setPlayedGames] = useState({ roulette: false, dice: false, card: false });
  
  const maxExp = 100; 
  const MAX_LEVEL = 100;
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

        // ✨ user.id 부분의 타입 에러를 방지하기 위해 단언(!)을 사용합니다.
        const userRef = doc(db, 'bamkong_growth', user.id!);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setLevel(data.level || 1);
          setExp(data.exp || 0);

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

          // 1일 1회 제한: 마지막 미니게임 플레이 날짜 체크
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
            });
          }
          
          setAp(currentAP);
          lastActionRef.current = lastTime;
        } else {
          await setDoc(userRef, { 
            level: 1, exp: 0, ap: MAX_AP, lastActionTime: new Date(),
            name: user.name, 
            image: user.image,
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

  // 1초마다 남은 시간을 계산하는 실시간 타이머 로직
  useEffect(() => {
    if (ap >= MAX_AP || isLoading) {
      setTimeUntilNextAp(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const diffMs = now - lastActionRef.current.getTime();
      
      // 혹시라도 그 사이에 1시간이 지났다면 프론트 단에서 조기 충전 처리
      if (diffMs >= RECHARGE_MS) {
        const recharged = Math.floor(diffMs / RECHARGE_MS);
        setAp((prev) => Math.min(MAX_AP, prev + recharged));
        const remainder = diffMs % RECHARGE_MS;
        lastActionRef.current = new Date(now - remainder);
        return;
      }
      
      // 남은 시간(초) 계산
      setTimeUntilNextAp(Math.ceil((RECHARGE_MS - diffMs) / 1000));
    };

    updateTimer(); // 즉시 1회 실행
    const intervalId = setInterval(updateTimer, 1000); // 1초마다 반복

    return () => clearInterval(intervalId);
  }, [ap, isLoading]);

  const syncToDatabase = useCallback(async (newLevel: number, newExp: number, newAp: number, actionTime: Date) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { 
        level: newLevel, 
        exp: newExp, 
        ap: newAp, 
        lastActionTime: actionTime,
        name: user.name, 
        image: user.image,
        guildNickname: user.guildNickname || null
      }, { merge: true });
    } catch (error) {
      console.error('DB 저장 실패:', error);
    }
  }, [user]);

  const gainExp = useCallback((amount: number, cost: number) => {
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

    if (nextExp >= maxExp) {
      nextLevel = Math.min(MAX_LEVEL, level + 1);
      nextExp = nextLevel === MAX_LEVEL ? 0 : nextExp - maxExp;
      setLevel(nextLevel);
    }
    
    setExp(nextExp);
    setAp(nextAp);
    
    if (ap === MAX_AP) {
      lastActionRef.current = now;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      syncToDatabase(nextLevel, nextExp, nextAp, lastActionRef.current);
    }, 1000);

    return true;
  }, [level, exp, ap, user, syncToDatabase]);

  // 기존 초기화, 충전 함수 유지
  const resetGame = useCallback(async () => {
    if (!user) return;
    setLevel(1);
    setExp(0);
    setAp(MAX_AP);
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { level: 1, exp: 0, ap: MAX_AP, lastActionTime: new Date() }, { merge: true });
      alert('🛠️ 테스트: 1레벨로 초기화되었습니다!');
    } catch (error) {
      console.error('초기화 실패:', error);
    }
  }, [user]);

  const fillAp = useCallback(async () => {
    if (!user) return;
    setAp(MAX_AP);
    lastActionRef.current = new Date(); // 충전 기준 시간 리셋
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { ap: MAX_AP, lastActionTime: new Date() }, { merge: true });
    } catch (error) {
      console.error('행동력 충전 실패:', error);
    }
  }, [user]);

  // [테스트용] 레벨 +10 (10업) 함수
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

  // 미니게임 처리 함수
  const handleMinigamePlay = useCallback(async (gameId: 'roulette'|'dice'|'card', reward: number) => {
    if (!user) return;
    if (playedGames[gameId]) {
      alert('오늘 이미 해당 미니게임에 참여하셨습니다! 내일 다시 도전해 주세요.');
      return;
    }

    const now = new Date();
    setPlayedGames((prev) => ({ ...prev, [gameId]: true })); 

    let nextAp = ap;
    if (reward > 0) {
      nextAp = Math.min(MAX_AP, ap + reward);
      setAp(nextAp);
    }

    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      await setDoc(userRef, { 
        ap: nextAp, 
        playedGamesTime: {
          [gameId]: now
        }
      }, { merge: true });
      
    } catch (error) {
      console.error('미니게임 결과 저장 실패:', error);
    }
  }, [user, ap, MAX_AP, playedGames]);

  // [테스트용] 미니게임 횟수 완전 초기화 함수
  const resetMinigameStatus = useCallback(async () => {
    if (!user) return;
    setPlayedGames({ roulette: false, dice: false, card: false });
    try {
      const userRef = doc(db, 'bamkong_growth', user.id);
      // DB의 기록 자체를 빈 객체로 덮어씌워 완전 초기화
      await setDoc(userRef, { playedGamesTime: {} }, { merge: true });
      alert('🛠️ 테스트: 미니게임 플레이 횟수가 초기화되었습니다!');
    } catch (error) {
      console.error('횟수 초기화 실패:', error);
    }
  }, [user]);

  return { 
    user, level, exp, maxExp, ap, MAX_AP, isLoading, timeUntilNextAp, 
    gainExp, resetGame, fillAp, levelUpTen, 
    playedGames, handleMinigamePlay, resetMinigameStatus
  };
}