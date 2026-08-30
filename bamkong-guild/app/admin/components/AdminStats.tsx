// app/admin/components/AdminStats.tsx
import React from 'react';
import { Users, UserPlus, Award, AlertTriangle, Moon } from 'lucide-react';
import { AdminStatsData } from '../types';

export default function AdminStats({ stats }: { stats: AdminStatsData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      <div className="bg-stone-900 p-4 md:p-5 rounded-2xl shadow-lg shadow-black/20 border border-stone-800 flex items-center gap-3 md:gap-4 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 md:p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20"><Users className="w-5 h-5 md:w-6 md:h-6" /></div>
        <div>
          <p className="text-[10px] md:text-xs font-bold text-stone-400">총 길드원</p>
          <p className="text-lg md:text-2xl font-black text-stone-100">{stats.totalMembers}명</p>
        </div>
      </div>
      <div className="bg-stone-900 p-4 md:p-5 rounded-2xl shadow-lg shadow-black/20 border border-stone-800 flex items-center gap-3 md:gap-4 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 md:p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><UserPlus className="w-5 h-5 md:w-6 md:h-6" /></div>
        <div>
          <p className="text-[10px] md:text-xs font-bold text-stone-400">이번 달 신규</p>
          <p className="text-lg md:text-2xl font-black text-emerald-400">+{stats.newThisMonth}명</p>
        </div>
      </div>
      <div className="bg-stone-900 p-4 md:p-5 rounded-2xl shadow-lg shadow-black/20 border border-stone-800 flex items-center gap-3 md:gap-4 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 md:p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20"><Award className="w-5 h-5 md:w-6 md:h-6" /></div>
        <div>
          <p className="text-[10px] md:text-xs font-bold text-stone-400">등업 조건 충족</p>
          <p className="text-lg md:text-2xl font-black text-blue-400">{stats.promotionCandidates}명</p>
        </div>
      </div>
      <div className="bg-stone-900 p-4 md:p-5 rounded-2xl shadow-lg shadow-black/20 border border-stone-800 flex items-center gap-3 md:gap-4 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 md:p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20"><AlertTriangle className="w-5 h-5 md:w-6 md:h-6" /></div>
        <div>
          <p className="text-[10px] md:text-xs font-bold text-stone-400">경고 (2회+)</p>
          <p className="text-lg md:text-2xl font-black text-rose-500">{stats.warningCount}명</p>
        </div>
      </div>
      <div className="bg-stone-900 p-4 md:p-5 rounded-2xl shadow-lg shadow-black/20 border border-stone-800 flex items-center gap-3 md:gap-4 col-span-2 lg:col-span-1 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 md:p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20"><Moon className="w-5 h-5 md:w-6 md:h-6" /></div>
        <div>
          <p className="text-[10px] md:text-xs font-bold text-stone-400">휴식/잠수 중</p>
          <p className="text-lg md:text-2xl font-black text-purple-400">{stats.breakCount}명</p>
        </div>
      </div>
    </div>
  );
}