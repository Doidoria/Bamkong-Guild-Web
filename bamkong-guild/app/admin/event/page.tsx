// app/admin/event/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Check, RefreshCw, RotateCcw, Save, Search, Send, Shuffle, Trophy } from 'lucide-react';
import { mainEvent } from '@/app/events/data/eventData';
import {
  loadScoreboard, resetScoreboard, saveRound, sendFinalResult, type EventParticipant,
} from './actions';
import {
  EMPTY_BOARD, ROUND_COUNT, computeStandings, scoreForRank, slotKeys,
  type RoundRanks, type ScoreboardData,
} from './scoring';

/** 슬롯 키("1", "3-2" …) → memberId → 입력 중인 문자열 */
type Drafts = Record<string, Record<string, string>>;
const ROUND_NUMBERS = Array.from({ length: ROUND_COUNT }, (_, i) => i + 1);
const ALL_SLOT_KEYS = ROUND_NUMBERS.flatMap(slotKeys);
const RESET_KEYWORD = '초기화';

/** 테스트용 임의값 버튼은 로컬(npm run dev)에서만 표시 */
const IS_DEV = process.env.NODE_ENV !== 'production';

function toDrafts(board: ScoreboardData): Drafts {
  return Object.fromEntries(
    ALL_SLOT_KEYS.map((key) => [
      key,
      Object.fromEntries(Object.entries(board.rounds[key] ?? {}).map(([id, rank]) => [id, String(rank)])),
    ]),
  );
}

function parseDraft(draft: Record<string, string> = {}): RoundRanks {
  const out: RoundRanks = {};
  for (const [id, value] of Object.entries(draft)) {
    const n = Number(value);
    if (value !== '' && Number.isInteger(n) && n > 0) out[id] = n;
  }
  return out;
}

function sameRanks(a: RoundRanks, b: RoundRanks = {}): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
}

/** 같은 순위를 여러 명이 가진 경우 (공동 순위 확인용) */
function findDuplicates(ranks: RoundRanks): Set<number> {
  const count = new Map<number, number>();
  Object.values(ranks).forEach((r) => count.set(r, (count.get(r) ?? 0) + 1));
  return new Set([...count].filter(([, c]) => c > 1).map(([r]) => r));
}

/** 테스트용: 모든 라운드·판에 임의 순위 입력 (약 10%는 불참) */
function randomDrafts(participants: EventParticipant[]): Drafts {
  return Object.fromEntries(
    ALL_SLOT_KEYS.map((key) => {
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const present = shuffled.filter(() => Math.random() >= 0.1);
      return [key, Object.fromEntries(present.map((p, i) => [p.id, String(i + 1)]))];
    }),
  );
}

export default function EventScorePage() {
  const event = mainEvent;
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [board, setBoard] = useState<ScoreboardData>(EMPTY_BOARD);
  const [drafts, setDrafts] = useState<Drafts>({});
  const [round, setRound] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const load = useCallback(async () => {
    if (!event) return;
    setRefreshing(true);
    const result = await loadScoreboard(event.id);
    if (result.ok) {
      setParticipants(result.data.participants);
      setBoard(result.data.board);
      setDrafts(toDrafts(result.data.board));
    } else {
      toast.error(result.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, [event]);

  useEffect(() => {
    load();
  }, [load]);

  const dirtyRounds = useMemo(
    () =>
      ROUND_NUMBERS.filter((r) =>
        slotKeys(r).some((key) => !sameRanks(parseDraft(drafts[key]), board.rounds[key])),
      ),
    [drafts, board.rounds],
  );

  // 저장 안 한 입력이 있으면 새로고침·탭 닫기 시 브라우저 경고
  useEffect(() => {
    if (dirtyRounds.length === 0) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyRounds.length]);

  const currentKeys = useMemo(() => slotKeys(round), [round]);
  const isMulti = currentKeys.length > 1;

  /** 현재 라운드의 판별 순위 (1·2R은 1개, 3R은 5개) */
  const currentRanks = useMemo(() => currentKeys.map((key) => parseDraft(drafts[key])), [currentKeys, drafts]);
  const duplicateRanks = useMemo(() => currentRanks.map(findDuplicates), [currentRanks]);

  const enteredCount = useMemo(
    () => participants.filter((p) => currentRanks.some((ranks) => ranks[p.id] !== undefined)).length,
    [participants, currentRanks],
  );

  const preview = useMemo(() => {
    const names = { ...board.names, ...Object.fromEntries(participants.map((p) => [p.id, p.nickname])) };
    const rounds = Object.fromEntries(ALL_SLOT_KEYS.map((key) => [key, parseDraft(drafts[key])]));
    return computeStandings({ names, rounds }, ROUND_COUNT);
  }, [board.names, participants, drafts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? participants.filter((p) => p.nickname.toLowerCase().includes(q)) : participants;
  }, [participants, query]);

  const setRank = (slotKey: string, memberId: string, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 3);
    setDrafts((prev) => ({ ...prev, [slotKey]: { ...prev[slotKey], [memberId]: digits } }));
  };

  /** Enter → 같은 판의 다음 사람, Shift+Enter → 이전 사람 */
  const handleRankKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const col = e.currentTarget.dataset.col;
    const inputs = Array.from(
      listRef.current?.querySelectorAll<HTMLInputElement>(`input[data-rank-input][data-col="${col}"]`) ?? [],
    );
    const index = inputs.indexOf(e.currentTarget);
    const next = inputs[index + (e.shiftKey ? -1 : 1)];
    next?.focus();
    next?.select();
  };

  const handleRefresh = () => {
    if (dirtyRounds.length && !confirm('저장하지 않은 입력이 사라집니다. 새로고침할까요?')) return;
    load();
  };

  const handleReset = async () => {
    if (!event) return;
    const typed = prompt(
      `모든 라운드 점수와 전송 기록이 삭제되고 되돌릴 수 없습니다.\n계속하려면 "${RESET_KEYWORD}"를 입력하세요.`,
    );
    if (typed === null) return;
    if (typed.trim() !== RESET_KEYWORD) {
      toast.error('입력이 일치하지 않아 취소했습니다.');
      return;
    }
    setBusy(true);
    const result = await resetScoreboard(event.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setBoard(result.data);
    setDrafts(toDrafts(result.data));
    setRound(1);
    toast.success('점수판을 초기화했습니다.');
  };

  const handleFillRandom = () => {
    if (participants.length === 0) {
      toast.error('참가 대상이 없습니다.');
      return;
    }
    if (!confirm('모든 라운드의 입력칸을 임의 순위로 덮어씁니다. (저장 전까지 DB에는 반영되지 않음)')) return;
    setDrafts(randomDrafts(participants));
    toast.success('임의 순위를 채웠습니다. 라운드별로 [저장]해야 반영돼요.');
  };

  const handleSave = async (send: boolean) => {
    if (!event) return;
    if (send) {
      const message = board.sentRounds.includes(round)
        ? `${round}라운드 결과는 이미 전송했습니다. 수정된 결과를 다시 전송할까요?`
        : `${round}라운드 결과를 디스코드에 전송할까요?`;
      if (!confirm(message)) return;
    }
    setBusy(true);
    const result = await saveRound(event.id, round, currentRanks, send);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setBoard(result.data);
    toast.success(send ? `${round}라운드 결과를 전송했습니다! 📢` : `${round}라운드를 저장했습니다.`);
  };

  const handleFinal = async () => {
    if (!event) return;
    if (dirtyRounds.length) {
      toast.error(`${dirtyRounds.join(', ')}라운드에 저장하지 않은 입력이 있습니다.`);
      return;
    }
    const message = board.finalSentAt
      ? '최종 결과를 이미 전송했습니다. 다시 전송할까요?'
      : '최종 결과를 디스코드에 전송할까요?';
    if (!confirm(message)) return;
    setBusy(true);
    const result = await sendFinalResult(event.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setBoard(result.data);
    toast.success('최종 결과를 전송했습니다! 🏆');
  };

  if (!event) {
    return <div className="min-h-screen bg-stone-950 p-10 text-stone-400">진행 중인 이벤트가 없습니다.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center font-black text-amber-500">
        점수판을 불러오는 중... 🌰
      </div>
    );
  }

  const roundInfo = event.rounds[round - 1];

  return (
    <div className="min-h-screen lg:h-dvh lg:overflow-hidden bg-stone-950 p-4 sm:p-6 lg:p-8 font-sans text-stone-300 flex flex-col">
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-5 flex-1 min-h-0">
        {/* 헤더 */}
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-stone-800 pb-4">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-300 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> 관리자 대시보드
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-stone-100">
              <span className="text-amber-500">🏆</span> {event.title} 점수판
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              순위 입력(Enter로 다음 사람) → 저장 → 라운드 종료 시 결과 전송. 비워 두면 불참(0점)입니다.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {IS_DEV && (
              <button
                onClick={handleFillRandom}
                disabled={busy || refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold rounded-xl border border-sky-500/30 transition-colors disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4" /> 임의값
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={busy || refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 font-bold rounded-xl border border-stone-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 새로고침
            </button>
            <button
              onClick={handleReset}
              disabled={busy || refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl border border-rose-500/30 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> 초기화
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:grid-rows-[minmax(0,1fr)] flex-1 min-h-0">
          {/* 라운드 입력 */}
          <section className="flex flex-col min-h-0 bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="shrink-0 flex border-b border-stone-800">
              {ROUND_NUMBERS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRound(r)}
                  className={`flex-1 py-3 text-sm font-black flex items-center justify-center gap-1.5 transition-colors ${
                    round === r
                      ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500'
                      : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  {r}R
                  {board.sentRounds.includes(r) && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {dirtyRounds.includes(r) && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </button>
              ))}
            </div>

            <div className="shrink-0 p-4 space-y-3">
              <div className="text-sm font-bold text-stone-200">
                {roundInfo?.title}
                {isMulti && <span className="ml-2 text-xs text-amber-400">({currentKeys.length}판 합산)</span>}
                <span className="ml-2 text-xs text-stone-500">
                  입력 {enteredCount} / {participants.length}명
                </span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="닉네임 검색"
                  className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <ul
              ref={listRef}
              className={`score-scroll flex-1 min-h-0 max-h-[60vh] lg:max-h-none overflow-y-auto border-t border-stone-800 p-3 grid gap-2 content-start ${
                isMulti ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {/* 다판 라운드: 판 번호 헤더 */}
              {isMulti && filtered.length > 0 && (
                <li className="flex items-center gap-2 px-3 text-[11px] font-bold text-stone-500">
                  <span className="flex-1">닉네임</span>
                  {currentKeys.map((key, i) => (
                    <span key={key} className="w-12 text-center">{i + 1}판</span>
                  ))}
                  <span className="w-12 text-right">합계</span>
                </li>
              )}

              {filtered.map((p) => {
                if (isMulti) {
                  const subRanks = currentRanks.map((ranks) => ranks[p.id]);
                  const entered = subRanks.some((r) => r !== undefined);
                  const total = subRanks.reduce<number>((sum, r) => sum + (r !== undefined ? scoreForRank(r) : 0), 0);
                  return (
                    <li
                      key={p.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors focus-within:border-amber-500/70 ${
                        entered ? 'bg-amber-500/5 border-amber-500/25' : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <span className={`flex-1 min-w-0 truncate font-bold ${entered ? 'text-stone-100' : 'text-stone-400'}`}>
                        {p.nickname}
                      </span>
                      {currentKeys.map((key, i) => {
                        const rank = subRanks[i];
                        const dup = rank !== undefined && duplicateRanks[i].has(rank);
                        return (
                          <input
                            key={key}
                            data-rank-input
                            data-col={i}
                            inputMode="numeric"
                            enterKeyHint="next"
                            title={rank !== undefined ? `+${scoreForRank(rank)}점${dup ? ' (공동)' : ''}` : '불참'}
                            value={drafts[key]?.[p.id] ?? ''}
                            onChange={(e) => setRank(key, p.id, e.target.value)}
                            onKeyDown={handleRankKeyDown}
                            onFocus={(e) => e.currentTarget.select()}
                            placeholder="-"
                            className={`shrink-0 w-12 px-1 py-1.5 bg-stone-950 border rounded-lg text-center text-sm focus:outline-none focus:border-amber-500 ${
                              dup ? 'border-sky-500/60 text-sky-300' : 'border-stone-700'
                            }`}
                          />
                        );
                      })}
                      <span className="shrink-0 w-12 text-right text-sm font-black text-amber-400">
                        {entered ? `+${total}` : ''}
                      </span>
                    </li>
                  );
                }

                const key = currentKeys[0];
                const rank = currentRanks[0][p.id];
                const entered = rank !== undefined;
                return (
                  <li
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors focus-within:border-amber-500/70 ${
                      entered ? 'bg-amber-500/5 border-amber-500/25' : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span className={`flex-1 min-w-0 truncate font-bold ${entered ? 'text-stone-100' : 'text-stone-400'}`}>
                      {p.nickname}
                    </span>
                    {entered && duplicateRanks[0].has(rank) && (
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">공동</span>
                    )}
                    <span className="shrink-0 w-8 text-right text-xs font-bold text-amber-400">
                      {entered ? `+${scoreForRank(rank)}` : ''}
                    </span>
                    <input
                      data-rank-input
                      data-col={0}
                      inputMode="numeric"
                      enterKeyHint="next"
                      value={drafts[key]?.[p.id] ?? ''}
                      onChange={(e) => setRank(key, p.id, e.target.value)}
                      onKeyDown={handleRankKeyDown}
                      onFocus={(e) => e.currentTarget.select()}
                      placeholder="불참"
                      className="shrink-0 w-14 px-2 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-center text-sm focus:outline-none focus:border-amber-500"
                    />
                    <span className="shrink-0 text-xs text-stone-500">위</span>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="col-span-full px-4 py-6 text-center text-sm text-stone-500">참가 대상이 없습니다.</li>
              )}
            </ul>

            <div className="shrink-0 flex gap-2 p-4 border-t border-stone-800">
              <button
                onClick={() => handleSave(false)}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> 저장
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> 저장 + {round}R 결과 전송
              </button>
            </div>
          </section>

          {/* 합산 미리보기 */}
          <section className="flex flex-col min-h-0 bg-stone-900 border border-stone-800 rounded-2xl p-4 gap-3">
            <h2 className="shrink-0 font-black text-stone-100">현재 합산 (미리보기)</h2>
            <ol className="score-scroll flex-1 min-h-0 max-h-[50vh] lg:max-h-none overflow-y-auto space-y-1 text-sm pr-1">
              {preview.map((s) => (
                <li key={s.memberId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-stone-950/60">
                  <span className="w-7 text-center font-black text-amber-500">{s.place}</span>
                  <span className="flex-1 truncate font-bold text-stone-200">{s.nickname}</span>
                  <span className="text-xs text-stone-500">{s.roundScores.map((v) => v ?? '-').join(' / ')}</span>
                  <span className="w-10 text-right font-black text-stone-100">{s.total}</span>
                </li>
              ))}
              {preview.length === 0 && <li className="text-stone-500 text-center py-4">아직 입력된 순위가 없습니다.</li>}
            </ol>
            <button
              onClick={handleFinal}
              disabled={busy}
              className="shrink-0 w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black rounded-xl border border-emerald-500/30 transition-colors disabled:opacity-50"
            >
              <Trophy className="w-4 h-4" />
              {board.finalSentAt ? '최종 결과 다시 전송' : '최종 결과 전송'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}