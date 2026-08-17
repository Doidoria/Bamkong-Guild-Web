//app/admin/components/MemberDetailModal.tsx
"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Save, Moon, UserX, Trash2 } from "lucide-react";
import { GuildMember } from "../types";

interface Props {
  member: GuildMember;
  onClose: () => void;
  onSave: (id: string, updatedData: Partial<GuildMember>) => void;
  onDelete: (id: string) => void;
}

export default function MemberDetailModal({
  member,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [memo, setMemo] = useState(member.memo || "");
  const [isOnBreak, setIsOnBreak] = useState(member.is_on_break || false);
  const [breakEndDate, setBreakEndDate] = useState(member.break_end_date || "");
  const [isBlacklisted, setIsBlacklisted] = useState(
    member.is_blacklisted || false,
  );
  const [blacklistReason, setBlacklistReason] = useState(
    member.blacklist_reason || "",
  );
  const [nickname, setNickname] = useState(member.nickname || "");
  const [rank, setRank] = useState<GuildMember["rank"]>(member.rank || "새싹");
  const [customReqDays, setCustomReqDays] = useState<number | string>(
    member.custom_req_days ?? "",
  );

  const handleSave = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const isRankChanged = rank !== member.rank;

    onSave(member.id, {
      nickname,
      rank,
      custom_req_days: customReqDays !== '' ? Number(customReqDays) : null,
      memo,
      is_on_break: isOnBreak,
      break_end_date: isOnBreak ? breakEndDate : "",
      is_blacklisted: isBlacklisted,
      blacklist_reason: isBlacklisted ? blacklistReason : "",
      ...(isRankChanged && { last_promoted_at: todayStr }),
    });
    onClose();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `정말 [${member.nickname}] 님의 모든 데이터를 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      )
    ) {
      onDelete(member.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-[2rem] max-w-lg w-full p-6 md:p-8 shadow-2xl text-stone-200 relative animate-fadeIn">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-500 hover:text-stone-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-black text-stone-100 flex items-center gap-2 mb-1">
          <span>🌰</span> {member.nickname} 런너님 정보
        </h3>
        <p className="text-xs text-stone-500 font-medium mb-6">
          가입일: {member.joined_at} | 현재 등급: {member.rank}
        </p>

        <div className="space-y-6">
          {/* ✏️ 닉네임 및 등급 수동 변경 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 mb-2">
                테런 닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-2">
                길드 등급 선택
              </label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as GuildMember["rank"])}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none font-bold cursor-pointer [color-scheme:dark]"
              >
                <option value="새싹">🌱 새싹</option>
                <option value="밤콩">🫘 밤콩</option>
                <option value="알밤콩">🌰 알밤콩</option>
                <option value="명예 밤콩">👑 명예 밤콩</option>
                <option value="부대장">⭐ 부대장</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-2">
                필요 대기일 수동 지정 (일)
              </label>
              <input
                type="number"
                placeholder="기본값 사용시 비워둠"
                value={customReqDays}
                onChange={(e) => setCustomReqDays(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none font-bold placeholder-stone-600"
              />
            </div>
          </div>
          {/* 📝 상세 메모 영역 */}
          <div>
            <label className="block text-xs font-bold text-stone-400 mb-2">
              상세 관리 메모 (특이사항/경고 사유)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 8/17 길드 퀘스트 미참석 사유 전달받음, 채팅 언행 주의 1회"
              rows={3}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none font-medium"
            />
          </div>

          {/* 🌙 휴식 / 잠수 일정 관리 */}
          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Moon className="w-4 h-4" /> 휴식(잠수) 상태 설정
              </span>
              <input
                type="checkbox"
                checked={isOnBreak}
                onChange={(e) => setIsOnBreak(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>
            {isOnBreak && (
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">
                  복귀 예정일
                </label>
                <input
                  type="date"
                  value={breakEndDate}
                  onChange={(e) => setBreakEndDate(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 text-stone-300 text-xs p-2 rounded-lg [color-scheme:dark]"
                />
              </div>
            )}
          </div>

          {/* 🚫 블랙리스트(영구 제명) 등록 switch */}
          <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <UserX className="w-4 h-4" /> 블랙리스트 (영구 제명)
              </span>
              <input
                type="checkbox"
                checked={isBlacklisted}
                onChange={(e) => setIsBlacklisted(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
            </div>
            {isBlacklisted && (
              <div>
                <label className="block text-[11px] text-rose-400/80 mb-1">
                  제명/차단 사유
                </label>
                <input
                  type="text"
                  placeholder="예: 과도한 친목 저해 및 욕설로 인한 강퇴"
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  className="w-full bg-stone-950 border border-rose-900/40 text-stone-200 text-xs p-2 rounded-lg focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="mt-8 flex justify-between items-center">
          {/* 삭제 버튼 (왼쪽) */}
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> 데이터 삭제
          </button>

          {/* 취소/저장 버튼 (오른쪽) */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-bold rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> 저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
