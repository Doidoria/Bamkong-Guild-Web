// app/admin/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { GuildMember, MemberPatch, NewMemberInput } from './types';
import { getDaysSinceLastPromotion, getPromotionInfo } from './utils';
import { Lock, Gamepad2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import AdminStats from './components/AdminStats';
import AdminMemberForm from './components/AdminMemberForm';
import AdminMemberTable from './components/AdminMemberTable';
import {
  listMembers, addMember, updateMember, promoteMember, changeWarning, deleteMember,
} from './actions';

export default function AdminDashboard() {
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 권한 검사는 app/admin/layout.tsx(서버)에서 처리, 데이터는 서버 액션으로 조회
  const loadMembers = useCallback(async () => {
    setRefreshing(true);
    const result = await listMembers();
    if (result.ok) setMembers(result.data);
    else toast.error(result.message);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  /** 서버가 돌려준 최신 문서로 로컬 상태만 교체 (재조회 없이 읽기 절약) */
  const replaceMember = (updated: GuildMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // 통계 계산
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = members.filter(m => {
      const jDate = new Date(m.joined_at);
      return jDate.getMonth() === currentMonth && jDate.getFullYear() === currentYear;
    }).length;
    const promotionCandidates = members.filter(m => {
      if (m.is_blacklisted) return false;
      const promoInfo = getPromotionInfo(m.rank);
      if (!promoInfo) return false; 
      const daysSince = getDaysSinceLastPromotion(m.joined_at, m.last_promoted_at);
      return daysSince >= promoInfo.reqDays;
    }).length;
    const warningCount = members.filter(m => m.warning_count >= 2).length;
    const breakCount = members.filter(m => m.is_on_break).length;

    return { totalMembers, newThisMonth, promotionCandidates, warningCount, breakCount };
  }, [members]);

    const handleAddMember = async (input: NewMemberInput): Promise<boolean> => {
    const result = await addMember(input);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    setMembers((prev) => [result.data, ...prev]);
    toast.success(`'${result.data.nickname}' 님을 등록했습니다! 🌰`);
    return true;
  };

  const handlePromote = async (id: string) => {
    const result = await promoteMember(id);
    if (result.ok) replaceMember(result.data);
    else toast.error(result.message);
  };

  const handleWarningChange = async (id: string, _currentWarning: number, delta: number) => {
    const result = await changeWarning(id, delta);
    if (result.ok) replaceMember(result.data);
    else toast.error(result.message);
  };

  const handleUpdateMember = async (id: string, updatedData: Partial<GuildMember>) => {
    const result = await updateMember(id, updatedData as MemberPatch);
    if (result.ok) replaceMember(result.data);
    else toast.error(result.message);
  };

  const handleDeleteMember = async (id: string) => {
    const result = await deleteMember(id);
    if (result.ok) setMembers((prev) => prev.filter((m) => m.id !== result.data));
    else toast.error(result.message);
  };

  // ⏳ 권한 검증 및 데이터 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center font-sans">
        <Lock className="w-8 h-8 text-amber-500 mb-4 animate-pulse" />
        <div className="font-black text-amber-500 text-lg sm:text-xl">
          관리자 권한을 확인하는 중입니다... 🌰
        </div>
      </div>
    );
  }

  // 💻 메인 대시보드 UI (다크 모드)
  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 md:p-10 font-sans text-stone-300">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-800 pb-4 md:pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-100 flex items-center gap-2 sm:gap-3">
              <span className="text-amber-500">🌰</span> 밤콩 관리자 대시보드
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 font-medium mt-2">
              길드원 가입일, 등업 조건, 경고 및 휴식 현황을 효율적으로 관리하세요.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadMembers}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl border border-stone-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <Link
              href="/admin/game"
              className="group shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold rounded-xl border border-amber-500/20 transition-all shadow-sm"
            >
              <Gamepad2 className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all" />
              게임 관리자 센터로 이동
            </Link>
          </div>
        </div>

        <AdminStats stats={stats} />
        <AdminMemberForm onAddMember={handleAddMember} />
        <AdminMemberTable 
          members={members} 
          stats={stats} 
          onPromote={handlePromote} 
          onWarningChange={handleWarningChange}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
        />
      </div>
    </div>
  );
}