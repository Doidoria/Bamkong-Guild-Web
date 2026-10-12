// app/inquiry/types.ts
// 클라이언트·서버 공용 타입과 상수 ('use server' 파일은 async 함수만 export할 수 있어서 분리)

export const INQUIRY_CATEGORIES = ['건의', '질문', '불편사항', '기타'] as const;
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];

export type ReactionType = 'up' | 'down';

export const MAX_CONTENT = 1000;
export const MIN_CONTENT = 5;
export const PAGE_SIZE = 20;
export const POST_COOLDOWN_MS = 60_000;

export const COLLECTIONS = {
  inquiries: 'inquiries',
  authors: 'inquiry_authors',
  reactions: 'inquiry_reactions',
  cooldowns: 'inquiry_cooldowns',
} as const;

export interface InquiryItem {
  id: string;
  category: InquiryCategory;
  content: string;
  up: number;
  down: number;
  createdAt: string; // ISO
  /** 내가 누른 반응 (관리자 목록에서는 항상 null) */
  mine: ReactionType | null;
}

export interface InquiryPage {
  items: InquiryItem[];
  nextCursor: string | null;
}

export interface ReactionResult {
  up: number;
  down: number;
  mine: ReactionType | null;
}

/** 서버·브라우저 결과가 같도록 Intl 대신 직접 KST로 포맷 (hydration 불일치 방지) */
export function formatKst(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCMonth() + 1}.${d.getUTCDate()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}