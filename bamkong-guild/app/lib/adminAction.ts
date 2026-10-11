// app/lib/adminAction.ts
// ⚠️ 'use server'를 붙이지 않음: 여기 함수들은 액션 내부용 헬퍼이고, 외부에서 호출할 수 있는 엔드포인트가 아님
import { getAdminSession } from '@/app/lib/auth';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

/** 사용자에게 메시지를 그대로 보여줘도 되는 에러 */
export class ValidationError extends Error {}

/** 관리자 검증 + 공통 에러 처리. 모든 관리자 Server Action은 이걸로 감쌀 것 */
export async function runAdminAction<T>(
  fn: () => Promise<T>,
  label = 'admin action',
): Promise<ActionResult<T>> {
  try {
    if (!(await getAdminSession())) return { ok: false, message: '관리자 권한이 없습니다.' };
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof ValidationError) return { ok: false, message: error.message };
    console.error(`[${label}]`, error);
    return { ok: false, message: '처리 중 오류가 발생했습니다.' };
  }
}

/** Firestore 문서 ID 검증 (경로 조작 방지) */
export function assertDocId(id: unknown, label = 'ID'): string {
  if (typeof id !== 'string' || !id || id.includes('/') || id.length > 128) {
    throw new ValidationError(`잘못된 ${label}입니다.`);
  }
  return id;
}