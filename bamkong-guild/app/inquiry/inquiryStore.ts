// app/inquiry/inquiryStore.ts
// ⚠️ 'use server' 없음: 액션 내부용 헬퍼 (외부에서 호출할 수 있는 엔드포인트가 아님)
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { assertDocId } from '@/app/lib/adminAction';
import {
  COLLECTIONS, INQUIRY_CATEGORIES, PAGE_SIZE,
  type InquiryCategory, type InquiryPage, type ReactionType,
} from './types';

export function reactionDocId(inquiryId: string, userId: string): string {
  return `${inquiryId}_${userId}`;
}

export function toCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function toReaction(value: unknown): ReactionType | null {
  return value === 'up' || value === 'down' ? value : null;
}

function toCategory(value: unknown): InquiryCategory {
  return INQUIRY_CATEGORIES.find((c) => c === value) ?? '기타';
}

function toIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();
}

/** 최신순 PAGE_SIZE개. userId가 있으면 내가 누른 반응도 함께 조회 */
export async function fetchInquiryPage(cursor: string | null, userId: string | null): Promise<InquiryPage> {
  const db = getAdminDb();
  const col = db.collection(COLLECTIONS.inquiries);

  // 1개 더 읽어서 다음 페이지가 있는지 판단
  let query = col.orderBy('createdAt', 'desc').limit(PAGE_SIZE + 1);
  if (cursor) {
    const cursorSnap = await col.doc(assertDocId(cursor, '페이지')).get();
    if (cursorSnap.exists) query = query.startAfter(cursorSnap);
  }

  const snap = await query.get();
  const docs = snap.docs.slice(0, PAGE_SIZE);
  const hasMore = snap.docs.length > PAGE_SIZE;

  // 내 반응: 문서 ID가 정해져 있으므로 쿼리 대신 getAll 한 번 (인덱스 불필요)
  const mine = new Map<string, ReactionType>();
  if (userId && docs.length > 0) {
    const refs = docs.map((d) => db.collection(COLLECTIONS.reactions).doc(reactionDocId(d.id, userId)));
    const reactionSnaps = await db.getAll(...refs);
    reactionSnaps.forEach((r, i) => {
      const type = toReaction(r.get('type'));
      const doc = docs[i];
      if (type && doc) mine.set(doc.id, type);
    });
  }

  return {
    items: docs.map((d) => ({
      id: d.id,
      category: toCategory(d.get('category')),
      content: String(d.get('content') ?? ''),
      up: toCount(d.get('up')),
      down: toCount(d.get('down')),
      createdAt: toIso(d.get('createdAt')),
      mine: mine.get(d.id) ?? null,
    })),
    nextCursor: hasMore ? (docs[docs.length - 1]?.id ?? null) : null,
  };
}