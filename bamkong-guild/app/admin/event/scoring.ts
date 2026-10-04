// app/admin/event/scoring.ts
/** 순위별 점수표 */
export const RANK_SCORES: Readonly<Record<number, number>> = { 1: 10, 2: 7, 3: 5, 4: 4, 5: 3, 6: 2 };
/** 표에 없는 순위(7등 이하) 참가 점수 */
export const DEFAULT_SCORE = 1;
export const ROUND_COUNT = 3;
export const MAX_PLACE = 100;

/** 라운드별 세부 판 수 — 3R 퀴즈는 5판, 각 판 점수를 합산 */
export const SUB_ROUNDS: Readonly<Record<number, number>> = { 1: 1, 2: 1, 3: 5 };

/** memberId → 순위 */
export type RoundRanks = Record<string, number>;

export interface ScoreboardData {
  names: Record<string, string>; // memberId → 저장 당시 닉네임
  rounds: Record<string, RoundRanks>; // 슬롯 키: "1", "2", "3-1" ~ "3-5"
  sentRounds: number[];
  finalSentAt: string | null;
}

export interface Standing {
  memberId: string;
  nickname: string;
  roundScores: (number | null)[]; // 라운드별 점수 (세부 판 합산), 전부 불참이면 null
  total: number;
  rankSum: number; // 동점 비교용: 모든 판 순위 합 (작을수록 앞)
  place: number;
}

export interface RoundStanding {
  memberId: string;
  nickname: string;
  subScores: (number | null)[]; // 세부 판별 점수 (불참 null)
  total: number;
  rankSum: number;
  place: number;
}

export const EMPTY_BOARD: ScoreboardData = { names: {}, rounds: {}, sentRounds: [], finalSentAt: null };

/** 불참 판을 순위 합에 반영할 때 쓰는 값 (최하위 취급) */
const ABSENT_RANK = MAX_PLACE;

export function scoreForRank(rank: number): number {
  return RANK_SCORES[rank] ?? DEFAULT_SCORE;
}

export function subCount(round: number): number {
  return SUB_ROUNDS[round] ?? 1;
}

/** 세부 판이 1개인 라운드는 기존 키("1", "2") 유지 */
export function slotKeys(round: number): string[] {
  const n = subCount(round);
  return n > 1 ? Array.from({ length: n }, (_, i) => `${round}-${i + 1}`) : [String(round)];
}

function assignPlaces<T extends { total: number; rankSum: number; nickname: string; place: number }>(rows: T[]): T[] {
  rows.sort((a, b) => b.total - a.total || a.rankSum - b.rankSum || a.nickname.localeCompare(b.nickname, 'ko'));
  rows.forEach((row, i) => {
    const prev = rows[i - 1];
    row.place = prev && prev.total === row.total && prev.rankSum === row.rankSum ? prev.place : i + 1;
  });
  return rows;
}

function collectIds(board: Pick<ScoreboardData, 'rounds'>, rounds: number[]): string[] {
  const ids = new Set<string>();
  rounds.forEach((r) => slotKeys(r).forEach((key) => Object.keys(board.rounds[key] ?? {}).forEach((id) => ids.add(id))));
  return [...ids];
}

/** 한 라운드 안의 판별 점수와 합계 */
function scoreRound(board: Pick<ScoreboardData, 'rounds'>, round: number, memberId: string) {
  const subScores = slotKeys(round).map((key) => {
    const rank = board.rounds[key]?.[memberId];
    return rank ? scoreForRank(rank) : null;
  });
  const rankSum = slotKeys(round).reduce((sum, key) => sum + (board.rounds[key]?.[memberId] ?? ABSENT_RANK), 0);
  const entered = subScores.some((s) => s !== null);
  const total = subScores.reduce<number>((sum, s) => sum + (s ?? 0), 0);
  return { subScores, total: entered ? total : null, rankSum };
}

/** 1 ~ uptoRound 라운드 합산. 총점 → 순위 합 → 그래도 같으면 공동 순위 */
export function computeStandings(board: Pick<ScoreboardData, 'names' | 'rounds'>, uptoRound: number): Standing[] {
  const rounds = Array.from({ length: uptoRound }, (_, i) => i + 1);
  const rows: Standing[] = collectIds(board, rounds).map((memberId) => {
    const scored = rounds.map((r) => scoreRound(board, r, memberId));
    return {
      memberId,
      nickname: board.names[memberId] ?? '(알 수 없음)',
      roundScores: scored.map((s) => s.total),
      total: scored.reduce((sum, s) => sum + (s.total ?? 0), 0),
      rankSum: scored.reduce((sum, s) => sum + s.rankSum, 0),
      place: 0,
    };
  });
  return assignPlaces(rows);
}

/** 해당 라운드만의 순위 (라운드 결과 전송용) */
export function computeRoundStandings(board: Pick<ScoreboardData, 'names' | 'rounds'>, round: number): RoundStanding[] {
  const rows: RoundStanding[] = collectIds(board, [round]).map((memberId) => {
    const s = scoreRound(board, round, memberId);
    return {
      memberId,
      nickname: board.names[memberId] ?? '(알 수 없음)',
      subScores: s.subScores,
      total: s.total ?? 0,
      rankSum: s.rankSum,
      place: 0,
    };
  });
  return assignPlaces(rows);
}