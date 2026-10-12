// app/game/room/roomValidation.ts
// 방 데이터 검증·변환 (서버 액션들이 함께 사용). ⚠️ 'use server' 아님
import { ValidationError } from '@/app/lib/adminAction';
import { INVENTORY_ITEMS } from './constants/inventory';

export interface RoomItemPosition {
  id: string;
  xPos: number;
  yPos: number;
}

export const ROOM_ITEM_IDS: ReadonlySet<string> = new Set(INVENTORY_ITEMS.map((item) => item.id));

const POS_LIMIT = 10_000; // 좌표 단위와 무관하게 비정상 값만 차단

function isValidPos(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= POS_LIMIT;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export function toNumberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((v): v is number => typeof v === 'number' && Number.isInteger(v))
    : [];
}

/** DB → 화면: 예전 형식(문자열 ID만 저장)도 기본 좌표로 변환, 잘못된 항목은 버림 */
export function parsePlacedItems(value: unknown): RoomItemPosition[] {
  if (!Array.isArray(value)) return [];
  const out: RoomItemPosition[] = [];
  for (const raw of value) {
    if (typeof raw === 'string') {
      const base = INVENTORY_ITEMS.find((item) => item.id === raw);
      if (base) out.push({ id: raw, xPos: base.xPos ?? 50, yPos: base.yPos ?? 50 });
      continue;
    }
    if (typeof raw === 'object' && raw !== null) {
      const { id, xPos, yPos } = raw as { id?: unknown; xPos?: unknown; yPos?: unknown };
      if (typeof id === 'string' && ROOM_ITEM_IDS.has(id) && isValidPos(xPos) && isValidPos(yPos)) {
        out.push({ id, xPos, yPos });
      }
    }
  }
  return out;
}

/** 보유 가구 목록 검증 (관리자용) */
export function sanitizeOwnedItems(input: unknown): string[] {
  if (!Array.isArray(input) || input.length > ROOM_ITEM_IDS.size) {
    throw new ValidationError('보유 가구 목록이 올바르지 않습니다.');
  }
  const out = new Set<string>();
  for (const id of input) {
    if (typeof id !== 'string' || !ROOM_ITEM_IDS.has(id)) throw new ValidationError('알 수 없는 가구가 있습니다.');
    out.add(id);
  }
  return [...out];
}

/** 배치 목록 검증: 존재하는 가구, 중복 없음, 보유한 가구만, 좌표는 숫자 */
export function sanitizePlacedItems(input: unknown, owned: readonly string[]): RoomItemPosition[] {
  if (!Array.isArray(input) || input.length > ROOM_ITEM_IDS.size) {
    throw new ValidationError('가구 배치 정보가 올바르지 않습니다.');
  }
  const ownedSet = new Set(owned);
  const seen = new Set<string>();
  const out: RoomItemPosition[] = [];

  for (const raw of input) {
    if (typeof raw !== 'object' || raw === null) throw new ValidationError('가구 배치 정보가 올바르지 않습니다.');
    const { id, xPos, yPos } = raw as { id?: unknown; xPos?: unknown; yPos?: unknown };

    if (typeof id !== 'string' || !ROOM_ITEM_IDS.has(id) || seen.has(id)) {
      throw new ValidationError('가구 배치 정보가 올바르지 않습니다.');
    }
    if (!ownedSet.has(id)) throw new ValidationError('보유하지 않은 가구가 포함되어 있습니다.');
    if (!isValidPos(xPos) || !isValidPos(yPos)) throw new ValidationError('가구 위치 값이 올바르지 않습니다.');

    seen.add(id);
    out.push({ id, xPos: round2(xPos), yPos: round2(yPos) });
  }
  return out;
}