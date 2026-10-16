// app/game/hooks/useBamkongGrowth.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { ActionResult } from '@/app/lib/adminAction';
import {
  buyShopItem,
  evolve,
  finishScoreGame as finishScoreGameAction,
  gainExp as gainExpAction,
  loadGrowth,
  playDailyMinigame,
  startScoreGame as startScoreGameAction,
} from '../growthActions';
import {
  AP_RECHARGE_MS,
  EVOLUTION_LEVEL,
  GROWTH_ACTIONS,
  MAX_AP,
  MAX_LEVEL,
  getMaxExp,
  type DailyMinigameId,
  type GrowthActionId,
  type GrowthProfile,
  type GrowthSnapshot,
  type GrowthUpdate,
  type MinigameOutcome,
  type ScoreGameId,
} from '../growthConfig';

/** 미니게임 결과: 연출이 끝난 뒤 applyResult()로 화면 상태 반영 */
export interface DailyPlayResult {
  outcome: MinigameOutcome;
  applyResult: () => void;
}

/** 액션 호출 공통: 실패/통신 오류 시 토스트 후 null */
async function callAction<T>(action: () => Promise<ActionResult<T>>): Promise<T | null> {
  try {
    const result = await action();
    if (!result.ok) {
      toast.error(result.message);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error('[game]', error);
    toast.error('서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    return null;
  }
}

export function useBamkongGrowth() {
  const [user, setUser] = useState<GrowthProfile | null>(null);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [ap, setAp] = useState(MAX_AP);
  const [gamePoints, setGamePoints] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNextAp, setTimeUntilNextAp] = useState(0);
  const [playedGames, setPlayedGames] = useState<Record<DailyMinigameId, boolean>>({
    roulette: false,
    dice: false,
    card: false,
  });
  const [isEvolved, setIsEvolved] = useState(false);
  const [evolutionId, setEvolutionId] = useState<number | null>(null);
  const [acornPlays, setAcornPlays] = useState(0);
  const [dashPlays, setDashPlays] = useState(0);

  const maxExp = getMaxExp(level);
  const lastActionRef = useRef<number>(Date.now());
  const pendingRef = useRef(false); // 연속 클릭 시 중복 요청 방지 (정합성은 서버 트랜잭션이 보장)

  const applySnapshot = useCallback((s: GrowthSnapshot) => {
    setLevel(s.level);
    setExp(s.exp);
    setAp(s.ap);
    setGamePoints(s.gamePoints);
    setInventory(s.inventory);
    setIsEvolved(s.isEvolved);
    setEvolutionId(s.evolutionId);
    setPlayedGames(s.playedGames);
    setAcornPlays(s.scorePlays.acorn);
    setDashPlays(s.scorePlays.dash);
    lastActionRef.current = s.apUpdatedAt;
  }, []);

  // 첫 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await callAction(() => loadGrowth());
      if (cancelled) return;
      if (data) {
        setUser(data.profile);
        applySnapshot(data.growth);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [applySnapshot]);

  // AP 회복 타이머 (표시용, 실제 회복은 서버가 액션마다 다시 계산)
  useEffect(() => {
    if (ap >= MAX_AP || isLoading) {
      setTimeUntilNextAp(0);
      return;
    }
    const tick = () => {
      const now = Date.now();
      const diff = now - lastActionRef.current;
      if (diff >= AP_RECHARGE_MS) {
        const recharged = Math.floor(diff / AP_RECHARGE_MS);
        lastActionRef.current += recharged * AP_RECHARGE_MS;
        setAp((prev) => Math.min(MAX_AP, prev + recharged));
        return;
      }
      setTimeUntilNextAp(Math.ceil((AP_RECHARGE_MS - diff) / 1000));
    };
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [ap, isLoading]);

  /** 서버 액션 실행 → 성공 시 최신 상태 반영 (apply=false면 반영은 호출한 쪽에서) */
  const runMutation = useCallback(
    async <T>(
      action: () => Promise<ActionResult<GrowthUpdate<T>>>,
      apply = true,
    ): Promise<GrowthUpdate<T> | null> => {
      if (pendingRef.current) return null;
      pendingRef.current = true;
      try {
        const data = await callAction(action);
        if (data && apply) applySnapshot(data.growth);
        return data;
      } finally {
        pendingRef.current = false;
      }
    },
    [applySnapshot],
  );

  // 화면은 즉시 반영하고, 서버 확정값은 진행 중인 요청이 모두 끝난 뒤 한 번에 맞춤
  const inFlightRef = useRef(0);
  const bestSnapshotRef = useRef<GrowthSnapshot | null>(null);
  const hadFailureRef = useRef(false);

  const settleGrowth = useCallback(async () => {
    const snapshot = bestSnapshotRef.current;
    const hadFailure = hadFailureRef.current;
    bestSnapshotRef.current = null;
    hadFailureRef.current = false;

    if (hadFailure) {
      // 실패가 섞이면 화면 값이 서버와 다를 수 있으므로 서버 기준으로 다시 맞춤
      const data = await callAction(() => loadGrowth());
      if (data) applySnapshot(data.growth);
      return;
    }
    if (snapshot) applySnapshot(snapshot);
  }, [applySnapshot]);

  const gainExp = useCallback(
    (actionId: GrowthActionId): boolean => {
      if (!user) {
        toast.error('로그인이 필요합니다!');
        window.location.href = '/api/auth/signin/discord';
        return false;
      }

      const { exp: amount, cost } = GROWTH_ACTIONS[actionId];
      if (level >= MAX_LEVEL || (level >= EVOLUTION_LEVEL && !isEvolved) || ap < cost) return false;

      // 1) 서버와 같은 규칙으로 즉시 계산해서 화면에 반영
      const maxExpNow = getMaxExp(level);
      let nextExp = exp + amount;
      let nextLevel = level;
      if (nextExp >= maxExpNow) {
        nextLevel = Math.min(MAX_LEVEL, level + 1);
        nextExp = nextLevel === MAX_LEVEL ? 0 : nextExp - maxExpNow;
      }
      if (ap >= MAX_AP) lastActionRef.current = Date.now();
      setAp(ap - cost);
      setExp(nextExp);
      setLevel(nextLevel);

      // 2) 서버 확정은 기다리지 않고 뒤에서 처리
      inFlightRef.current += 1;
      void (async () => {
        const data = await callAction(() => gainExpAction(actionId));
        if (data) {
          // 응답 순서가 뒤바뀌어도 가장 진행된 상태를 채택 (성장은 레벨·경험치가 줄지 않음)
          const progress = (s: GrowthSnapshot) => s.level * 1000 + s.exp;
          const best = bestSnapshotRef.current;
          if (!best || progress(data.growth) >= progress(best)) bestSnapshotRef.current = data.growth;
        } else {
          hadFailureRef.current = true;
        }

        inFlightRef.current -= 1;
        if (inFlightRef.current === 0) void settleGrowth();
      })();

      return true;
    },
    [user, level, exp, ap, isEvolved, settleGrowth],
  );

  const handleMinigamePlay = useCallback(
    async (gameId: DailyMinigameId): Promise<DailyPlayResult | null> => {
      if (!user) return null;
      if (playedGames[gameId]) {
        toast.error('오늘 이미 해당 미니게임에 참여하셨습니다! 내일 다시 도전해 주세요.');
        return null;
      }
      const data = await runMutation(() => playDailyMinigame(gameId), false);
      if (!data) return null;

      setPlayedGames((prev) => ({ ...prev, [gameId]: true })); // 버튼은 즉시 잠그고
      return { outcome: data.result, applyResult: () => applySnapshot(data.growth) }; // AP는 연출 후 반영
    },
    [user, playedGames, runMutation, applySnapshot],
  );

  const startScoreGame = useCallback(
    async (gameId: ScoreGameId): Promise<boolean> =>
      (await runMutation(() => startScoreGameAction(gameId))) !== null,
    [runMutation],
  );

  /** 반환: 실제 지급된 포인트 (서버 상한 적용 후), 실패 시 null */
  const finishScoreGame = useCallback(
    async (gameId: ScoreGameId, points: number): Promise<number | null> => {
      const data = await runMutation(() => finishScoreGameAction(gameId, points));
      return data ? data.result : null;
    },
    [runMutation],
  );

  const buyItem = useCallback(
    async (itemId: string): Promise<boolean> => (await runMutation(() => buyShopItem(itemId))) !== null,
    [runMutation],
  );

  const saveEvolution = useCallback(
    async (id: number): Promise<boolean> => (await runMutation(() => evolve(id))) !== null,
    [runMutation],
  );

  return {
    user, level, exp, maxExp, ap, MAX_AP, isLoading, timeUntilNextAp,
    gamePoints, inventory, buyItem,
    gainExp,
    playedGames, handleMinigamePlay,
    saveEvolution, isEvolved, evolutionId,
    acornPlays, dashPlays, startScoreGame, finishScoreGame,
  };
}