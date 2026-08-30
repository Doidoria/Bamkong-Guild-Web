// app/admin/types.ts
export interface GuildMember {
  id: string;
  nickname: string;
  rank: '새싹' | '밤콩' | '알밤콩' | '명예 밤콩' | '부대장';
  joined_at: string;
  last_promoted_at?: string; // (최근 등업일)
  discord_id?: string;
  custom_req_days?: number | null;
  warning_count: number;
  is_on_break: boolean;
  break_start_date?: string;
  break_end_date?: string;
  memo?: string; // 상세 메모 (사유/히스토리)
  is_blacklisted?: boolean; // 블랙리스트 여부
  blacklist_reason?: string; // 제명 사유
  promotion_status: '등업 대기' | '조건 충족' | '등업 완료';
}

export interface AdminStatsData {
  totalMembers: number;
  newThisMonth: number;
  promotionCandidates: number;
  warningCount: number;
  breakCount: number;
}