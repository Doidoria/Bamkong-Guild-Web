// app/inquiry/inquiryStore.ts
// ⚠️ 'use server' 없음: 액션 내부용 헬퍼 (외부에서 호출할 수 있는 엔드포인트가 아님)
import { Timestamp, type Query } from 'firebase-admin/firestore';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import {
  CATEGORY_FILTERS, COLLECTIONS, INQUIRY_CATEGORIES, INQUIRY_STATUSES, MAX_PAGE, PAGE_SIZE, SORT_OPTIONS,
  type InquiryPage, type ListParams, type ReactionType,
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

function pick<T extends string>(list: readonly T[], value: unknown, fallback: T): T {
  return list.find((v) => v === value) ?? fallback;
}

function toIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();
}

/** 클라이언트가 보낸 목록 조건 검증 (잘못된 값은 기본값으로 대체) */
export function parseListParams(input: unknown): ListParams {
  const obj = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
  const page =
    typeof obj.page === 'number' && Number.isInteger(obj.page) ? Math.min(Math.max(obj.page, 1), MAX_PAGE) : 1;

  return {
    category: pick(CATEGORY_FILTERS, obj.category, '전체'),
    sort: pick(SORT_OPTIONS.map((o) => o.value), obj.sort, 'latest'),
    page,
  };
}

/** 번호 페이지네이션. userId가 있으면 내가 누른 반응도 함께 조회 */
export async function fetchInquiryPage(params: ListParams, userId: string | null): Promise<InquiryPage> {
  const db = getAdminDb();

  let base: Query = db.collection(COLLECTIONS.inquiries);
  if (params.category !== '전체') base = base.where('category', '==', params.category);

  // 전체 개수: count 집계는 1,000건당 읽기 1회로 저렴
  const total = (await base.count().get()).data().count;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(params.page, totalPages);

  const ordered =
    params.sort === 'popular'
      ? base.orderBy('up', 'desc').orderBy('createdAt', 'desc')
      : base.orderBy('createdAt', 'desc');

  // ⚠️ offset으로 건너뛴 문서도 읽기로 과금됨 (수백 건 규모에서는 무시 가능)
  const snap = await ordered.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).get();
  const docs = snap.docs;

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
    items: docs.map((d) => {
      const content = String(d.get('content') ?? '');
      const rawTitle = d.get('title');
      return {
        id: d.id,
        category: pick(INQUIRY_CATEGORIES, d.get('category'), '기타'),
        status: pick(INQUIRY_STATUSES, d.get('status'), '접수'),
        // 제목 필드가 없던 테스트 데이터 대비
        title: typeof rawTitle === 'string' && rawTitle ? rawTitle : content.slice(0, 30),
        content,
        up: toCount(d.get('up')),
        down: toCount(d.get('down')),
        createdAt: toIso(d.get('createdAt')),
        mine: mine.get(d.id) ?? null,
      };
    }),
    total,
    page,
    totalPages,
  };
}