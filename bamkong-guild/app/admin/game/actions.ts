// app/admin/game/actions.ts
'use server';

import { getAdminDb } from '@/app/lib/firebaseAdmin';
import {
  assertDocId,
  runAdminAction,
  ValidationError,
  type ActionResult,
} from '@/app/lib/adminAction';
import {
  EVOLUTION_LEVEL,
  MAX_AP,
  MAX_LEVEL,
  MIN_LEVEL,
  type BamkongUser,
  type GameUserPatch,
} from './types';

const GROWTH = 'bamkong_growth';
const ROOMS = 'bamkong_rooms';
const LIST_FIELDS = ['name', 'guildNickname', 'globalName', 'level', 'exp', 'ap'] as const;

function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return runAdminAction(fn, 'admin/game');
}

function refs(userId: string) {
  const id = assertDocId(userId, '유저 ID');
  const db = getAdminDb();
  return { db, growth: db.collection(GROWTH).doc(id), room: db.collection(ROOMS).doc(id) };
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** update()는 문서가 없으면 NOT_FOUND(5)를 던짐. 없는 유저 문서가 새로 생기는 것을 막음 */
async function commitExisting(op: () => Promise<unknown>): Promise<void> {
  try {
    await op();
  } catch (error) {
    if ((error as { code?: unknown }).code === 5) {
      throw new ValidationError('해당 유저의 게임 데이터가 없습니다.');
    }
    throw error;
  }
}

// ───────────── 액션 ─────────────

export async function listGameUsers(): Promise<ActionResult<BamkongUser[]>> {
  return run(async () => {
    // select: 필요한 필드만 전송 (읽기 횟수는 문서 수 그대로, 전송량·직렬화 문제만 줄어듦)
    const snap = await getAdminDb().collection(GROWTH).select(...LIST_FIELDS).get();
    return snap.docs.map((d) => ({
      id: d.id,
      name: toOptionalString(d.get('name')),
      guildNickname: toOptionalString(d.get('guildNickname')),
      globalName: toOptionalString(d.get('globalName')) ?? '',
      level: toNumber(d.get('level'), MIN_LEVEL),
      exp: toNumber(d.get('exp'), 0),
      ap: toNumber(d.get('ap'), 0),
    }));
  });
}

export async function fillGameUserAp(userId: string): Promise<ActionResult<GameUserPatch>> {
  return run(async () => {
    const { growth } = refs(userId);
    await commitExisting(() => growth.update({ ap: MAX_AP }));
    return { ap: MAX_AP };
  });
}

export async function setGameUserLevel(
  userId: string,
  level: number,
): Promise<ActionResult<GameUserPatch>> {
  return run(async () => {
    if (!Number.isInteger(level) || level < MIN_LEVEL || level > MAX_LEVEL) {
      throw new ValidationError(`레벨은 ${MIN_LEVEL}~${MAX_LEVEL} 사이로 입력해 주세요.`);
    }

    const { growth } = refs(userId);
    // 진화 기준 레벨 미만이면 진화 상태도 함께 초기화
    const update: { level: number; isEvolved?: false; evolutionId?: null } =
      level < EVOLUTION_LEVEL ? { level, isEvolved: false, evolutionId: null } : { level };

    await commitExisting(() => growth.update(update));
    return { level };
  });
}

export async function resetGameUserMinigames(userId: string): Promise<ActionResult<GameUserPatch>> {
  return run(async () => {
    const { growth } = refs(userId);
    await commitExisting(() => growth.update({ playedGamesTime: {} }));
    return {};
  });
}

/** 성장 데이터 초기화 + 방 삭제를 batch로 묶음 (둘 다 성공하거나 둘 다 실패) */
export async function hardResetGameUser(userId: string): Promise<ActionResult<GameUserPatch>> {
  return run(async () => {
    const { db, growth, room } = refs(userId);
    const batch = db.batch();

    batch.update(growth, {
      level: MIN_LEVEL,
      exp: 0,
      ap: MAX_AP,
      gamePoints: 0,
      inventory: [],
      playedGamesTime: {},
      acornPlayHistory: {},
      isEvolved: false,
      evolutionId: null,
    });
    batch.delete(room); // 다음 입장 시 첫 방문 튜토리얼 발생

    await commitExisting(() => batch.commit());
    return { level: MIN_LEVEL, exp: 0, ap: MAX_AP };
  });
}

export async function deleteGameUser(userId: string): Promise<ActionResult<string>> {
  return run(async () => {
    const { db, growth, room } = refs(userId);
    const batch = db.batch();
    batch.delete(growth);
    batch.delete(room);
    await batch.commit();
    return userId;
  });
}