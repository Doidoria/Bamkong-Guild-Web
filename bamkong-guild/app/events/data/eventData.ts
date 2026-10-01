// app/events/data/eventData.ts
export type RoundKind = 'hide' | 'quiz' | 'race';

export interface EventRound {
  round: number;
  kind: RoundKind;
  title: string;
  tags: string[];
  place?: string;
  condition?: string;
  description: string;
}

export interface ScorePoint {
  rank: string;
  score: number;
}

export interface EventReward {
  rank: 1 | 2 | 3;
  prize: string;
}

export interface EventPenalty {
  target: string;
  content: string;
  decision: string;
}

export interface EventEligibility {
  minGrade: string;
  excludedGrades: string[];
}

export interface GuildEvent {
  id: string;
  title: string;
  image: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (한국 시간)
  timeLabel?: string; // 화면 표시용
  summary: string;
  purpose: string;
  concept: string;
  rounds: EventRound[];
  scoring: {
    points: ScorePoint[];
    note: string;
    automation: string;
  };
  rewards: EventReward[];
  penalty: EventPenalty;
  eligibility?: EventEligibility;
}

export const events: GuildEvent[] = [
  {
    id: '2026-autumn',
    title: '밤콩 길드 가을 이벤트',
    image: '/images/events/2026-autumn.jpg',
    startDate: '2026-10-04',
    endDate: '2026-10-04',
    startTime: '22:00',
    timeLabel: '저녁 10시',
    summary: '실력도, 아이템 스펙도 상관없이 누구나 우승할 수 있는 3라운드 미니게임 합산전!',
    purpose: '실력이나 아이템 스펙 부담 없이 누구나 참여하는 밤콩 길드 친목 도모',
    concept: '총 3개의 미니게임 점수 합산제 (누구나 우승 가능!)',
    rounds: [
      {
        round: 1,
        kind: 'hide',
        title: '피터팬 맵 숨바꼭질',
        tags: ['위장', '심리전'],
        description: '맵 곳곳에 숨고 찾으며 즐기는 긴장감 넘치는 숨바꼭질',
      },
      {
        round: 2,
        kind: 'quiz',
        title: '길마 팜 OX & 상식/사자성어 퀴즈',
        tags: ['OX 퀴즈', '테런 TMI', '상식·사자성어', '넌센스 퀴즈'],
        place: '길드장 팜',
        description: '컨트롤 부담 없이 지식과 센스, 눈치로 승부하는 라운드',
      },
      {
        round: 3,
        kind: 'race',
        title: '30인 아이템전 (동능력치)',
        tags: ['30인 달리기', '아이템전'],
        condition: '모든 참여자 능력치 동일 세팅',
        description: '템빨 및 스펙 차이 없이 오직 아이템 활용과 운, 변수로 겨루는 난장판 경기',
      },
    ],
    scoring: {
      points: [
        { rank: '1등', score: 10 },
        { rank: '2등', score: 7 },
        { rank: '3등', score: 5 },
      ],
      note: '4등 이하도 순위별로 차등 점수가 부여되고, 3라운드 점수를 모두 합산해 최종 순위를 정해요. 총점이 같으면 라운드 순위의 합이 낮은 사람이 앞서요.',
      automation: '각 라운드 종료 시 이벤트 채널에 실시간 점수 상황이 송출돼요.',
    },
    rewards: [
      { rank: 1, prize: '치킨 기프티콘' },
      { rank: 2, prize: '배달의민족 2만원 상품권' },
      { rank: 3, prize: '배달의민족 1만원 상품권' },
    ],
    penalty: {
      target: '꼴찌 1명',
      content: '디스코드 닉네임 변경 후 1주일간 유지',
      decision: '이벤트 당일 길드원 전체가 다 함께 의논해서 재밌는 별명으로 최종 결정',
    },
    eligibility: {
      minGrade: '알밤콩',
      excludedGrades: ['새싹', '밤콩'],
    },
  },
];

export const mainEvent: GuildEvent | undefined = events[0];

export function getEventById(id: string): GuildEvent | undefined {
  return events.find((event) => event.id === id);
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function formatDay(date: string): string {
  // UTC 기준으로 요일 계산 → 서버 시간대와 무관하게 동일한 결과
  const weekday = WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  return `${date.replaceAll('-', '.')} (${weekday})`;
}

export function formatEventDate(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatDay(startDate);
  return `${formatDay(startDate)} ~ ${formatDay(endDate)}`;
}