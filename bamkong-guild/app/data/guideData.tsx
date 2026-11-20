// app/data/guideData.tsx
import Image from 'next/image';
import { Flag, Fish, Gamepad2, Map, Moon, Sprout, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface InfoItem {
  /** 굵은 소제목. 없으면 본문만 표시 */
  label?: string;
  content: ReactNode;
}

export interface AboutCard {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}

function WingIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center w-8 h-8 bg-amber-50 rounded-lg">
      {/* 20px 픽셀 아트라 확대 시 흐려지지 않도록 pixelated */}
      <Image src={src} alt={alt} width={24} height={24} unoptimized className="w-6 h-6 [image-rendering:pixelated]" />
    </span>
  );
}

/** 01 · ABOUT 카드 (3열 × 2줄 기준으로 6개 유지 권장) */
export const ABOUT_CARDS: AboutCard[] = [
  { icon: Moon, label: '길드 퀘스트', title: '밤 10시 고정!', description: '100% 자유 참여' },
  { icon: Flag, label: '길드 점령전', title: '자유롭게 참여', description: '투표로 결정해요' },
  { icon: Fish, label: '비공정 낚시', title: '사전 공지 후', description: '투표로 유연하게 진행' },
  { icon: Map, label: '주력 맵', title: '이벤트 & 미션', description: '하코, 8인, 협동 등 모두 환영' },
  { icon: Gamepad2, label: '주말 타게임', title: '다 같이 달려요', description: '스팀 게임, 마피아, 파티 게임 등' },
  { icon: Sprout, label: '밤콩 온실', title: '밤콩 키우기', description: '디스코드 연동 길드원 전용 미니게임' },
];

export const JOIN_REQUIREMENTS: InfoItem[] = [
  { label: '나이 및 성별', content: <>05 ~ 95년생 성인 <span className="text-stone-400">(남성은 군필 또는 면제자)</span></> },
  {
    label: '레벨 조건',
    content: (
      <span className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-xl bg-white/5 border border-amber-400/35">
          <WingIcon src="/images/홀리윙.png" alt="" />
          홀리윙 이상
        </span>
        <span className="inline-flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-xl bg-white/[0.03] border border-dashed border-white/20 text-stone-300">
          <WingIcon src="/images/갤럭시윙.png" alt="" />
          갤럭시윙 이상은 문의 시 고려
        </span>
      </span>
    ),
  },
  { label: '소통 수단', content: <>디코 필수 / 마이크 자유 <span className="text-stone-400">(고음질 TTS 상시 대기 🎙️)</span></> },
  { label: '마인드', content: '혼자 게임하기 심심해서 소소하게 달리고 싶으신 분' },
];

export const WELCOME: InfoItem[] = [
  { content: <>소소하게 즐기는 런너님 <span className="text-amber-300">(뉴비/복귀 대환영!)</span></> },
  { content: '배려심이 넘치고 넘쳐 흘러 넘치는 분들' },
  { content: '다양한 이벤트를 즐기고 두루두루 플레이 즐겨하시는 분' },
  { content: '너무 테런에 몰두하지 않고 타겜도 즐겨하시는 분' },
];

export const DECLINE: InfoItem[] = [
  { content: '여미새, 남미새 및 과도한 친목 요구' },
  { content: '과한 욕설, 선 넘는 발언 및 채팅 매너 불량' },
  { content: '활동이 너무 적거나 길드원과 소통 노력이 전혀 없으신 분' },
  { content: <>테미<span className="text-stone-400">(테런에 진심으로 미침)</span>, 뉴비 과도하게 괴롭히는 고인물</> },
];

export const RULES: InfoItem[] = [
  { label: '그룹 형성 금지', content: '길드 안에서 끼리끼리 무리를 지어 다른 길드원을 배제하는 행동' },
  { label: '따돌림 금지', content: '특정 길드원을 소외시키거나 놀리는 행동' },
];

export const TAGS = ['#성인·친목', '#TTS완비', '#자율참여', '#뉴비·복귀환영', '#먼작귀 직접 제작 봇 탑제'] as const;

export const WEEKEND_BANNER = {
  badge: 'WEEKEND PLAYZONE',
  title: '주말엔 타게임도 다 같이 달려요!',
  description: '스팀 게임, 마피아, 파티 게임 등 길드원들과 함께 즐기는 타게임 목록과 링크를 확인해보세요.',
  href: '/games',
  cta: '타게임 목록 확인하기',
} as const;