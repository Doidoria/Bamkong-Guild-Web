// app/games/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import SubPageShell from '../components/SubPageShell';

export const metadata: Metadata = {
  title: '밤콩 타게임 목록',
  description: '주말엔 타게임도 다 같이! 밤콩 길드원들과 함께 즐기는 게임 목록',
};

interface OtherGame {
  id: number;
  title: string;
  genre: string;
  platform: string;
  description: string;
  tags: string[];
  image: string;
  storeUrl: string;
  specialBadges?: string[];
}

// 🎮 현재 즐겨하는 타게임 목록 5종 세팅
const OTHER_GAMES_DATA: OtherGame[] = [
  {
    id: 1,
    title: '마인크래프트 (Minecraft)',
    genre: '샌드박스 / 생존',
    platform: 'PC',
    description: '도타이쿤 RPG 야생 경제서버 오픈! 밤콩 길드원들과 함께 경쟁하며 즐기는 야생 서버!',
    tags: ['야생', '건축', 'PRG', '경제'],
    specialBadges: ['요청시 오픈', '전용 런처 제공'],
    image: '/images/games/minecraft.jpg',
    storeUrl: 'https://www.minecraft.net/ko-kr/store/minecraft-java-bedrock-edition-pc?tabs=%7B%22details%22%3A0%7D',
  },
  {
    id: 2,
    title: 'REPO (레포)',
    genre: '협동',
    platform: 'Steam',
    description: '밤콩 길드원들과 함께 즐기는 스릴 넘치는 협동 게임! 디스코드에서 다 같이 소통하며 즐기기 좋습니다.',
    tags: ['협동', '멀티플레이', '마이크 추천'],
    image: '/images/games/repo.jpg',
    storeUrl: 'https://store.steampowered.com/app/3241660/REPO/',
  },
  {
    id: 3,
    title: '메카 카멜레온',
    genre: '파티 / 숨바꼭질',
    platform: 'Steam',
    description: '몸을 칠해서 주변과 섞여 보세요! "메카 카멜레온"은 무대를 흉내 내기 위해 하얀 몸을 칠하는 새로운 숨바꼭질 게임입니다.',
    tags: ['멀티플레이', '숨바꼭질', '가벼운게임'],
    image: '/images/games/metcha-chameleon.jpg',
    storeUrl: 'https://store.steampowered.com/app/4704690/MECCHA_CHAMELEON/',
  },
  {
    id: 4,
    title: 'PEAK (피크)',
    genre: '협동 / 등반',
    platform: 'Steam',
    description: '조난당한 스카우트가 되어 섬 한가운데의 산을 함께 올라야 하는 협동 등반 게임! 서로 손을 잡아 끌어올려 주며 정상까지 가 보세요.',
    tags: ['협동', '최대 4인', '마이크 추천'],
    image: '/images/games/peak.jpg',
    storeUrl: 'https://store.steampowered.com/app/3527290/PEAK/',
  },
  {
    id: 5,
    title: 'VALORANT (발로란트)',
    genre: '전술 FPS',
    platform: 'Riot (무료)',
    description: '라이엇 게임즈의 5대5 전술 슈팅 게임! 요원별 스킬을 활용해 길드원들과 팀을 짜서 함께 달려 보세요.',
    tags: ['무료', '팀전', '마이크필수'],
    image: '/images/games/valorant.jpg',
    storeUrl: 'https://playvalorant.com/ko-kr/',
  },
  {
    id: 6,
    title: 'Party Animals (파티 애니멀즈)',
    genre: '파티 액션 / 난투',
    platform: 'Steam',
    description: '귀여운 동물 캐릭터들로 즐기는 난투형 파티 게임! 가볍게 웃으며 즐기기에 아주 좋습니다.',
    tags: ['멀티플레이', '캐주얼', '친목추천'],
    image: '/images/games/party-animals.jpg',
    storeUrl: 'https://store.steampowered.com/app/1260320/Party_Animals/',
  },
  {
    id: 7,
    title: 'Goose Goose Duck (구스구스덕)',
    genre: '소셜 디덕션 (마피아)',
    platform: 'Steam (무료)',
    description: '무료로 즐길 수 있는 거위 마피아 게임! 밤콩 길드원들과 치열하고 유쾌한 심리전을 즐겨보세요.',
    tags: ['무료', '마이크필수', '심리전'],
    image: '/images/games/goose-goose-duck.jpg',
    storeUrl: 'https://store.steampowered.com/app/1568590/Goose_Goose_Duck/',
  },
  {
    id: 8,
    title: 'Shape of Dreams (셰이프 오브 드림즈)',
    genre: '액션 로그라이트',
    platform: 'Steam',
    description: '꿈속 세계를 탐험하며 스킬을 조합해 보스를 쓰러뜨리는 액션 로그라이트! 길드원들과 4인 협동으로 매번 다른 빌드를 즐겨 보세요.',
    tags: ['협동', '최대 4인', '국산 인디'],
    image: '/images/games/shape-of-dreams.jpg',
    storeUrl: 'https://store.steampowered.com/app/2444750/Shape_of_Dreams/',
  },
  {
    id: 9,
    title: 'Overcooked! 2 (오버쿡드 2)',
    genre: '파티 / 협동 요리',
    platform: 'Steam',
    description: '정신없는 주방에서 손발을 맞춰 주문을 처리하는 협동 요리 게임! 웃다가 싸우다가 다시 웃게 되는 우정 테스트 게임입니다.',
    tags: ['협동', '멀티플레이', '친목추천'],
    image: '/images/games/overcooked-2.jpg',
    storeUrl: 'https://store.steampowered.com/app/728880/Overcooked_2/',
  },
];

export default function OtherGamesPage() {
  return (
    <SubPageShell
      pageTitle="타게임 목록"
      eyebrow="WEEKEND PLAYZONE"
      title="주말엔 타게임도 다 같이 달려요!"
      description="스팀 게임, 마피아, 파티 게임 등 길드원들과 함께 즐기는 타게임 목록이에요. 카드를 누르면 스토어로 이동해요."
    >
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {OTHER_GAMES_DATA.map((game) => (
          <li key={game.id}>
            <a
              href={game.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group h-full flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-[#1c1813] to-[#15120f] border border-white/[0.07] hover:border-amber-400/45 hover:-translate-y-1 transition duration-300 motion-reduce:transition-none outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60"
            >
              <div className="relative aspect-video w-full bg-stone-900">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#15120f] via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-stone-900/85 backdrop-blur-sm border border-white/10 text-xs text-amber-200">
                  {game.platform}
                </span>
                {game.specialBadges && (
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {game.specialBadges.map((badge) => (
                      <span key={badge} className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-900 text-xs whitespace-nowrap">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col p-6">
                <p className="mb-1.5 text-sm text-stone-400">{game.genre}</p>
                <h2 className="mb-3 flex items-start justify-between gap-3 text-xl leading-snug text-white group-hover:text-amber-300 transition-colors break-keep">
                  {game.title}
                  <ExternalLink className="w-[18px] h-[18px] mt-1 shrink-0 text-stone-500 group-hover:text-amber-400 transition-colors" aria-hidden />
                </h2>
                <p className="text-[15px] leading-relaxed text-stone-300 break-keep">{game.description}</p>

                <ul aria-label="태그" className="mt-auto pt-5 flex flex-wrap gap-1.5">
                  {game.tags.map((tag) => (
                    <li key={tag} className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs text-stone-300">
                      #{tag}
                    </li>
                  ))}
                </ul>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </SubPageShell>
  );
}
