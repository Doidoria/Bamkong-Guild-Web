// app/admin/event/actions.ts
'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { getAdminSession } from '@/app/lib/auth';
import { postDiscordWebhook, escapeDiscordMarkdown, type DiscordEmbed } from '@/app/lib/discordWebhook';
import { getEventById, type GuildEvent } from '@/app/events/data/eventData';
import {
  EMPTY_BOARD, MAX_PLACE, ROUND_COUNT, computeStandings, scoreForRank,
  type RoundRanks, type ScoreboardData, type Standing,
} from './scoring';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

export interface EventParticipant {
  id: string;
  nickname: string;
}

const COLLECTION = 'event_scores';
const MAX_DESCRIPTION = 3900; // 디스코드 embed description 제한 4096
const COLOR = 16100911;
const MEDALS = ['🥇', '🥈', '🥉'] as const;

class ValidationError extends Error {}

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    if (!(await getAdminSession())) return { ok: false, message: '관리자 권한이 없습니다.' };
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof ValidationError) return { ok: false, message: error.message };
    console.error('[event action]', error);
    return { ok: false, message: '처리 중 오류가 발생했습니다.' };
  }
}

function getEventOrThrow(eventId: string): GuildEvent {
  const event = typeof eventId === 'string' ? getEventById(eventId) : undefined;
  if (!event) throw new ValidationError('이벤트를 찾을 수 없습니다.');
  return event;
}

function getWebhookUrl(): string {
  const url = process.env.EVENT_WEBHOOK_URL;
  if (!url) throw new ValidationError('EVENT_WEBHOOK_URL이 설정되지 않았습니다.');
  return url;
}

function boardRef(eventId: string) {
  return getAdminDb().collection(COLLECTION).doc(eventId);
}

function toBoard(data?: Partial<ScoreboardData>): ScoreboardData {
  return {
    names: data?.names ?? {},
    rounds: data?.rounds ?? {},
    sentRounds: data?.sentRounds ?? [],
    finalSentAt: data?.finalSentAt ?? null,
  };
}

/** 참가 자격: eventData의 제외 등급이 아니고 블랙리스트가 아닌 길드원 */
async function listEligible(event: GuildEvent): Promise<EventParticipant[]> {
  const excluded = event.eligibility?.excludedGrades ?? [];
  const snap = await getAdminDb().collection('members').select('nickname', 'rank', 'is_blacklisted').get();
  return snap.docs
    .filter((d) => d.get('is_blacklisted') !== true && !excluded.includes(String(d.get('rank'))))
    .map((d) => ({ id: d.id, nickname: String(d.get('nickname') ?? '') }))
    .sort((a, b) => a.nickname.localeCompare(b.nickname, 'ko'));
}

function validRound(round: unknown): number {
  if (!Number.isInteger(round) || (round as number) < 1 || (round as number) > ROUND_COUNT) {
    throw new ValidationError('잘못된 라운드입니다.');
  }
  return round as number;
}

function validRanks(input: unknown, eligible: Map<string, string>): RoundRanks {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new ValidationError('잘못된 요청입니다.');
  }
  const out: RoundRanks = {};
  for (const [id, rank] of Object.entries(input)) {
    if (!eligible.has(id)) throw new ValidationError('참가 자격이 없는 길드원이 포함되어 있습니다.');
    if (!Number.isInteger(rank) || (rank as number) < 1 || (rank as number) > MAX_PLACE) {
      throw new ValidationError(`${eligible.get(id)} 님의 순위가 올바르지 않습니다.`);
    }
    out[id] = rank as number;
  }
  return out;
}

// ───────────── 디스코드 메시지 ─────────────

function placeLabel(place: number): string {
  return MEDALS[place - 1] ?? `${place}위`;
}

function bold(s: Standing): string {
  return `**${escapeDiscordMarkdown(s.nickname)}**`;
}

function joinLines(lines: string[]): string {
  let out = '';
  for (let i = 0; i < lines.length; i++) {
    if (out.length + lines[i].length + 1 > MAX_DESCRIPTION) return `${out}\n… 외 ${lines.length - i}명`;
    out += (out ? '\n' : '') + lines[i];
  }
  return out || '아직 점수가 없습니다.';
}

/** 라운드 결과: 해당 라운드의 순위와 획득 점수만 (누적 합산은 최종 결과에서 공개) */
function buildRoundEmbed(event: GuildEvent, round: number, board: ScoreboardData): DiscordEmbed {
  const entries = Object.entries(board.rounds[round] ?? {})
    .map(([id, rank]) => ({ rank, nickname: board.names[id] ?? '(알 수 없음)' }))
    .sort((a, b) => a.rank - b.rank || a.nickname.localeCompare(b.nickname, 'ko'));

  const lines = entries.map(
    (e) => `${placeLabel(e.rank)} **${escapeDiscordMarkdown(e.nickname)}** — +${scoreForRank(e.rank)}점`,
  );

  const isLastRound = round === ROUND_COUNT;
  return {
    title: `${round}라운드 결과`,
    description: `**${round}R · ${event.rounds[round - 1]?.title ?? ''}**\n\n${joinLines(lines)}`,
    color: COLOR,
    footer: {
      text: isLastRound
        ? `${event.title} · 곧 최종 합산 결과가 공개돼요! 🏆`
        : `${event.title} · ${round}/${ROUND_COUNT} 라운드 · 합산 결과는 마지막에 공개!`,
    },
    timestamp: new Date().toISOString(),
  };
}

function buildFinalEmbed(event: GuildEvent, standings: Standing[]): DiscordEmbed {
  const lines = standings.map(
    (s) => `${placeLabel(s.place)} ${bold(s)} — **${s.total}점** (${s.roundScores.map((v) => v ?? 0).join(' + ')})`,
  );

  const rewardLines = event.rewards.map((r) => {
    const winners = standings.filter((s) => s.place === r.rank);
    return `${MEDALS[r.rank - 1]} ${winners.length ? winners.map(bold).join(', ') : '해당 없음'} — ${r.prize}`;
  });

  const lastPlace = standings[standings.length - 1]?.place;
  const losers = standings.filter((s) => s.place === lastPlace);
  const penaltyValue = losers.length
    ? `${losers.map(bold).join(', ')}${losers.length > 1 ? ' (동점 — 당일 결정)' : ''}\n${event.penalty.content}`
    : '-';

  return {
    title: `🏆 ${event.title} 최종 결과`,
    description: joinLines(lines),
    color: COLOR,
    fields: [
      { name: '🎁 보상', value: rewardLines.join('\n') },
      { name: `😈 벌칙 (${event.penalty.target})`, value: penaltyValue },
    ],
    footer: { text: '테일즈런너 밤콩 길드 웹 시스템' },
    timestamp: new Date().toISOString(),
  };
}

// ───────────── 액션 ─────────────

export async function loadScoreboard(
  eventId: string,
): Promise<ActionResult<{ participants: EventParticipant[]; board: ScoreboardData }>> {
  return run(async () => {
    const event = getEventOrThrow(eventId);
    const [participants, snap] = await Promise.all([listEligible(event), boardRef(event.id).get()]);
    return { participants, board: toBoard(snap.data() as Partial<ScoreboardData> | undefined) };
  });
}

/** 라운드 순위 저장. send=true면 저장된 값 기준으로 해당 라운드까지 합산해 전송 */
export async function saveRound(
  eventId: string,
  round: number,
  ranks: RoundRanks,
  send: boolean,
): Promise<ActionResult<ScoreboardData>> {
  return run(async () => {
    const event = getEventOrThrow(eventId);
    const r = validRound(round);
    const eligible = new Map((await listEligible(event)).map((p) => [p.id, p.nickname]));
    const clean = validRanks(ranks, eligible);
    const webhookUrl = send ? getWebhookUrl() : null;
    if (send && Object.keys(clean).length === 0) throw new ValidationError('입력된 순위가 없습니다.');

    const ref = boardRef(event.id);
    const board = await getAdminDb().runTransaction(async (tx) => {
      const current = toBoard((await tx.get(ref)).data() as Partial<ScoreboardData> | undefined);
      const names = { ...current.names };
      for (const id of Object.keys(clean)) names[id] = eligible.get(id) ?? names[id];

      const next: ScoreboardData = { ...current, names, rounds: { ...current.rounds, [r]: clean } };
      tx.set(ref, { ...next, updated_at: new Date().toISOString() });
      return next;
    });

    if (!webhookUrl) return board;

    const ok = await postDiscordWebhook(webhookUrl, [buildRoundEmbed(event, r, board)]);
    if (!ok) throw new ValidationError('저장은 됐지만 디스코드 전송에 실패했습니다. 다시 시도해 주세요.');

    await ref.update({ sentRounds: FieldValue.arrayUnion(r) });
    return { ...board, sentRounds: [...new Set([...board.sentRounds, r])] };
  });
}

export async function sendFinalResult(eventId: string): Promise<ActionResult<ScoreboardData>> {
  return run(async () => {
    const event = getEventOrThrow(eventId);
    const webhookUrl = getWebhookUrl();
    const ref = boardRef(event.id);
    const board = toBoard((await ref.get()).data() as Partial<ScoreboardData> | undefined);

    const missing = Array.from({ length: ROUND_COUNT }, (_, i) => i + 1).filter(
      (r) => Object.keys(board.rounds[r] ?? {}).length === 0,
    );
    if (missing.length) throw new ValidationError(`${missing.join(', ')}라운드 순위가 저장되지 않았습니다.`);

    const ok = await postDiscordWebhook(webhookUrl, [buildFinalEmbed(event, computeStandings(board, ROUND_COUNT))]);
    if (!ok) throw new ValidationError('디스코드 전송에 실패했습니다.');

    const finalSentAt = new Date().toISOString();
    await ref.update({ finalSentAt });
    return { ...board, finalSentAt };
  });
}

/** 이벤트 점수 전체 삭제 (모든 라운드 + 전송 기록) */
export async function resetScoreboard(eventId: string): Promise<ActionResult<ScoreboardData>> {
  return run(async () => {
    const event = getEventOrThrow(eventId);
    await boardRef(event.id).delete();
    return { ...EMPTY_BOARD, names: {}, rounds: {}, sentRounds: [] };
  });
}