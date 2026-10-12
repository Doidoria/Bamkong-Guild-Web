// app/game/room/roomActions.ts
'use server';

import { randomInt } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { runMemberAction } from '@/app/lib/memberAction';
import { ValidationError, type ActionResult } from '@/app/lib/adminAction';
import { MAX_LEVEL, MAX_SKIN_ID } from '../growthConfig';
import { INVENTORY_ITEMS } from './constants/inventory';
import {
  parsePlacedItems,
  sanitizePlacedItems,
  toNumberArray,
  toStringArray,
  type RoomItemPosition,
} from './roomValidation';

const GROWTH = 'bamkong_growth';
const ROOMS = 'bamkong_rooms';
const REWARD_START_LEVEL = 110;
const REWARD_STEP = 10;

export interface RoomData {
  ownedItems: string[];
  placedItems: RoomItemPosition[];
  claimedLevelRewards: number[];
  unlockedSkins: number[];
  equippedSkin: number | null;
  /** 첫 방문으로 이번에 지급된 가구 ID (상자 연출용) */
  firstBoxItemId: string | null;
}

export interface LevelRewardResult {
  itemId: string;
  level: number;
  ownedItems: string[];
  claimedLevelRewards: number[];
}

function refs(discordId: string) {
  const db = getAdminDb();
  return { db, room: db.collection(ROOMS).doc(discordId), growth: db.collection(GROWTH).doc(discordId) };
}

function pickRandom<T>(list: readonly T[]): T {
  return list[randomInt(list.length)];
}

function toLevel(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(MAX_LEVEL, value) : 1;
}

/** 방 입장: 데이터 로드 + 보유 가구가 없으면(첫 방문·초기화 후) 랜덤 가구 1개 지급 */
export async function loadRoom(): Promise<ActionResult<RoomData>> {
  return runMemberAction(async (member) => {
    const { db, room } = refs(member.discordId);

    return db.runTransaction(async (tx) => {
      const snap = await tx.get(room);
      const data = snap.data() ?? {};
      const result: RoomData = {
        ownedItems: toStringArray(data.ownedItems),
        placedItems: parsePlacedItems(data.placedItems),
        claimedLevelRewards: toNumberArray(data.claimedLevelRewards),
        unlockedSkins: toNumberArray(data.unlockedSkins),
        equippedSkin: typeof data.equippedSkin === 'number' ? data.equippedSkin : null,
        firstBoxItemId: null,
      };

      if (result.ownedItems.length === 0) {
        const item = pickRandom(INVENTORY_ITEMS);
        tx.set(room, { ownedItems: FieldValue.arrayUnion(item.id) }, { merge: true });
        result.ownedItems = [item.id];
        result.firstBoxItemId = item.id;
      }
      return result;
    });
  }, 'room/load');
}

/** 레벨 보상(110, 120, ... 200): 받을 수 있는 가장 낮은 레벨 1개, 미보유 가구 중 랜덤 */
export async function claimLevelReward(): Promise<ActionResult<LevelRewardResult>> {
  return runMemberAction(async (member) => {
    const { db, room, growth } = refs(member.discordId);

    return db.runTransaction(async (tx) => {
      const [roomSnap, growthSnap] = await tx.getAll(room, growth);
      const level = toLevel(growthSnap.get('level'));
      const owned = toStringArray(roomSnap.get('ownedItems'));
      const claimed = toNumberArray(roomSnap.get('claimedLevelRewards'));

      let target: number | null = null;
      for (let lv = REWARD_START_LEVEL; lv <= level; lv += REWARD_STEP) {
        if (!claimed.includes(lv)) {
          target = lv;
          break;
        }
      }
      if (target === null) throw new ValidationError('받을 수 있는 레벨 보상이 없습니다.');

      const unowned = INVENTORY_ITEMS.filter((item) => !owned.includes(item.id));
      if (unowned.length === 0) throw new ValidationError('모든 가구와 아이템을 다 모으셨습니다! 🎉');

      const item = pickRandom(unowned);
      tx.set(
        room,
        { ownedItems: FieldValue.arrayUnion(item.id), claimedLevelRewards: FieldValue.arrayUnion(target) },
        { merge: true },
      );

      return {
        itemId: item.id,
        level: target,
        ownedItems: [...owned, item.id],
        claimedLevelRewards: [...claimed, target],
      };
    });
  }, 'room/levelReward');
}

/** 배치 저장: 보유한 가구만, 좌표 검증 */
export async function saveRoomLayout(placedItems: RoomItemPosition[]): Promise<ActionResult<RoomItemPosition[]>> {
  return runMemberAction(async (member) => {
    const { db, room } = refs(member.discordId);

    return db.runTransaction(async (tx) => {
      const snap = await tx.get(room);
      const clean = sanitizePlacedItems(placedItems, toStringArray(snap.get('ownedItems')));
      tx.set(room, { placedItems: clean }, { merge: true });
      return clean;
    });
  }, 'room/saveLayout');
}

/** 외형 장착: 해금된 스킨 또는 내 진화형만 */
export async function equipSkin(skinId: number): Promise<ActionResult<number>> {
  return runMemberAction(async (member) => {
    if (!Number.isInteger(skinId) || skinId < 1 || skinId > MAX_SKIN_ID) {
      throw new ValidationError('알 수 없는 외형입니다.');
    }
    const { db, room, growth } = refs(member.discordId);

    return db.runTransaction(async (tx) => {
      const [roomSnap, growthSnap] = await tx.getAll(room, growth);
      const unlocked = toNumberArray(roomSnap.get('unlockedSkins'));
      const myEvolution = growthSnap.get('evolutionId');

      if (!unlocked.includes(skinId) && myEvolution !== skinId) {
        throw new ValidationError('아직 해금되지 않은 외형입니다.');
      }
      tx.set(room, { equippedSkin: skinId }, { merge: true });
      return skinId;
    });
  }, 'room/equipSkin');
}