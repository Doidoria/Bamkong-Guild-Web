// app/admin/inquiries/actions.ts
'use server';

import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { runAdminAction, assertDocId, ValidationError, type ActionResult } from '@/app/lib/adminAction';
import { COLLECTIONS, INQUIRY_STATUSES, type InquiryPage, type InquiryStatus, type ListParams } from '@/app/inquiry/types';
import { fetchInquiryPage, parseListParams } from '@/app/inquiry/inquiryStore';

export async function listInquiriesForAdmin(params: ListParams): Promise<ActionResult<InquiryPage>> {
  return runAdminAction(() => fetchInquiryPage(parseListParams(params), null), 'admin inquiry list');
}

export async function setInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
): Promise<ActionResult<InquiryStatus>> {
  return runAdminAction(async () => {
    const id = assertDocId(inquiryId, '문의 ID');
    const next = INQUIRY_STATUSES.find((s) => s === status);
    if (!next) throw new ValidationError('잘못된 상태입니다.');

    const ref = getAdminDb().collection(COLLECTIONS.inquiries).doc(id);
    if (!(await ref.get()).exists) throw new ValidationError('삭제된 문의입니다.');
    await ref.update({ status: next });
    return next;
  }, 'admin inquiry status');
}

/** 문의 + 반응 기록을 한 번에 삭제 */
export async function deleteInquiry(inquiryId: string): Promise<ActionResult<null>> {
  return runAdminAction(async () => {
    const id = assertDocId(inquiryId, '문의 ID');
    const db = getAdminDb();

    const reactions = await db.collection(COLLECTIONS.reactions).where('inquiryId', '==', id).select().get();

    const batch = db.batch();
    batch.delete(db.collection(COLLECTIONS.inquiries).doc(id));
    reactions.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    return null;
  }, 'admin inquiry delete');
}