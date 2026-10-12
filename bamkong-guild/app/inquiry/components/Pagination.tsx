// app/inquiry/components/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onChange: (page: number) => void;
}

const BTN = 'min-w-9 h-9 px-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-40';

export default function Pagination({ page, totalPages, disabled, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // 현재 페이지 주변 최대 5개 번호
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label="페이지" className="flex items-center justify-center gap-1 w-fit mx-auto bg-white/85 backdrop-blur-sm rounded-xl px-1.5 py-1 shadow-sm">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${BTN} text-stone-600 hover:bg-white/80`}
      >
        <ChevronLeft className="w-4 h-4 mx-auto" aria-hidden />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          disabled={disabled}
          onClick={() => p !== page && onChange(p)}
          className={`${BTN} ${p === page ? 'bg-amber-700 text-white' : 'text-stone-700 hover:bg-white/80'}`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        aria-label="다음 페이지"
        disabled={disabled || page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${BTN} text-stone-600 hover:bg-white/80`}
      >
        <ChevronRight className="w-4 h-4 mx-auto" aria-hidden />
      </button>
    </nav>
  );
}