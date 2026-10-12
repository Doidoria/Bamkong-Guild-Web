// app/inquiry/components/ListControls.tsx
import { CATEGORY_FILTERS, SORT_OPTIONS, type CategoryFilter, type ListParams, type SortType } from '../types';

interface ListControlsProps {
  category: CategoryFilter;
  sort: SortType;
  disabled?: boolean;
  onChange: (patch: Partial<ListParams>) => void;
}

export default function ListControls({ category, sort, disabled, onChange }: ListControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div role="tablist" aria-label="분류" className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            disabled={disabled}
            onClick={() => category !== c && onChange({ category: c, page: 1 })}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-bold border transition-colors disabled:opacity-60 ${
              category === c
                ? 'bg-amber-700 text-white border-amber-700'
                : 'bg-white/90 text-stone-600 border-stone-200 hover:border-amber-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex self-end sm:self-auto gap-1 bg-white/90 rounded-full p-1 border border-stone-200">
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={sort === o.value}
            disabled={disabled}
            onClick={() => sort !== o.value && onChange({ sort: o.value, page: 1 })}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-colors disabled:opacity-60 ${
              sort === o.value ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}