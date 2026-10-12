// app/inquiry/components/badges.tsx
import type { InquiryCategory, InquiryStatus } from '../types';

const CATEGORY_STYLES: Record<InquiryCategory, string> = {
  건의: 'bg-amber-100 text-amber-800',
  질문: 'bg-sky-100 text-sky-800',
  불편사항: 'bg-orange-100 text-orange-800',
  기타: 'bg-stone-100 text-stone-700',
};

const STATUS_STYLES: Record<InquiryStatus, string> = {
  접수: 'bg-stone-100 text-stone-600 border-stone-200',
  '검토 중': 'bg-sky-50 text-sky-700 border-sky-200',
  반영됨: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  보류: 'bg-orange-50 text-orange-700 border-orange-200',
};

export function CategoryBadge({ category }: { category: InquiryCategory }) {
  return (
    <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-black ${CATEGORY_STYLES[category]}`}>
      {category}
    </span>
  );
}

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[11px] font-bold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}