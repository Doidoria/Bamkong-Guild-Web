//app/admin/components/AdminMemberTable.tsx
import React, { useState } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  UserX,
  FileText,
  Download,
} from "lucide-react";
import { getDaysSinceJoined, getDaysSinceLastPromotion, getPromotionInfo } from '../utils';
import { GuildMember, AdminStatsData } from "../types";
import MemberDetailModal from "./MemberDetailModal";

interface Props {
  members: GuildMember[];
  stats: AdminStatsData;
  onPromote: (id: string) => void;
  onWarningChange: (id: string, currentWarning: number, delta: number) => void;
  onUpdateMember: (id: string, updatedData: Partial<GuildMember>) => void;
  onDeleteMember: (id: string) => void;
}

export default function AdminMemberTable({
  members,
  stats,
  onPromote,
  onWarningChange,
  onUpdateMember,
  onDeleteMember,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "all" | "promotions" | "warnings" | "breaks" | "blacklists"
  >("all");
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(
    null,
  );

  // 📊 엑셀 (CSV) 파일 다운로드 내보내기 함수
  const handleExportCSV = () => {
    if (members.length === 0) {
      alert("백업할 길드원 데이터가 없습니다. 🌰");
      return;
    }

    // 엑셀에서 한글 깨짐을 방지하기 위한 UTF-8 BOM (\uFEFF)
    const headers = [
      "닉네임",
      "현재 등급",
      "가입일",
      "활동 기간",
      "등업 상태",
      "경고 횟수",
      "휴식 여부",
      "복귀 예정일",
      "관리 메모",
      "블랙리스트 여부",
      "제명 사유",
    ];

    const rows = members.map((m) => {
      const daysJoined = getDaysSinceJoined(m.joined_at);
      const promotionText = m.is_blacklisted
        ? "제명"
        : m.rank === "새싹" && daysJoined >= 30
          ? "조건 충족"
          : m.promotion_status;

      return [
        `"${m.nickname}"`,
        `"${m.rank}"`,
        `"${m.joined_at}"`,
        `"${daysJoined}일 차"`,
        `"${promotionText}"`,
        `"${m.warning_count}"`,
        `"${m.is_on_break ? "휴식 중" : "활동 중"}"`,
        `"${m.break_end_date || "-"}"`,
        `"${(m.memo || "").replace(/"/g, '""')}"`,
        `"${m.is_blacklisted ? "Y" : "N"}"`,
        `"${(m.blacklist_reason || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const todayStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `밤콩길드_명단백업_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.nickname
      .toLowerCase()
      .includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedTab === "blacklists") return m.is_blacklisted;
    if (m.is_blacklisted) return false;

    if (selectedTab === 'promotions') {
      const promoInfo = getPromotionInfo(m.rank, m.custom_req_days);
      return promoInfo && getDaysSinceLastPromotion(m.joined_at, m.last_promoted_at) >= promoInfo.reqDays;
    }
    if (selectedTab === "warnings") return m.warning_count >= 2;
    if (selectedTab === "breaks") return m.is_on_break;
    return true;
  });

  const blacklistCount = members.filter((m) => m.is_blacklisted).length;

  return (
    <div className="bg-stone-900 rounded-2xl shadow-xl shadow-black/20 border border-stone-800 overflow-hidden">
      {/* 탭 버튼 및 검색/CSV 헤더 */}
      <div className="p-6 border-b border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* 탭 필터 버튼들 */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedTab === "all" ? "bg-amber-600 text-white" : "bg-stone-800 text-stone-400 hover:bg-stone-700"}`}
          >
            전체 ({members.length - blacklistCount})
          </button>
          <button
            onClick={() => setSelectedTab("promotions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedTab === "promotions" ? "bg-blue-600 text-white" : "bg-stone-800 text-stone-400 hover:bg-stone-700"}`}
          >
            등업 대상 ({stats.promotionCandidates})
          </button>
          <button
            onClick={() => setSelectedTab("warnings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedTab === "warnings" ? "bg-rose-600 text-white" : "bg-stone-800 text-stone-400 hover:bg-stone-700"}`}
          >
            경고 주의 ({stats.warningCount})
          </button>
          <button
            onClick={() => setSelectedTab("breaks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedTab === "breaks" ? "bg-purple-600 text-white" : "bg-stone-800 text-stone-400 hover:bg-stone-700"}`}
          >
            휴식 중 ({stats.breakCount})
          </button>
          <button
            onClick={() => setSelectedTab("blacklists")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTab === "blacklists" ? "bg-red-950 border border-red-600 text-red-400" : "bg-stone-800 text-stone-500 hover:bg-stone-700"}`}
          >
            <UserX className="w-3.5 h-3.5" /> 블랙리스트 ({blacklistCount})
          </button>
        </div>

        {/* 오른쪽 툴바 (검색창 + CSV 다운로드 버튼) */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="닉네임 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium transition-all"
            />
          </div>

          {/* 📥 엑셀 CSV 내보내기 버튼 */}
          <button
            onClick={handleExportCSV}
            title="현재 명단을 엑셀(CSV)로 다운로드"
            className="px-3.5 py-2 bg-stone-800 hover:bg-emerald-600/20 text-stone-300 hover:text-emerald-400 border border-stone-700 hover:border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV 백업</span>
          </button>
        </div>
      </div>

      {/* 명단 테이블 본문 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-stone-950/50 text-stone-400 font-bold border-b border-stone-800">
              <th className="p-4 pl-6">닉네임 (클릭시 메모)</th>
              <th className="p-4">현재 등급</th>
              <th className="p-4">가입일 / 경과</th>
              <th className="p-4">등업 상태</th>
              <th className="p-4">경고 스택</th>
              <th className="p-4">상태 / 메모</th>
              <th className="p-4 pr-6 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800 font-medium text-stone-300">
            {filteredMembers.map((member) => {
              const daysJoined = getDaysSinceJoined(member.joined_at);
              const daysSincePromotion = getDaysSinceLastPromotion(member.joined_at, member.last_promoted_at);
              const promoInfo = getPromotionInfo(member.rank, member.custom_req_days);
              const isEligible = promoInfo && daysSincePromotion >= promoInfo.reqDays && !member.is_blacklisted;

              return (
                <tr
                  key={member.id}
                  className="hover:bg-stone-800/50 transition-colors"
                >
                  <td className="p-4 pl-6">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="font-bold text-stone-100 hover:text-amber-400 underline decoration-dotted underline-offset-4 text-left flex items-center gap-1.5 group"
                    >
                      {member.nickname}
                      <FileText className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                    </button>
                  </td>

                  <td className="p-4">
                    <select
                      value={member.rank}
                      onChange={(e) =>
                        onUpdateMember(member.id, {
                          rank: e.target.value as GuildMember["rank"],
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border bg-stone-950 focus:outline-none cursor-pointer [color-scheme:dark] ${
                        member.rank === "새싹"
                          ? "text-emerald-400 border-emerald-500/30"
                          : member.rank === "밤콩"
                            ? "text-amber-400 border-amber-500/30"
                            : member.rank === "알밤콩"
                              ? "text-orange-400 border-orange-500/30"
                              : "text-purple-400 border-purple-500/30"
                      }`}
                    >
                      <option value="새싹">🌱 새싹</option>
                      <option value="밤콩">🫘 밤콩</option>
                      <option value="알밤콩">🌰 알밤콩</option>
                      <option value="명예 밤콩">🏅·🌰 명예 밤콩</option>
                      <option value="부대장">🌟 부대장</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <div className="text-stone-300">{member.joined_at}</div>
                    <div className="text-xs text-stone-500 font-normal mt-0.5">
                      총 {daysJoined}일 / 갱신 {daysSincePromotion}일
                    </div>
                  </td>

                  <td className="p-4">
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

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold border ${member.warning_count >= 3 ? "bg-rose-500 text-white font-black border-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : member.warning_count >= 2 ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-stone-800 text-stone-400 border-stone-700"}`}
                      >
                        {member.warning_count} / 3
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            onWarningChange(member.id, member.warning_count, 1)
                          }
                          className="px-1.5 py-0.5 bg-stone-800 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 border border-stone-700 hover:border-rose-500/30 rounded text-xs transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            onWarningChange(member.id, member.warning_count, -1)
                          }
                          className="px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-400 border border-stone-700 rounded text-xs transition-colors"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 max-w-[200px] truncate">
                    {member.is_blacklisted ? (
                      <span className="text-xs text-rose-400 font-medium">
                        사유: {member.blacklist_reason || "미입력"}
                      </span>
                    ) : member.is_on_break ? (
                      <span className="text-xs text-purple-400 font-medium">
                        🌙 ~{member.break_end_date} 복귀
                      </span>
                    ) : (
                      <span className="text-xs text-stone-500 truncate block">
                        {member.memo || "-"}
                      </span>
                    )}
                  </td>

                  <td className="p-4 pr-6 text-right">
                    {isEligible && promoInfo && (
                      <button onClick={() => onPromote(member.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20 border border-blue-500">
                        [{promoInfo.nextRank}] 승급
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredMembers.length === 0 && (
          <div className="text-center py-16 text-stone-500 font-medium">
            일치하는 길드원이 없습니다.
          </div>
        )}
      </div>

      {/* 상세 메모 모달 */}
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
