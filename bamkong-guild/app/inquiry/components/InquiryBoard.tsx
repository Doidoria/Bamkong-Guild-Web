// app/inquiry/components/InquiryBoard.tsx
'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';
import { ChevronDown, PenLine, Send, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { createInquiry, listInquiries, reactToInquiry } from '../actions';
import {
  DEFAULT_LIST_PARAMS, INQUIRY_CATEGORIES, MAX_CONTENT, MAX_TITLE, MIN_CONTENT, MIN_TITLE,
  formatKstDate, formatKstDateTime,
  type InquiryCategory, type InquiryPage, type ListParams, type ReactionType,
} from '../types';
import { CategoryBadge, StatusBadge } from './badges';
import ListControls from './ListControls';
import Pagination from './Pagination';

export default function InquiryBoard({ initialPage }: { initialPage: InquiryPage }) {
  const [data, setData] = useState<InquiryPage>(initialPage);
  const [params, setParams] = useState<ListParams>(DEFAULT_LIST_PARAMS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reactingId, setReactingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [category, setCategory] = useState<InquiryCategory>('건의');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isLoading, startLoading] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();
  const listTopRef = useRef<HTMLDivElement>(null);

  const titleLength = title.trim().length;
  const contentLength = content.trim().length;
  const canSubmit =
    titleLength >= MIN_TITLE && titleLength <= MAX_TITLE &&
    contentLength >= MIN_CONTENT && contentLength <= MAX_CONTENT &&
    !isSubmitting;
  const submitHint =
    titleLength < MIN_TITLE
      ? `제목을 ${MIN_TITLE}자 이상 입력해 주세요.`
      : contentLength < MIN_CONTENT
        ? `내용을 ${MIN_CONTENT}자 이상 입력해 주세요.`
        : null;

  const load = (next: ListParams) => {
    startLoading(async () => {
      try {
        const res = await listInquiries(next);
        if (!res.ok) {
          toast.error(res.message);
          return;
        }
        setParams({ ...next, page: res.data.page });
        setData(res.data);
        setExpandedId(null);
      } catch {
        toast.error('목록을 불러오지 못했어요.');
      }
    });
  };

  const changeParams = (patch: Partial<ListParams>) => load({ ...params, ...patch });

  const changePage = (page: number) => {
    changeParams({ page });
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    startSubmit(async () => {
      try {
        const res = await createInquiry({ category, title, content });
        if (!res.ok) {
          toast.error(res.message);
          return;
        }
        setTitle('');
        setContent('');
        setFormOpen(false);
        toast.success('익명으로 등록됐어요! 🌰');
        load(DEFAULT_LIST_PARAMS); // 내 글이 보이도록 전체·최신순 1페이지로
      } catch {
        toast.error('등록하지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    });
  };

  const handleReact = async (id: string, type: ReactionType) => {
    if (reactingId) return;
    setReactingId(id);
    try {
      const res = await reactToInquiry(id, type);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setData((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === id ? { ...item, ...res.data } : item)),
      }));
    } catch {
      toast.error('반응을 저장하지 못했어요.');
    } finally {
      setReactingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 안내 + 작성 */}
      <section className="bg-white/90 backdrop-blur-sm border border-amber-200/60 rounded-[2rem] p-5 md:p-7 shadow-lg">
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-stone-700 break-keep">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
          <p>
            작성자 정보는 <b className="text-amber-900">저장되지 않아요.</b> 운영진을 포함해{' '}
            <b className="text-amber-900">누구도 작성자를 알 수 없으니</b> 편하게 남겨 주세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          aria-expanded={formOpen}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors"
        >
          <PenLine className="w-4 h-4" aria-hidden />
          {formOpen ? '작성 닫기' : '익명 문의 남기기'}
        </button>

        {formOpen && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 animate-fade-in">
            <div role="radiogroup" aria-label="문의 분류" className="flex flex-wrap gap-2">
              {INQUIRY_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={category === c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                    category === c
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={MAX_TITLE}
                placeholder="제목"
                aria-label="제목"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-[15px] font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition"
              />
              <p className="text-right text-xs text-stone-400 mt-1">
                {titleLength} / {MAX_TITLE}
              </p>
            </div>

            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CONTENT}
                rows={5}
                placeholder="내용을 입력해 주세요"
                aria-label="문의 내용"
                className="w-full resize-y rounded-2xl border border-stone-200 bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition"
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-sm ${submitHint ? 'text-orange-600 font-bold' : 'text-stone-400'}`}>
                  {submitHint ?? `${contentLength} / ${MAX_CONTENT}`}
                </span>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" aria-hidden />
                  {isSubmitting ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* 목록 */}
      <div ref={listTopRef} className="scroll-mt-20 space-y-3">
        <ListControls category={params.category} sort={params.sort} disabled={isLoading} onChange={changeParams} />

        <section
          aria-label="문의 목록"
          aria-busy={isLoading}
          className={`bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm overflow-hidden transition-opacity ${
            isLoading ? 'opacity-60' : ''
          }`}
        >
          <p className="px-4 py-2.5 text-xs font-bold text-stone-500 border-b border-stone-100">총 {data.total}건</p>

          {data.items.length === 0 ? (
            <p className="text-center text-stone-500 font-bold py-12">아직 문의가 없어요. 첫 번째로 남겨 보세요! 🌰</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.items.map((item) => {
                const open = expandedId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setExpandedId(open ? null : item.id)}
                      className="w-full flex items-center gap-2 sm:gap-3 px-4 py-3.5 text-left hover:bg-amber-50/60 transition-colors"
                    >
                      <CategoryBadge category={item.category} />
                      <span className="flex-1 min-w-0 truncate font-bold text-stone-800 text-[15px]">{item.title}</span>
                      <StatusBadge status={item.status} />
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-stone-500">
                        <ThumbsUp className="w-3.5 h-3.5" aria-hidden />
                        {item.up}
                      </span>
                      <time dateTime={item.createdAt} className="hidden sm:block text-xs text-stone-400 w-10 text-right">
                        {formatKstDate(item.createdAt)}
                      </time>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>

                    {open && (
                      <div className="px-4 pb-4 animate-fade-in">
                        <div className="bg-stone-50 rounded-xl p-4">
                          <time dateTime={item.createdAt} className="block text-xs text-stone-400 mb-2">
                            {formatKstDateTime(item.createdAt)}
                          </time>
                          <p className="text-[15px] text-stone-700 leading-relaxed whitespace-pre-wrap break-words">
                            {item.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            aria-pressed={item.mine === 'up'}
                            aria-label={`좋아요 ${item.up}개`}
                            disabled={reactingId === item.id}
                            onClick={() => handleReact(item.id, 'up')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold transition-colors disabled:opacity-60 ${
                              item.mine === 'up'
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" aria-hidden />
                            {item.up}
                          </button>
                          <button
                            type="button"
                            aria-pressed={item.mine === 'down'}
                            aria-label={`싫어요 ${item.down}개`}
                            disabled={reactingId === item.id}
                            onClick={() => handleReact(item.id, 'down')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold transition-colors disabled:opacity-60 ${
                              item.mine === 'down'
                                ? 'bg-stone-700 text-white border-stone-700'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" aria-hidden />
                            {item.down}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <Pagination page={data.page} totalPages={data.totalPages} disabled={isLoading} onChange={changePage} />
      </div>
    </div>
  );
}