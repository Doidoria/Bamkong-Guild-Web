// app/admin/inquiries/actions.ts
'use server';

import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { runAdminAction, assertDocId, ValidationError, type ActionResult } from '@/app/lib/adminAction';
import { COLLECTIONS, type InquiryPage } from '@/app/inquiry/types';
import { fetchInquiryPage } from '@/app/inquiry/inquiryStore';

export interface InquiryAuthor {
  discordId: string;
  nickname: string | null;
}

export async function listInquiriesForAdmin(cursor: string | null = null): Promise<ActionResult<InquiryPage>> {
  return runAdminAction(() => fetchInquiryPage(cursor, null), 'admin inquiry list');
}

/** 관리자가 "이름 보기"를 누를 때만 작성자 조회 */
export async function revealInquiryAuthor(inquiryId: string): Promise<ActionResult<InquiryAuthor>> {
  return runAdminAction(async () => {
    const id = assertDocId(inquiryId, '문의 ID');
    const snap = await getAdminDb().collection(COLLECTIONS.authors).doc(id).get();

    const discordId = snap.get('discordId');
    if (typeof discordId !== 'string') throw new ValidationError('작성자 정보가 없습니다.');
    const nickname = snap.get('nickname');

    return { discordId, nickname: typeof nickname === 'string' ? nickname : null };
  }, 'admin inquiry reveal');
}

/** 문의 + 작성자 + 반응 기록을 한 번에 삭제 */
export async function deleteInquiry(inquiryId: string): Promise<ActionResult<null>> {
  return runAdminAction(async () => {
    const id = assertDocId(inquiryId, '문의 ID');
    const db = getAdminDb();

    const reactions = await db.collection(COLLECTIONS.reactions).where('inquiryId', '==', id).select().get();

    const batch = db.batch();
    batch.delete(db.collection(COLLECTIONS.inquiries).doc(id));
    batch.delete(db.collection(COLLECTIONS.authors).doc(id));
    reactions.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    return null;
  }, 'admin inquiry delete');
}