// app/lib/memberAction.ts
// ⚠️ 'use server' 없음: 액션 내부용 헬퍼
import { getGuildMemberSession, type MemberSession } from '@/app/lib/auth';
import { ValidationError, type ActionResult } from '@/app/lib/adminAction';

/** 길드원 검증 + 공통 에러 처리. 세션의 Discord ID로만 본인 문서에 접근할 것 */
export async function runMemberAction<T>(
  fn: (session: MemberSession) => Promise<T>,
  label = 'member action',
): Promise<ActionResult<T>> {
  try {
    const session = await getGuildMemberSession();
    if (!session) {
      return { ok: false, message: '밤콩 길드원만 이용할 수 있습니다. 다시 로그인해 주세요.' };
    }
    return { ok: true, data: await fn(session) };
  } catch (error) {
    if (error instanceof ValidationError) return { ok: false, message: error.message };
    console.error(`[${label}]`, error);
    return { ok: false, message: '처리 중 오류가 발생했습니다.' };
  }
}