// app/admin/inquiries/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { deleteInquiry, listInquiriesForAdmin, setInquiryStatus } from './actions';
import {
  DEFAULT_LIST_PARAMS, INQUIRY_STATUSES, formatKstDateTime,
  type InquiryPage, type InquiryStatus, type ListParams,
} from '@/app/inquiry/types';
import { CategoryBadge } from '@/app/inquiry/components/badges';
import ListControls from '@/app/inquiry/components/ListControls';
import Pagination from '@/app/inquiry/components/Pagination';

export default function AdminInquiriesPage() {
  const [data, setData] = useState<InquiryPage | null>(null);
  const [params, setParams] = useState<ListParams>(DEFAULT_LIST_PARAMS);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isLoading, startLoading] = useTransition();

  const load = (next: ListParams) => {
    startLoading(async () => {
      try {
        const res = await listInquiriesForAdmin(next);
        if (!res.ok) {
          toast.error(res.message);
          return;
        }
        setParams({ ...next, page: res.data.page });
        setData(res.data);
      } catch {
        toast.error('목록을 불러오지 못했습니다.');
      }
    });
  };

  useEffect(() => {
    load(DEFAULT_LIST_PARAMS);
    // 첫 진입 시 한 번만 조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatus = async (id: string, status: InquiryStatus) => {
    setBusyId(id);
    try {
      const res = await setInquiryStatus(id, status);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((i) => (i.id === id ? { ...i, status: res.data } : i)) } : prev,
      );
      toast.success(`'${res.data}'(으)로 변경했습니다.`);
    } catch {
      toast.error('상태를 변경하지 못했습니다.');
    } finally {
      setBusyId(null);
    }
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
      toast.success('삭제했습니다.');
      load(params); // 페이지 개수가 바뀔 수 있어 다시 조회
    } catch {
      toast.error('삭제하지 못했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-stone-600 hover:text-amber-700 font-bold">
          <ArrowLeft className="w-5 h-5" aria-hidden />
          관리자 홈
        </Link>
        <h1 className="text-2xl font-black text-stone-800">📮 익명 문의 관리</h1>
      </div>

      <ListControls
        category={params.category}
        sort={params.sort}
        disabled={isLoading}
        onChange={(patch) => load({ ...params, ...patch })}
      />

      {!data ? (
        <p className="text-center text-stone-500 py-10">불러오는 중...</p>
      ) : data.items.length === 0 ? (
        <p className="text-center text-stone-500 py-10">문의가 없습니다.</p>
      ) : (
        <ul className={`space-y-3 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
          {data.items.map((item) => (
            <li key={item.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <CategoryBadge category={item.category} />
                <h2 className="flex-1 min-w-0 font-black text-stone-800 break-words">{item.title}</h2>
                <time dateTime={item.createdAt} className="text-xs text-stone-400">
                  {formatKstDateTime(item.createdAt)}
                </time>
              </div>

              <p className="text-[15px] text-stone-700 leading-relaxed whitespace-pre-wrap break-words">{item.content}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                <div className="flex items-center gap-3 text-sm font-bold text-stone-500">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" aria-hidden />
                    {item.up}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsDown className="w-4 h-4" aria-hidden />
                    {item.down}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    disabled={busyId === item.id}
                    onChange={(e) => {
                      const next = INQUIRY_STATUSES.find((s) => s === e.target.value);
                      if (next) handleStatus(item.id, next);
                    }}
                    aria-label="처리 상태"
                    className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm font-bold text-stone-700 disabled:opacity-60"
                  >
                    {INQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
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
          ))}
        </ul>
      )}

      {data && <Pagination page={data.page} totalPages={data.totalPages} disabled={isLoading} onChange={(page) => load({ ...params, page })} />}
    </div>
  );
}