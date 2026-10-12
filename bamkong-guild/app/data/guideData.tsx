// app/data/guideData.tsx
import Image from 'next/image';
import type { InfoItem } from '@/app/components/InfoCard';

function WingIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-50/80 rounded-md border border-amber-300 mx-1 align-text-bottom relative shadow-sm">
      <Image src={src} alt={alt} fill className="object-contain p-0.5" sizes="28px" />
    </span>
  );
}

export const GUILD_INTRO: InfoItem[] = [
  { label: '길드 퀘스트', content: '100% 자유 참여 (밤 10시 고정!)' },
  { label: '길드 점령전', content: '자유롭게 참여 가능 (투표)' },
  { label: '비공정 낚시', content: '사전 공지 후 투표로 유연하게 진행' },
  { label: '주력 맵', content: '이벤트 & 미션 위주 (하코, 8인, 협동 등 모두 환영)' },
];

export const JOIN_REQUIREMENTS: InfoItem[] = [
  { label: '나이 및 성별', content: '05 ~ 95년생 성인 (남성은 군필 또는 면제자)' },
  {
    label: '레벨 조건',
    content: (
      <>
        <WingIcon src="/images/홀리윙.png" alt="홀리윙" />
        홀리윙 이상,{' '}
        <WingIcon src="/images/갤럭시윙.png" alt="갤럭시윙" />
        갤럭시윙 이상은 문의 시 고려
      </>
    ),
  },
  { label: '소통 수단', content: '디코 필수 / 마이크 자유 (고음질 TTS 상시 대기 🎙️)' },
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
  { content: <>테미<span className="text-amber-800">(테런에 진심으로 미침)</span>, 뉴비 과도하게 괴롭히는 고인물</> },
];

export const RULES: InfoItem[] = [
  { label: '그룹 형성 금지', content: '길드 안에서 끼리끼리 무리를 지어 다른 길드원을 배제하는 행동' },
  { label: '따돌림 금지', content: '특정 길드원을 소외시키거나 놀리는 행동' },
];

export const TAGS = ['#성인·친목', '#TTS완비', '#자율참여', '#뉴비·복귀환영'] as const;

export const WEEKEND_BANNER = {
  badge: 'WEEKEND PLAYZONE',
  title: '주말엔 타게임도 다 같이 달려요!',
  description: '스팀 게임, 마피아, 파티 게임 등 길드원들과 함께 즐기는 타게임 목록과 링크를 확인해보세요.',
  href: '/games',
  cta: '타게임 목록 확인하기',
} as const;