// app/inquiry/components/InquiryBoard.tsx
'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Send, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { createInquiry, listInquiries, reactToInquiry } from '../actions';
import {
  INQUIRY_CATEGORIES, MAX_CONTENT, MIN_CONTENT, formatKst,
  type InquiryCategory, type InquiryItem, type InquiryPage, type ReactionType,
} from '../types';

const CATEGORY_STYLES: Record<InquiryCategory, string> = {
  건의: 'bg-amber-100 text-amber-800',
  질문: 'bg-sky-100 text-sky-800',
  불편사항: 'bg-orange-100 text-orange-800',
  기타: 'bg-stone-100 text-stone-700',
};

export default function InquiryBoard({ initialPage }: { initialPage: InquiryPage }) {
  const [items, setItems] = useState<InquiryItem[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
  const [category, setCategory] = useState<InquiryCategory>('건의');
  const [content, setContent] = useState('');
  const [reactingId, setReactingId] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [isLoadingMore, startLoadMore] = useTransition();

  const length = content.trim().length;
  const canSubmit = length >= MIN_CONTENT && length <= MAX_CONTENT && !isSubmitting;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    startSubmit(async () => {
      try {
        const res = await createInquiry({ category, content });
        if (!res.ok) {
          toast.error(res.message);
          return;
        }
        setContent('');
        toast.success('익명으로 등록됐어요! 🌰');

        const list = await listInquiries(null);
        if (list.ok) {
          setItems(list.data.items);
          setNextCursor(list.data.nextCursor);
        }
      } catch {
        toast.error('등록하지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    });
  };

  const handleLoadMore = () => {
    if (!nextCursor) return;
    startLoadMore(async () => {
      try {
        const res = await listInquiries(nextCursor);
        if (!res.ok) {
          toast.error(res.message);
          return;
        }
        setItems((prev) => {
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...res.data.items.filter((i) => !seen.has(i.id))];
        });
        setNextCursor(res.data.nextCursor);
      } catch {
        toast.error('목록을 불러오지 못했어요.');
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
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...res.data } : item)));
    } catch {
      toast.error('반응을 저장하지 못했어요.');
    } finally {
      setReactingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 작성 영역 */}
      <section className="bg-white/90 backdrop-blur-sm border border-amber-200/60 rounded-[2rem] p-6 md:p-8 shadow-lg">
        <h2 className="text-2xl font-black text-stone-800 mb-2">무엇이든 편하게 남겨 주세요</h2>
        <p className="text-sm text-stone-600 mb-4 break-keep">운영에 대한 건의, 궁금한 점, 불편했던 점 모두 환영해요.</p>

        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 text-sm text-stone-700 break-keep">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
          <p>
            <b className="text-amber-900">다른 길드원에게는 익명</b>으로 표시돼요. 문제 해결을 위해{' '}
            <b className="text-amber-900">운영진만</b> 작성자를 확인할 수 있어요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <span className={`text-xs ${length > 0 && length < MIN_CONTENT ? 'text-orange-600' : 'text-stone-400'}`}>
                {length} / {MAX_CONTENT}
              </span>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" aria-hidden />
                {isSubmitting ? '등록 중...' : '익명으로 남기기'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 목록 */}
      <section aria-label="문의 목록" className="space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-stone-700 font-bold bg-white/70 rounded-2xl py-10">
            아직 문의가 없어요. 첫 번째로 남겨 보세요! 🌰
          </p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-black ${CATEGORY_STYLES[item.category]}`}>
                  {item.category}
                </span>
                <time dateTime={item.createdAt} className="text-xs text-stone-400">
                  {formatKst(item.createdAt)}
                </time>
              </div>

              <p className="text-[15px] text-stone-700 leading-relaxed whitespace-pre-wrap break-words">{item.content}</p>

              <div className="flex items-center gap-2 mt-4">
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
            </article>
          ))
        )}

        {nextCursor && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full py-3 bg-white/80 hover:bg-white text-amber-900 font-bold rounded-xl border border-amber-200 transition-colors disabled:opacity-60"
          >
            {isLoadingMore ? '불러오는 중...' : '더 보기'}
          </button>
        )}
      </section>
    </div>
  );
}