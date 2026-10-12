// app/admin/inquiries/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { deleteInquiry, listInquiriesForAdmin, revealInquiryAuthor, type InquiryAuthor } from './actions';
import { formatKst, type InquiryItem } from '@/app/inquiry/types';

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<Record<string, InquiryAuthor>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isLoadingMore, startLoadMore] = useTransition();

  useEffect(() => {
    let cancelled = false;
    listInquiriesForAdmin(null)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setItems(res.data.items);
          setNextCursor(res.data.nextCursor);
        } else {
          toast.error(res.message);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadMore = () => {
    if (!nextCursor) return;
    startLoadMore(async () => {
      try {
        const res = await listInquiriesForAdmin(nextCursor);
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
        toast.error('목록을 불러오지 못했습니다.');
      }
    });
  };

  const toggleReveal = async (id: string) => {
    if (revealed[id]) {
      setRevealed((prev) => ({ ...prev, [id]: false }));
      return;
    }
    if (!authors[id]) {
      setBusyId(id);
      try {
        const res = await revealInquiryAuthor(id);
        if (!res.ok) {
          toast.error(res.message);
          return;
        }
        setAuthors((prev) => ({ ...prev, [id]: res.data }));
      } catch {
        toast.error('작성자를 불러오지 못했습니다.');
        return;
      } finally {
        setBusyId(null);
      }
    }
    setRevealed((prev) => ({ ...prev, [id]: true }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 문의를 삭제할까요? 반응 기록도 함께 삭제되고 되돌릴 수 없어요.')) return;
    setBusyId(id);
    try {
      const res = await deleteInquiry(id);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('삭제했습니다.');
    } catch {
      toast.error('삭제하지 못했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-stone-600 hover:text-amber-700 font-bold">
          <ArrowLeft className="w-5 h-5" aria-hidden />
          관리자 홈
        </Link>
        <h1 className="text-2xl font-black text-stone-800">📮 익명 문의 관리</h1>
      </div>

      {loading ? (
        <p className="text-center text-stone-500 py-10">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-stone-500 py-10">문의가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const author = authors[item.id];
            const isRevealed = revealed[item.id] === true && author;
            return (
              <li key={item.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-black">{item.category}</span>
                    <span className={`font-bold ${isRevealed ? 'text-rose-700' : 'text-stone-400'}`}>
                      👤 {isRevealed ? `${author.nickname ?? '(별명 없음)'} · ${author.discordId}` : '익명'}
                    </span>
                  </div>
                  <time dateTime={item.createdAt} className="text-xs text-stone-400">{formatKst(item.createdAt)}</time>
                </div>

                <p className="text-[15px] text-stone-700 leading-relaxed whitespace-pre-wrap break-words">{item.content}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-stone-500">
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="w-4 h-4" aria-hidden />{item.up}</span>
                    <span className="inline-flex items-center gap-1"><ThumbsDown className="w-4 h-4" aria-hidden />{item.down}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleReveal(item.id)}
                      disabled={busyId === item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold transition-colors disabled:opacity-60"
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
                      {isRevealed ? '이름 숨기기' : '이름 보기'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={busyId === item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold transition-colors disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {nextCursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="w-full py-3 bg-white hover:bg-stone-50 text-stone-700 font-bold rounded-xl border border-stone-200 transition-colors disabled:opacity-60"
        >
          {isLoadingMore ? '불러오는 중...' : '더 보기'}
        </button>
      )}
    </div>
  );
}