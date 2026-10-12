// app/inquiry/types.ts
// 클라이언트·서버 공용 타입과 상수 ('use server' 파일은 async 함수만 export할 수 있어서 분리)

export const INQUIRY_CATEGORIES = ['건의', '질문', '불편사항', '기타'] as const;
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];

export type CategoryFilter = InquiryCategory | '전체';
export const CATEGORY_FILTERS: readonly CategoryFilter[] = ['전체', ...INQUIRY_CATEGORIES];

export const INQUIRY_STATUSES = ['접수', '검토 중', '반영됨', '보류'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
] as const;
export type SortType = (typeof SORT_OPTIONS)[number]['value'];

export type ReactionType = 'up' | 'down';

export const MIN_TITLE = 2;
export const MAX_TITLE = 50;
export const MIN_CONTENT = 5;
export const MAX_CONTENT = 1000;
export const PAGE_SIZE = 10;
export const MAX_PAGE = 500;
/** 길드 전체 기준 속도 제한 (개인 기록을 남기지 않기 위해) */
export const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 10 } as const;

export const COLLECTIONS = {
  inquiries: 'inquiries',
  reactions: 'inquiry_reactions',
  meta: 'inquiry_meta',
} as const;

export interface ListParams {
  category: CategoryFilter;
  sort: SortType;
  page: number;
}

export const DEFAULT_LIST_PARAMS: ListParams = { category: '전체', sort: 'latest', page: 1 };

export interface InquiryItem {
  id: string;
  category: InquiryCategory;
  status: InquiryStatus;
  title: string;
  content: string;
  up: number;
  down: number;
  createdAt: string; // ISO
  /** 내가 누른 반응 (관리자 목록에서는 항상 null) */
  mine: ReactionType | null;
}

export interface InquiryPage {
  items: InquiryItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReactionResult {
  up: number;
  down: number;
  mine: ReactionType | null;
}

/** 서버·브라우저 결과가 같도록 Intl 대신 직접 KST로 변환 (hydration 불일치 방지) */
function toKst(iso: string): Date {
  return new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 10.12 */
export function formatKstDate(iso: string): string {
  const d = toKst(iso);
  return `${d.getUTCMonth() + 1}.${pad(d.getUTCDate())}`;
}

/** 2026.10.12 14:30 */
export function formatKstDateTime(iso: string): string {
  const d = toKst(iso);
  return `${d.getUTCFullYear()}.${d.getUTCMonth() + 1}.${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}