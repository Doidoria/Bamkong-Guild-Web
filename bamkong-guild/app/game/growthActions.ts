// app/game/growthActions.ts
'use server';

import { randomInt } from 'node:crypto';
import { getServerSession } from 'next-auth/next';
import { FieldValue, Timestamp, type DocumentData } from 'firebase-admin/firestore';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { runMemberAction } from '@/app/lib/memberAction';
import { ValidationError, type ActionResult } from '@/app/lib/adminAction';
import {
  AP_ITEMS,
  AP_RECHARGE_MS,
  CARD_REWARDS,
  DAILY_MINIGAMES,
  EVOLUTION_IDS,
  EVOLUTION_LEVEL,
  GROWTH_ACTIONS,
  LEVEL_BOX_ITEM,
  MAX_AP,
  MAX_LEVEL,
  ROULETTE_SECTIONS,
  SCORE_GAMES,
  SKIN_ITEMS,
  getDiceReward,
  getMaxExp,
  type DailyMinigameId,
  type GrowthActionId,
  type GrowthProfile,
  type GrowthSnapshot,
  type GrowthUpdate,
  type MinigameOutcome,
  type ScoreGameId,
} from './growthConfig';

const GROWTH = 'bamkong_growth';
const ROOMS = 'bamkong_rooms';
const LEADERBOARD_SIZE = 10;
const DISCORD_CDN = 'https://cdn.discordapp.com/';
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const SCORE_SESSION_TTL_MS = 30 * 60 * 1000;
const SCORE_GRACE_SEC = 2;
const HISTORY_FIELD: Record<ScoreGameId, string> = {
  acorn: 'acornPlayHistory',
  dash: 'dashPlayHistory',
};

// ───────────── 공통 유틸 ─────────────

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((v): v is string => typeof v === 'string' && v.trim() !== '');
}

function isKeyOf<T extends object>(obj: T, key: unknown): key is keyof T {
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
}

function toMillis(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}

/** 한국 시간 기준 YYYY-MM-DD (서버 시간대와 무관) */
function kstDate(ms: number): string {
  return new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 지금까지 클라이언트가 image를 마음대로 쓸 수 있었으므로, 디스코드 CDN 주소만 허용 */
function safeAvatar(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith(DISCORD_CDN) ? value : null;
}

// ───────────── 문서 ↔ 상태 변환 ─────────────

interface PlayHistory {
  date: string;
  count: number;
}

interface GrowthState {
  level: number;
  exp: number;
  ap: number;
  lastActionMs: number;
  gamePoints: number;
  inventory: string[];
  isEvolved: boolean;
  evolutionId: number | null;
  playedAt: Partial<Record<DailyMinigameId, number>>;
  scoreHistory: Record<ScoreGameId, PlayHistory>;
  activeScoreGame: { gameId: ScoreGameId; startedAt: number } | null;
}

function parseHistory(value: unknown): PlayHistory {
  if (typeof value === 'object' && value !== null) {
    const v = value as { date?: unknown; count?: unknown };
    if (typeof v.date === 'string') return { date: v.date, count: toNumber(v.count, 0) };
  }
  return { date: '', count: 0 };
}

function parseActive(value: unknown): GrowthState['activeScoreGame'] {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as { gameId?: unknown; startedAt?: unknown };
  const startedAt = toMillis(v.startedAt);
  return isKeyOf(SCORE_GAMES, v.gameId) && startedAt !== null ? { gameId: v.gameId, startedAt } : null;
}

function parseGrowth(data: DocumentData, now: number): GrowthState {
  const playedRaw: Record<string, unknown> =
    typeof data.playedGamesTime === 'object' && data.playedGamesTime !== null ? data.playedGamesTime : {};
  const playedAt: GrowthState['playedAt'] = {};
  for (const id of DAILY_MINIGAMES) {
    const ms = toMillis(playedRaw[id]);
    if (ms !== null) playedAt[id] = ms;
  }

  return {
    level: clamp(toNumber(data.level, 1), 1, MAX_LEVEL),
    exp: Math.max(0, toNumber(data.exp, 0)),
    ap: clamp(toNumber(data.ap, MAX_AP), 0, MAX_AP),
    lastActionMs: toMillis(data.lastActionTime) ?? now,
    gamePoints: Math.max(0, toNumber(data.gamePoints, 0)),
    inventory: Array.isArray(data.inventory)
      ? data.inventory.filter((v: unknown): v is string => typeof v === 'string')
      : [],
    isEvolved: data.isEvolved === true,
    evolutionId: typeof data.evolutionId === 'number' ? data.evolutionId : null,
    playedAt,
    scoreHistory: {
      acorn: parseHistory(data.acornPlayHistory),
      dash: parseHistory(data.dashPlayHistory),
    },
    activeScoreGame: parseActive(data.activeScoreGame),
  };
}

function todayCount(s: GrowthState, gameId: ScoreGameId, now: number): number {
  const history = s.scoreHistory[gameId];
  return history.date === kstDate(now) ? history.count : 0;
}

function playedToday(s: GrowthState, gameId: DailyMinigameId, now: number): boolean {
  const at = s.playedAt[gameId];
  return at !== undefined && kstDate(at) === kstDate(now);
}

function toSnapshot(s: GrowthState, now: number): GrowthSnapshot {
  return {
    level: s.level,
    exp: s.exp,
    ap: s.ap,
    apUpdatedAt: s.lastActionMs,
    gamePoints: s.gamePoints,
    inventory: [...s.inventory],
    isEvolved: s.isEvolved,
    evolutionId: s.evolutionId,
    playedGames: {
      roulette: playedToday(s, 'roulette', now),
      dice: playedToday(s, 'dice', now),
      card: playedToday(s, 'card', now),
    },
    scorePlays: {
      acorn: todayCount(s, 'acorn', now),
      dash: todayCount(s, 'dash', now),
    },
  };
}

// ───────────── AP 회복 (서버 시간 기준) ─────────────

/** 마지막 기준 시각부터 지난 시간만큼 AP 회복. 가득 차 있으면 기준 시각을 지금으로 */
function applyRecharge(s: GrowthState, now: number): void {
  if (s.ap >= MAX_AP) {
    s.ap = MAX_AP;
    s.lastActionMs = now;
    return;
  }
  const elapsed = Math.max(0, now - s.lastActionMs);
  const recharged = Math.floor(elapsed / AP_RECHARGE_MS);
  if (recharged <= 0) return;

  s.ap = Math.min(MAX_AP, s.ap + recharged);
  s.lastActionMs = s.ap >= MAX_AP ? now : s.lastActionMs + recharged * AP_RECHARGE_MS;
}

function updateAp(s: GrowthState, next: number, now: number): void {
  s.ap = clamp(next, 0, MAX_AP);
  if (s.ap >= MAX_AP) s.lastActionMs = now;
}

function apFields(s: GrowthState): DocumentData {
  return { ap: s.ap, lastActionTime: Timestamp.fromMillis(s.lastActionMs) };
}

// ───────────── 트랜잭션 공통 ─────────────

interface Mutation<T> {
  patch: DocumentData;
  room?: DocumentData;
  result: T;
}

/** 본인 문서를 읽고 → 계산 → 저장을 하나의 트랜잭션으로 (연속 클릭·동시 요청에도 값이 꼬이지 않음) */
async function mutateGrowth<T>(
  discordId: string,
  mutate: (s: GrowthState, now: number) => Mutation<T>,
): Promise<GrowthUpdate<T>> {
  const db = getAdminDb();
  const ref = db.collection(GROWTH).doc(discordId);
  const roomRef = db.collection(ROOMS).doc(discordId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ValidationError('게임 데이터가 없습니다. 새로고침 후 다시 시도해 주세요.');

    const now = Date.now();
    const state = parseGrowth(snap.data() ?? {}, now);
    const { patch, room, result } = mutate(state, now);

    tx.update(ref, patch);
    if (room) tx.set(roomRef, room, { merge: true });
    return { growth: toSnapshot(state, now), result };
  });
}

function rollMinigame(gameId: DailyMinigameId): MinigameOutcome {
  switch (gameId) {
    case 'roulette': {
      const sectionIndex = randomInt(ROULETTE_SECTIONS.length);
      return { gameId, reward: ROULETTE_SECTIONS[sectionIndex], sectionIndex };
    }
    case 'dice': {
      const dice: [number, number] = [randomInt(1, 7), randomInt(1, 7)];
      return { gameId, reward: getDiceReward(dice[0] + dice[1]), dice };
    }
    case 'card':
      return { gameId, reward: CARD_REWARDS[randomInt(CARD_REWARDS.length)] };
  }
}

// ───────────── 액션 ─────────────

export interface Ranker {
  id: string;
  level: number;
  exp: number;
  displayName: string;
  image: string | null;
}

export async function getLeaderboard(): Promise<ActionResult<Ranker[]>> {
  return runMemberAction(async () => {
    const snap = await getAdminDb()
      .collection(GROWTH)
      .orderBy('level', 'desc')
      .orderBy('exp', 'desc')
      .limit(LEADERBOARD_SIZE)
      .select('level', 'exp', 'name', 'guildNickname', 'globalName', 'image')
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      level: toNumber(d.get('level'), 1),
      exp: toNumber(d.get('exp'), 0),
      displayName:
        firstString(d.get('guildNickname'), d.get('globalName'), d.get('name')) ?? d.id.slice(0, 8),
      image: safeAvatar(d.get('image')),
    }));
  }, 'game/leaderboard');
}

/** 첫 입장: 문서가 없으면 생성, 프로필(이름·사진·별명) 변경분만 동기화 */
export async function loadGrowth(): Promise<ActionResult<{ profile: GrowthProfile; growth: GrowthSnapshot }>> {
  return runMemberAction(async (member) => {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { name?: string | null; image?: string | null } | undefined;
    const profile: GrowthProfile = {
      id: member.discordId,
      name: sessionUser?.name ?? '',
      image: sessionUser?.image ?? '',
      guildNickname: member.nickname ?? undefined,
    };

    const db = getAdminDb();
    const ref = db.collection(GROWTH).doc(member.discordId);

    const growth = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const now = Date.now();

      if (!snap.exists) {
        const initial: DocumentData = {
          level: 1,
          exp: 0,
          ap: MAX_AP,
          lastActionTime: Timestamp.fromMillis(now),
          gamePoints: 0,
          inventory: [],
          name: profile.name,
          image: profile.image,
          guildNickname: profile.guildNickname ?? null,
        };
        tx.set(ref, initial);
        return toSnapshot(parseGrowth(initial, now), now);
      }

      const data = snap.data() ?? {};
      const profilePatch: DocumentData = {};
      if (profile.name && data.name !== profile.name) profilePatch.name = profile.name;
      if (profile.image && data.image !== profile.image) profilePatch.image = profile.image;
      if (profile.guildNickname && data.guildNickname !== profile.guildNickname) {
        profilePatch.guildNickname = profile.guildNickname;
      }
      if (Object.keys(profilePatch).length > 0) tx.update(ref, profilePatch);

      return toSnapshot(parseGrowth(data, now), now);
    });

    return { profile, growth };
  }, 'game/load');
}

/** 물 주기 / 햇빛 / 영양제: 경험치·비용은 서버 상수 */
export async function gainExp(
  actionId: GrowthActionId,
): Promise<ActionResult<GrowthUpdate<{ earnedBox: boolean }>>> {
  return runMemberAction(async (member) => {
    if (!isKeyOf(GROWTH_ACTIONS, actionId)) throw new ValidationError('알 수 없는 행동입니다.');
    const { exp: amount, cost } = GROWTH_ACTIONS[actionId];

    return mutateGrowth(member.discordId, (s, now) => {
      applyRecharge(s, now);
      if (s.level >= MAX_LEVEL) throw new ValidationError('이미 최고 레벨입니다.');
      if (s.level >= EVOLUTION_LEVEL && !s.isEvolved) throw new ValidationError('먼저 최종 진화를 진행해 주세요.');
      if (s.ap < cost) throw new ValidationError('행동력이 부족합니다.');

      updateAp(s, s.ap - cost, now);

      const maxExp = getMaxExp(s.level);
      s.exp += amount;
      let earnedBox = false;
      if (s.exp >= maxExp) {
        s.level = Math.min(MAX_LEVEL, s.level + 1);
        s.exp = s.level === MAX_LEVEL ? 0 : s.exp - maxExp;
        earnedBox = s.level >= 110 && s.level % 10 === 0;
      }

      const patch: DocumentData = { level: s.level, exp: s.exp, ...apFields(s) };
      if (earnedBox) {
        patch.inventory = FieldValue.arrayUnion(LEVEL_BOX_ITEM);
        if (!s.inventory.includes(LEVEL_BOX_ITEM)) s.inventory.push(LEVEL_BOX_ITEM);
      }
      return { patch, result: { earnedBox } };
    });
  }, 'game/gainExp');
}

/** 룰렛·주사위·카드: 보상 추첨과 오늘(KST) 참여 여부를 서버가 판정 */
export async function playDailyMinigame(
  gameId: DailyMinigameId,
): Promise<ActionResult<GrowthUpdate<MinigameOutcome>>> {
  return runMemberAction(async (member) => {
    if (!(DAILY_MINIGAMES as readonly string[]).includes(gameId)) {
      throw new ValidationError('알 수 없는 미니게임입니다.');
    }

    return mutateGrowth(member.discordId, (s, now) => {
      if (playedToday(s, gameId, now)) {
        throw new ValidationError('오늘 이미 참여한 미니게임입니다. 내일 다시 도전해 주세요!');
      }

      const outcome = rollMinigame(gameId);
      applyRecharge(s, now);
      updateAp(s, s.ap + outcome.reward, now);
      s.playedAt[gameId] = now;

      return {
        // update()에서는 점 표기가 중첩 필드 경로로 해석됨 → 다른 게임 기록 유지
        patch: { [`playedGamesTime.${gameId}`]: Timestamp.fromMillis(now), ...apFields(s) },
        result: outcome,
      };
    });
  }, 'game/dailyMinigame');
}

/** 도토리·달려라 밤콩 시작: 시작 시각을 서버에 기록 (종료 시 점수 상한 계산용) */
export async function startScoreGame(gameId: ScoreGameId): Promise<ActionResult<GrowthUpdate<null>>> {
  return runMemberAction(async (member) => {
    if (!isKeyOf(SCORE_GAMES, gameId)) throw new ValidationError('알 수 없는 미니게임입니다.');
    const { dailyLimit } = SCORE_GAMES[gameId];

    return mutateGrowth(member.discordId, (s, now) => {
      if (todayCount(s, gameId, now) >= dailyLimit) {
        throw new ValidationError('오늘 도전 기회를 모두 사용했습니다. 내일 다시 도전해 주세요!');
      }
      s.activeScoreGame = { gameId, startedAt: now };
      return {
        patch: { activeScoreGame: { gameId, startedAt: Timestamp.fromMillis(now) } },
        result: null,
      };
    });
  }, 'game/startScoreGame');
}

/** 종료: 경과 시간 기준 상한으로 점수를 잘라서 지급, 오늘 횟수 +1 */
export async function finishScoreGame(
  gameId: ScoreGameId,
  points: number,
): Promise<ActionResult<GrowthUpdate<number>>> {
  return runMemberAction(async (member) => {
    if (!isKeyOf(SCORE_GAMES, gameId)) throw new ValidationError('알 수 없는 미니게임입니다.');
    if (typeof points !== 'number' || !Number.isFinite(points) || points < 0) {
      throw new ValidationError('점수가 올바르지 않습니다.');
    }
    const config = SCORE_GAMES[gameId];

    return mutateGrowth(member.discordId, (s, now) => {
      const active = s.activeScoreGame;
      if (!active || active.gameId !== gameId || now - active.startedAt > SCORE_SESSION_TTL_MS) {
        throw new ValidationError('게임 기록이 확인되지 않습니다. 다시 시작해 주세요.');
      }

      const count = todayCount(s, gameId, now);
      if (count >= config.dailyLimit) throw new ValidationError('오늘 도전 기회를 모두 사용했습니다.');

      const elapsedSec = (now - active.startedAt) / 1000;
      const cap = Math.min(config.maxPoints, Math.floor((elapsedSec + SCORE_GRACE_SEC) * config.maxPointsPerSec));
      const awarded = clamp(Math.floor(points), 0, cap);

      s.gamePoints += awarded;
      s.scoreHistory[gameId] = { date: kstDate(now), count: count + 1 };
      s.activeScoreGame = null;

      return {
        patch: {
          gamePoints: s.gamePoints,
          [HISTORY_FIELD[gameId]]: s.scoreHistory[gameId],
          activeScoreGame: FieldValue.delete(),
        },
        result: awarded,
      };
    });
  }, 'game/finishScoreGame');
}

/** 상점 구매: 가격·효과는 서버 상품 목록 기준 (클라이언트는 상품 ID만) */
export async function buyShopItem(itemId: string): Promise<ActionResult<GrowthUpdate<null>>> {
  return runMemberAction(async (member) => {
    const apItem = AP_ITEMS.find((item) => item.id === itemId);
    const skinItem = SKIN_ITEMS.find((item) => item.id === itemId);
    if (!apItem && !skinItem) throw new ValidationError('존재하지 않는 상품입니다.');

    return mutateGrowth(member.discordId, (s, now): Mutation<null> => {
      if (apItem) {
        applyRecharge(s, now);
        if (s.ap >= MAX_AP) throw new ValidationError('이미 행동력이 가득 차 있습니다!');
        if (s.gamePoints < apItem.cost) throw new ValidationError('게임 포인트가 부족합니다!');

        s.gamePoints -= apItem.cost;
        updateAp(s, s.ap + apItem.ap, now);
        return { patch: { gamePoints: s.gamePoints, ...apFields(s) }, result: null };
      }

      if (!skinItem) throw new ValidationError('존재하지 않는 상품입니다.');
      if (s.inventory.includes(skinItem.id)) throw new ValidationError('이미 보유한 외형입니다.');
      if (s.gamePoints < skinItem.cost) throw new ValidationError('게임 포인트가 부족합니다!');

      s.gamePoints -= skinItem.cost;
      s.inventory.push(skinItem.id);
      return {
        patch: { gamePoints: s.gamePoints, inventory: FieldValue.arrayUnion(skinItem.id) },
        room: { unlockedSkins: FieldValue.arrayUnion(skinItem.skinNumber) },
        result: null,
      };
    });
  }, 'game/buyShopItem');
}

/** 최종 진화: 100레벨 이상, 아직 진화 전일 때만 */
export async function evolve(evolutionId: number): Promise<ActionResult<GrowthUpdate<null>>> {
  return runMemberAction(async (member) => {
    if (!(EVOLUTION_IDS as readonly number[]).includes(evolutionId)) {
      throw new ValidationError('알 수 없는 진화 형태입니다.');
    }

    return mutateGrowth(member.discordId, (s) => {
      if (s.isEvolved) throw new ValidationError('이미 최종 진화를 완료했습니다.');
      if (s.level < EVOLUTION_LEVEL) throw new ValidationError(`레벨 ${EVOLUTION_LEVEL}부터 진화할 수 있습니다.`);

      const skinId = `final-${evolutionId}`;
      s.isEvolved = true;
      s.evolutionId = evolutionId;
      if (!s.inventory.includes(skinId)) s.inventory.push(skinId);

      return {
        patch: { isEvolved: true, evolutionId, inventory: FieldValue.arrayUnion(skinId) },
        room: { unlockedSkins: FieldValue.arrayUnion(evolutionId), equippedSkin: evolutionId },
        result: null,
      };
    });
  }, 'game/evolve');
}