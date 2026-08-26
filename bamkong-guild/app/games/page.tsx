// app/games/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, ArrowLeft, Gamepad2 } from 'lucide-react';

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
    description: '자유롭게 건축하고 생존하며 밤콩만의 마을을 만들어가는 힐링(생존) 게임입니다.',
    tags: ['멀티플레이', '건축', '생존'],
    specialBadges: ['주말 오픈', '전용 런처 제공'],
    image: '/images/games/minecraft.jpg',
    storeUrl: 'https://www.minecraft.net/',
  },
  {
    id: 2,
    title: 'Goose Goose Duck (구스구스덕)',
    genre: '소셜 디덕션 (마피아)',
    platform: 'Steam (무료)',
    description: '무료로 즐길 수 있는 거위 마피아 게임! 밤콩 길드원들과 치열하고 유쾌한 심리전을 즐겨보세요.',
    tags: ['무료', '마이크필수', '심리전'],
    image: '/images/games/goose-goose-duck.jpg',
    storeUrl: 'https://store.steampowered.com/app/1568590/Goose_Goose_Duck/',
  },
  {
    id: 3,
    title: 'Party Animals (파티 애니멀즈)',
    genre: '파티 액션 / 난투',
    platform: 'Steam',
    description: '귀여운 동물 캐릭터들로 즐기는 난투형 파티 게임! 가볍게 웃으며 즐기기에 아주 좋습니다.',
    tags: ['멀티플레이', '캐주얼', '친목추천'],
    image: '/images/games/party-animals.jpg',
    storeUrl: 'https://store.steampowered.com/app/1260320/Party_Animals/',
  },
  {
    id: 4,
    title: '메카 카멜레온',
    genre: '파티 / 숨바꼭질',
    platform: 'Steam',
    description: '몸을 칠해서 주변과 섞여 보세요! "메카 카멜레온"은 무대를 흉내 내기 위해 하얀 몸을 칠하는 새로운 숨바꼭질 게임입니다.',
    tags: ['멀티플레이', '숨바꼭질', '가벼운게임'],
    image: '/images/games/metcha-chameleon.jpg',
    storeUrl: 'https://store.steampowered.com/app/4704690/MECCHA_CHAMELEON/',
  },
  {
    id: 5,
    title: 'REPO (레포)',
    genre: '협동',
    platform: 'Steam',
    description: '밤콩 길드원들과 함께 즐기는 스릴 넘치는 협동 게임! 디스코드에서 다 같이 소통하며 즐기기 좋습니다.',
    tags: ['협동', '멀티플레이', '마이크 추천'],
    image: '/images/games/repo.jpg',
    storeUrl: 'https://store.steampowered.com/app/3241660/REPO/',
  },
];

export default function OtherGamesPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-amber-200 overflow-x-hidden relative text-stone-800">
        <div className="fixed inset-0 -z-20 bg-[url('/images/bg-mobile.jpg')] md:bg-[url('/images/bg-main.jpg')] bg-cover bg-top"></div>
        <div className="fixed inset-0 bg-white/20 -z-10 pointer-events-none transform-gpu"></div>

        <header className="fixed top-0 w-full z-50 bg-white/25 border-b border-stone-200/50 transition-colors">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-amber-700 font-bold transition-colors group">
                <div className="bg-white/10 p-1.5 rounded-full group-hover:-translate-x-1 transition-transform">
                <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="hidden sm:inline">메인으로</span>
            </Link>
          
          <div className="flex items-center gap-2 font-black text-stone-800 text-lg sm:text-xl">
            밤콩 타게임 목록 <img src="/images/bamkong_game.png" alt="밤콩 게임" className="w-6 h-6 inline-block mb-1" />
          </div>
        </div>
      </header>

      {/* 🎮 메인 콘텐츠 */}
      <main className="py-12 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-16">
          {OTHER_GAMES_DATA.map((game) => (
            <a
              key={game.id}
              href={game.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-200 flex flex-col"
            >
              {/* 이미지 영역 (필터 효과 최소화) */}
              <div className="relative aspect-video w-full bg-stone-100 border-b border-stone-100">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-stone-900/90 text-amber-100 text-[11px] font-bold px-2 py-1 rounded-md">
                  {game.platform}
                </div>
              </div>

              {/* 텍스트 정보 영역 */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap mt-0.5">
                      {game.genre}
                    </span>
                    
                    {game.specialBadges && (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {game.specialBadges.map((badge, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[12px] font-black bg-orange-50 text-orange-600 border border-orange-200 rounded-md shadow-sm whitespace-nowrap">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-lg font-black text-stone-800 group-hover:text-amber-700 transition-colors flex items-center justify-between mb-3">
                    {game.title}
                    <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-amber-600 shrink-0" />
                  </h2>

                  <p className="text-[13px] sm:text-sm text-stone-600 font-medium leading-relaxed break-keep">
                    {game.description}
                  </p>
                </div>

                {/* 태그 및 액션 */}
                <div className="mt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {game.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}