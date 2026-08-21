import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, UserX, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysSinceJoined, getDaysSinceLastPromotion, getPromotionInfo } from '../utils';
import { GuildMember, AdminStatsData } from '../types';
import MemberDetailModal from './MemberDetailModal';

interface Props {
  members: GuildMember[];
  stats: AdminStatsData;
  onPromote: (id: string) => void;
  onWarningChange: (id: string, currentWarning: number, delta: number) => void;
  onUpdateMember: (id: string, updatedData: Partial<GuildMember>) => void;
  onDeleteMember: (id: string) => void;
}

const ITEMS_PER_PAGE = 10; // 한 페이지당 보여줄 길드원 수

export default function AdminMemberTable({ members, stats, onPromote, onWarningChange, onUpdateMember, onDeleteMember }: Props) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'promotions' | 'warnings' | 'breaks' | 'blacklists'>('all');
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);
  
  // 📄 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);

  // 검색어나 탭이 변경되면 항상 1페이지로 돌아가도록 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTab]);

  const handleExportCSV = () => {
    if (members.length === 0) {
      alert('백업할 길드원 데이터가 없습니다. 🌰');
      return;
    }

    const headers = ['닉네임', '현재 등급', '가입일', '활동 기간', '등업 상태', '경고 횟수', '휴식 여부', '복귀 예정일', '관리 메모', '블랙리스트 여부', '제명 사유'];
    
    const rows = members.map((m) => {
      const daysJoined = getDaysSinceJoined(m.joined_at);
      const promoInfo = getPromotionInfo(m.rank, m.custom_req_days);
      const daysSincePromotion = getDaysSinceLastPromotion(m.joined_at, m.last_promoted_at);
      const isEligible = promoInfo && daysSincePromotion >= promoInfo.reqDays && !m.is_blacklisted;
      
      const promotionText = m.is_blacklisted ? '제명' : isEligible ? '조건 충족' : (promoInfo ? `대기 (${promoInfo.reqDays - daysSincePromotion}일 남음)` : '최고 등급');
      
      return [
        `"${m.nickname}"`,
        `"${m.rank}"`,
        `"${m.joined_at}"`,
        `"${daysJoined}일 차"`,
        `"${promotionText}"`,
        `"${m.warning_count}"`,
        `"${m.is_on_break ? '휴식 중' : '활동 중'}"`,
        `"${m.break_end_date || '-'}"`,
        `"${(m.memo || '').replace(/"/g, '""')}"`,
        `"${m.is_blacklisted ? 'Y' : 'N'}"`,
        `"${(m.blacklist_reason || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const todayStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `밤콩길드_명단백업_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.nickname.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedTab === 'blacklists') return m.is_blacklisted;
    if (m.is_blacklisted) return false;

    if (selectedTab === 'promotions') {
      const promoInfo = getPromotionInfo(m.rank, m.custom_req_days);
      return promoInfo && getDaysSinceLastPromotion(m.joined_at, m.last_promoted_at) >= promoInfo.reqDays;
    }
    if (selectedTab === 'warnings') return m.warning_count >= 2;
    if (selectedTab === 'breaks') return m.is_on_break;
    return true;
  });

  // 📄 페이지네이션 계산 로직
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const blacklistCount = members.filter((m) => m.is_blacklisted).length;

  return (
    <div className="bg-stone-900 rounded-2xl shadow-xl shadow-black/20 border border-stone-800 overflow-hidden flex flex-col">
      
      {/* 📱 모바일 대응 툴바 헤더 */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-stone-800 flex flex-col gap-4">
        
        {/* 탭 버튼들 */}
        <div className="flex gap-2 overflow-x-auto w-full pb-3 snap-x [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-stone-950 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-700 hover:[&::-webkit-scrollbar-thumb]:bg-stone-500 transition-colors">
          <button onClick={() => setSelectedTab('all')} className={`snap-start px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${selectedTab === 'all' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>전체 ({members.length - blacklistCount})</button>
          <button onClick={() => setSelectedTab('promotions')} className={`snap-start px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${selectedTab === 'promotions' ? 'bg-blue-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>등업 대상 ({stats.promotionCandidates})</button>
          <button onClick={() => setSelectedTab('warnings')} className={`snap-start px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${selectedTab === 'warnings' ? 'bg-rose-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>경고 주의 ({stats.warningCount})</button>
          <button onClick={() => setSelectedTab('breaks')} className={`snap-start px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${selectedTab === 'breaks' ? 'bg-purple-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>휴식 중 ({stats.breakCount})</button>
          <button onClick={() => setSelectedTab('blacklists')} className={`snap-start px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTab === 'blacklists' ? 'bg-red-950 border border-red-600 text-red-400' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}>
            <UserX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 블랙리스트 ({blacklistCount})
          </button>
        </div>

        {/* 검색 및 다운로드 버튼 */}
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="닉네임 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium transition-all" />
          </div>
          <button onClick={handleExportCSV} title="CSV 다운로드" className="px-4 py-3 sm:py-2.5 bg-stone-800 hover:bg-emerald-600/20 text-stone-300 hover:text-emerald-400 border border-stone-700 hover:border-emerald-500/40 rounded-xl text-sm sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV 백업</span>
          </button>
        </div>

      </div>

      {/* 📱 명단 테이블 */}
      <div className="overflow-x-auto relative pb-3 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-stone-950/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-700 hover:[&::-webkit-scrollbar-thumb]:bg-stone-500 transition-colors">
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-stone-900 to-transparent pointer-events-none md:hidden z-10"></div>
        
        <table className="w-full min-w-[900px] text-left border-collapse text-sm relative">
          <thead>
            <tr className="bg-stone-950/50 text-stone-400 font-bold border-b border-stone-800">
              <th className="p-3 sm:p-4 pl-4 sm:pl-6 whitespace-nowrap">닉네임 (클릭시 메모)</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">현재 등급</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">가입일 / 경과</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">등업 상태</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">경고 스택</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">상태 / 메모</th>
              <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800 font-medium text-stone-300">
            {paginatedMembers.map((member) => {
              const daysJoined = getDaysSinceJoined(member.joined_at);
              const daysSincePromotion = getDaysSinceLastPromotion(member.joined_at, member.last_promoted_at);
              
              const promoInfo = getPromotionInfo(member.rank, member.custom_req_days);
              const isEligible = promoInfo && daysSincePromotion >= promoInfo.reqDays && !member.is_blacklisted;

              return (
                <tr key={member.id} className="hover:bg-stone-800/50 transition-colors">
                  <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                    <button onClick={() => setSelectedMember(member)} className="font-bold text-stone-100 hover:text-amber-400 underline decoration-dotted underline-offset-4 text-left flex items-center gap-1.5 group">
                      {member.nickname}
                      {member.discord_id && (
                        <span className="bg-[#5865F2] text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider ml-1">DC</span>
                      )}
                      <FileText className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors shrink-0" />
                    </button>
                  </td>
                  <td className="p-3 sm:p-4">
                    <select
                      value={member.rank}
                      onChange={(e) => onUpdateMember(member.id, { rank: e.target.value as GuildMember['rank'] })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border bg-stone-950 focus:outline-none cursor-pointer [color-scheme:dark] ${
                        member.rank === '새싹' ? 'text-emerald-400 border-emerald-500/30' :
                        member.rank === '밤콩' ? 'text-amber-400 border-amber-500/30' :
                        member.rank === '알밤콩' ? 'text-orange-400 border-orange-500/30' :
                        member.rank === '명예 밤콩' ? 'text-purple-400 border-purple-500/30' :
                        'text-yellow-400 border-yellow-500/30 shadow-[0_0_8px_rgba(234,179,8,0.2)]'
                      }`}
                    >
                      <option value="새싹">🌱 새싹</option>
                      <option value="밤콩">🫘 밤콩</option>
                      <option value="알밤콩">🌰 알밤콩</option>
                      <option value="명예 밤콩">👑 명예 밤콩</option>
                      <option value="부대장">⭐ 부대장</option>
                    </select>
                  </td>
                  <td className="p-3 sm:p-4 whitespace-nowrap">
                    <div className="text-stone-300">{member.joined_at}</div>
                    <div className="text-[11px] sm:text-xs text-stone-500 font-normal mt-0.5">총 {daysJoined}일 / 갱신 {daysSincePromotion}일</div>
                  </td>
                  <td className="p-3 sm:p-4 whitespace-nowrap">
                    {member.is_blacklisted ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">🚫 제명됨</span>
                    ) : isEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"><Clock className="w-3.5 h-3.5" /> 조건 충족</span>
                    ) : promoInfo ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-800 text-stone-400 border border-stone-700">대기 ({promoInfo.reqDays - daysSincePromotion}일 남음)</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> 최고 등급</span>
                    )}
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${member.warning_count >= 3 ? 'bg-rose-500 text-white font-black border-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : member.warning_count >= 2 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-stone-800 text-stone-400 border-stone-700'}`}>{member.warning_count} / 3</span>
                      <div className="flex gap-1">
                        <button onClick={() => onWarningChange(member.id, member.warning_count, 1)} className="w-6 h-6 flex items-center justify-center bg-stone-800 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 border border-stone-700 hover:border-rose-500/30 rounded text-sm transition-colors">+</button>
                        <button onClick={() => onWarningChange(member.id, member.warning_count, -1)} className="w-6 h-6 flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-400 border border-stone-700 rounded text-sm transition-colors">-</button>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 max-w-[150px] sm:max-w-[200px] truncate">
                    {member.is_blacklisted ? (
                      <span className="text-xs text-rose-400 font-medium">사유: {member.blacklist_reason || '미입력'}</span>
                    ) : member.is_on_break ? (
                      <span className="text-xs text-purple-400 font-medium">🌙 ~{member.break_end_date} 복귀</span>
                    ) : (
                      <span className="text-xs text-stone-500 truncate block">{member.memo || '-'}</span>
                    )}
                  </td>
                  <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">
                    {isEligible && promoInfo && (
                      <button onClick={() => onPromote(member.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20 border border-blue-500 whitespace-nowrap">
                        [{promoInfo.nextRank}] 승급
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredMembers.length === 0 && <div className="text-center py-16 text-stone-500 font-medium text-sm">일치하는 길드원이 없습니다.</div>}
      </div>

      {/* 📄 하단 페이지네이션 UI */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-stone-950/50 border-t border-stone-800">
          <p className="text-xs text-stone-500 font-medium">
            총 <span className="text-stone-300 font-bold">{filteredMembers.length}</span>명 중 <span className="text-stone-300 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-
            <span className="text-stone-300 font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)}</span>명 표시
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-400 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' 
                      : 'bg-stone-900 border border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-400 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSave={onUpdateMember}
          onDelete={onDeleteMember}
        />
      )}
    </div>
  );
}