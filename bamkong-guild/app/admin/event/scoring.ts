// app/admin/event/scoring.ts
/** 순위별 점수표 — 4등 이하는 임시값, 확정되면 여기만 수정 */
export const RANK_SCORES: Readonly<Record<number, number>> = { 1: 10, 2: 7, 3: 5, 4: 4, 5: 3, 6: 2 };
/** 표에 없는 순위(7등 이하) 참가 점수 */
export const DEFAULT_SCORE = 1;
export const ROUND_COUNT = 3;
export const MAX_PLACE = 100;
const ABSENT_RANK = MAX_PLACE;

/** memberId → 해당 라운드 순위 */
export type RoundRanks = Record<string, number>;

export interface ScoreboardData {
  names: Record<string, string>; // memberId → 저장 당시 닉네임
  rounds: Record<string, RoundRanks>; // "1" | "2" | "3"
  sentRounds: number[];
  finalSentAt: string | null;
}

export interface Standing {
  memberId: string;
  nickname: string;
  roundScores: (number | null)[]; // 불참 라운드는 null
  total: number;
  rankSum: number; // 동점 비교용: 라운드 순위 합 (작을수록 앞)
  place: number;
}



export const EMPTY_BOARD: ScoreboardData = { names: {}, rounds: {}, sentRounds: [], finalSentAt: null };

export function scoreForRank(rank: number): number {
  return RANK_SCORES[rank] ?? DEFAULT_SCORE;
}

/**
 * 1 ~ uptoRound 라운드 합산.
 * 정렬: 총점 높은 순 → 동점이면 라운드 순위 합 작은 순 → 그래도 같으면 공동 순위
 */
export function computeStandings(
  board: Pick<ScoreboardData, 'names' | 'rounds'>,
  uptoRound: number,
): Standing[] {
  const ids = new Set<string>();
  for (let r = 1; r <= uptoRound; r++) {
    Object.keys(board.rounds[r] ?? {}).forEach((id) => ids.add(id));
  }

  const rows: Standing[] = [...ids].map((memberId) => {
    const ranks = Array.from({ length: uptoRound }, (_, i) => board.rounds[i + 1]?.[memberId]);
    const roundScores = ranks.map((rank) => (rank ? scoreForRank(rank) : null));
    const total = roundScores.reduce<number>((sum, s) => sum + (s ?? 0), 0);
    const rankSum = ranks.reduce<number>((sum, rank) => sum + (rank ?? ABSENT_RANK), 0);
    return { memberId, nickname: board.names[memberId] ?? '(알 수 없음)', roundScores, total, rankSum, place: 0 };
  });

  rows.sort(
    (a, b) => b.total - a.total || a.rankSum - b.rankSum || a.nickname.localeCompare(b.nickname, 'ko'),
  );
  rows.forEach((row, i) => {
    const prev = rows[i - 1];
    row.place = prev && prev.total === row.total && prev.rankSum === row.rankSum ? prev.place : i + 1;
  });
  return rows;
}