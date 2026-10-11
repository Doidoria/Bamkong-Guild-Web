// app/game/growthConfig.ts
// 클라이언트·서버 공용 상수/타입. ⚠️ 서버 전용 모듈(firebase-admin 등)을 import하지 말 것

export const MAX_AP = 15;
export const MAX_LEVEL = 200;
export const EVOLUTION_LEVEL = 100;
export const AP_RECHARGE_MS = 10 * 60 * 1000;
export const LEVEL_BOX_ITEM = 'random_box_01';

/** 100레벨 이상은 필요 경험치 2배 */
export function getMaxExp(level: number): number {
  return level >= EVOLUTION_LEVEL ? 200 : 100;
}

// ───── 성장 행동 ─────
export const GROWTH_ACTIONS = {
  water: { exp: 10, cost: 1 },
  sun: { exp: 22, cost: 2 },
  fertilizer: { exp: 35, cost: 3 },
} as const;
export type GrowthActionId = keyof typeof GROWTH_ACTIONS;

// ───── 하루 1회 미니게임 ─────
export const DAILY_MINIGAMES = ['roulette', 'dice', 'card'] as const;
export type DailyMinigameId = (typeof DAILY_MINIGAMES)[number];
export const ROULETTE_SECTIONS = [0, 1, 0, 2, 0, 3] as const;
export const CARD_REWARDS = [0, 1, 2, 3] as const;

export function getDiceReward(sum: number): number {
  if (sum >= 11) return 3;
  if (sum >= 9) return 2;
  if (sum >= 6) return 1;
  return 0;
}

export type MinigameOutcome =
  | { gameId: 'roulette'; reward: number; sectionIndex: number }
  | { gameId: 'dice'; reward: number; dice: [number, number] }
  | { gameId: 'card'; reward: number };

// ───── 점수형 미니게임 ─────
/**
 * maxPointsPerSec: 서버가 "경과 시간 × 이 값"을 넘는 점수는 잘라냄.
 * 게임 루프가 requestAnimationFrame(화면 주사율) 기준이라 144Hz 모니터는 60Hz보다 빨리 쌓이므로 여유 있게 설정
 * (60Hz 기준 도토리 초당 3P, 달려라 밤콩 초당 0.6P)
 */
export const SCORE_GAMES = {
  acorn: { dailyLimit: 5, maxPoints: 200, maxPointsPerSec: 9 },
  dash: { dailyLimit: 5, maxPoints: 200, maxPointsPerSec: 2 },
} as const;
export type ScoreGameId = keyof typeof SCORE_GAMES;

// ───── 진화 ─────
export const EVOLUTION_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

// ───── 상점 (화면과 서버가 같은 목록 사용) ─────
export interface ApShopItem {
  id: string;
  name: string;
  ap: number;
  cost: number;
  color: string;
  shadow: string;
}

export interface SkinShopItem {
  id: string;
  skinNumber: number;
  name: string;
  cost: number;
  src: string;
}

export const AP_ITEMS: readonly ApShopItem[] = [
  { id: 'ap_1', name: '한 모금 드링크', ap: 1, cost: 100, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-900/50' },
  { id: 'ap_2', name: '작은 드링크', ap: 2, cost: 200, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-900/50' },
  { id: 'ap_3', name: '일반 드링크', ap: 3, cost: 300, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-900/50' },
  { id: 'ap_5', name: '큰 드링크', ap: 5, cost: 490, color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-900/50' },
  { id: 'ap_10', name: '메가 드링크', ap: 10, cost: 980, color: 'from-purple-600 to-fuchsia-600', shadow: 'shadow-purple-900/50' },
  { id: 'ap_15', name: '기적의 엘릭서', ap: 15, cost: 1450, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-900/50' },
];

export const SKIN_ITEMS: readonly SkinShopItem[] = EVOLUTION_IDS.map((n) => ({
  id: `final-${n}`,
  skinNumber: n,
  name: `스페셜 외형 ${n}`,
  cost: 5000,
  src: `/images/evolutions/final-${n}.png`,
}));

// ───── 액션 응답 타입 ─────
export interface GrowthProfile {
  id: string;
  name: string;
  image: string;
  guildNickname?: string;
}

export interface GrowthSnapshot {
  level: number;
  exp: number;
  ap: number;
  /** AP 회복 기준 시각(ms) */
  apUpdatedAt: number;
  gamePoints: number;
  inventory: string[];
  isEvolved: boolean;
  evolutionId: number | null;
  playedGames: Record<DailyMinigameId, boolean>;
  scorePlays: Record<ScoreGameId, number>;
}

export interface GrowthUpdate<T> {
  growth: GrowthSnapshot;
  result: T;
}