// app/admin/actions.ts
'use server';

import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { getAdminSession } from '@/app/lib/auth';
import { getDaysSinceJoined, getPromotionInfo } from './utils';
import type { GuildMember, MemberPatch, NewMemberInput } from './types';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

const COLLECTION = 'members';
const RANKS: readonly GuildMember['rank'][] = ['새싹', '밤콩', '알밤콩', '명예 밤콩', '부대장'];
const PROMOTION_STATUSES: readonly GuildMember['promotion_status'][] = ['등업 대기', '조건 충족', '등업 완료'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DISCORD_ID_PATTERN = /^\d{17,20}$/;
const MAX_NICKNAME = 30;
const MAX_TEXT = 500;

class ValidationError extends Error {}

/** 모든 액션 공통: 관리자 검증 + 에러 처리 */
async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    if (!(await getAdminSession())) return { ok: false, message: '관리자 권한이 없습니다.' };
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof ValidationError) return { ok: false, message: error.message };
    console.error('[admin action]', error);
    return { ok: false, message: '처리 중 오류가 발생했습니다.' };
  }
}

function memberRef(id: string) {
  if (typeof id !== 'string' || !id || id.includes('/') || id.length > 128) {
    throw new ValidationError('잘못된 길드원 ID입니다.');
  }
  return getAdminDb().collection(COLLECTION).doc(id);
}

function toMember(snap: DocumentSnapshot): GuildMember {
  return { id: snap.id, ...snap.data() } as GuildMember;
}

/** 한국 시간 기준 YYYY-MM-DD */
function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function validNickname(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('닉네임이 올바르지 않습니다.');
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_NICKNAME) {
    throw new ValidationError(`닉네임은 1~${MAX_NICKNAME}자로 입력해 주세요.`);
  }
  return trimmed;
}

function validText(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length > MAX_TEXT) {
    throw new ValidationError(`${label}은(는) ${MAX_TEXT}자 이하로 입력해 주세요.`);
  }
  return value;
}

function validDate(value: unknown, label: string, allowEmpty: boolean): string {
  if (typeof value === 'string' && (DATE_PATTERN.test(value) || (allowEmpty && value === ''))) return value;
  throw new ValidationError(`${label} 날짜 형식이 올바르지 않습니다.`);
}

function validBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') throw new ValidationError(`${label} 값이 올바르지 않습니다.`);
  return value;
}

/** 허용된 필드만 검증해서 통과 (그 외 필드는 무시) */
function sanitizePatch(input: MemberPatch): MemberPatch {
  const out: MemberPatch = {};

  for (const [key, value] of Object.entries(input ?? {})) {
    if (value === undefined) continue;

    switch (key) {
      case 'nickname':
        out.nickname = validNickname(value);
        break;
      case 'rank':
        if (!RANKS.includes(value as GuildMember['rank'])) throw new ValidationError('알 수 없는 등급입니다.');
        out.rank = value as GuildMember['rank'];
        break;
      case 'promotion_status':
        if (!PROMOTION_STATUSES.includes(value as GuildMember['promotion_status'])) {
          throw new ValidationError('알 수 없는 등업 상태입니다.');
        }
        out.promotion_status = value as GuildMember['promotion_status'];
        break;
      case 'joined_at':
        out.joined_at = validDate(value, '가입일', false);
        break;
      case 'last_promoted_at':
        out.last_promoted_at = validDate(value, '최근 등업일', true);
        break;
      case 'break_start_date':
        out.break_start_date = validDate(value, '휴식 시작일', true);
        break;
      case 'break_end_date':
        out.break_end_date = validDate(value, '복귀 예정일', true);
        break;
      case 'warning_count':
        if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 10) {
          throw new ValidationError('경고 횟수가 올바르지 않습니다.');
        }
        out.warning_count = value as number;
        break;
      case 'custom_req_days':
        if (value !== null && (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 3650)) {
          throw new ValidationError('등업 필요 일수가 올바르지 않습니다.');
        }
        out.custom_req_days = value as number | null;
        break;
      case 'is_on_break':
        out.is_on_break = validBoolean(value, '휴식 여부');
        break;
      case 'is_blacklisted':
        out.is_blacklisted = validBoolean(value, '블랙리스트 여부');
        break;
      case 'memo':
        out.memo = validText(value, '메모');
        break;
      case 'blacklist_reason':
        out.blacklist_reason = validText(value, '제명 사유');
        break;
      case 'discord_id':
        if (typeof value !== 'string' || (value !== '' && !DISCORD_ID_PATTERN.test(value))) {
          throw new ValidationError('디스코드 ID 형식이 올바르지 않습니다.');
        }
        out.discord_id = value;
        break;
      default:
        // id, created_at 등 수정 불가 필드는 무시
        break;
    }
  }

  return out;
}

/** 닉네임 중복 검사 (대소문자 무시) — 문서 수만큼 읽기 발생 */
async function assertNicknameAvailable(nickname: string, excludeId?: string): Promise<void> {
  const snap = await getAdminDb().collection(COLLECTION).select('nickname').get();
  const lower = nickname.toLowerCase();
  const isDuplicate = snap.docs.some(
    (d) => d.id !== excludeId && String(d.get('nickname') ?? '').toLowerCase() === lower,
  );
  if (isDuplicate) throw new ValidationError(`'${nickname}' 닉네임은 이미 등록되어 있습니다! 🌰`);
}

// ───────────── 액션 ─────────────

export async function listMembers(): Promise<ActionResult<GuildMember[]>> {
  return run(async () => {
    const snap = await getAdminDb().collection(COLLECTION).orderBy('joined_at', 'desc').get();
    return snap.docs.map(toMember);
  });
}

export async function addMember(input: NewMemberInput): Promise<ActionResult<GuildMember>> {
  return run(async () => {
    const nickname = validNickname(input?.nickname);
    const joinedAt = validDate(input?.joined_at, '가입일', false);
    await assertNicknameAvailable(nickname);

    const data = {
      nickname,
      rank: '새싹' as const,
      joined_at: joinedAt,
      warning_count: 0,
      is_on_break: false,
      promotion_status: (getDaysSinceJoined(joinedAt) >= 30 ? '조건 충족' : '등업 대기') as GuildMember['promotion_status'],
      created_at: new Date().toISOString(),
    };

    const ref = await getAdminDb().collection(COLLECTION).add(data);
    return { id: ref.id, ...data };
  });
}

export async function updateMember(id: string, patch: MemberPatch): Promise<ActionResult<GuildMember>> {
  return run(async () => {
    const ref = memberRef(id);
    const clean = sanitizePatch(patch);
    if (Object.keys(clean).length === 0) throw new ValidationError('변경할 내용이 없습니다.');
    if (clean.nickname) await assertNicknameAvailable(clean.nickname, id);

    await ref.update(clean);
    return toMember(await ref.get());
  });
}

export async function promoteMember(id: string): Promise<ActionResult<GuildMember>> {
  return run(async () => {
    const ref = memberRef(id);
    const snap = await ref.get();
    if (!snap.exists) throw new ValidationError('길드원을 찾을 수 없습니다.');

    const member = toMember(snap);
    const promo = getPromotionInfo(member.rank, member.custom_req_days);
    if (!promo) throw new ValidationError('더 이상 승급할 수 없는 등급입니다.');

    const update = {
      rank: promo.nextRank as GuildMember['rank'],
      promotion_status: '등업 완료' as const,
      last_promoted_at: todayKST(),
    };
    await ref.update(update);
    return { ...member, ...update };
  });
}

/** 트랜잭션: 동시에 눌러도 경고 수가 꼬이지 않음 */
export async function changeWarning(id: string, delta: number): Promise<ActionResult<GuildMember>> {
  return run(async () => {
    if (delta !== 1 && delta !== -1) throw new ValidationError('잘못된 요청입니다.');
    const ref = memberRef(id);

    return getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new ValidationError('길드원을 찾을 수 없습니다.');

      const next = Math.max(0, Number(snap.get('warning_count') ?? 0) + delta);
      tx.update(ref, { warning_count: next });
      return { ...toMember(snap), warning_count: next };
    });
  });
}

export async function deleteMember(id: string): Promise<ActionResult<string>> {
  return run(async () => {
    await memberRef(id).delete();
    return id;
  });
}