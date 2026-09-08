// app/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Gamepad2, ArrowRight } from 'lucide-react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import InfoCard from './components/InfoCard';
import CallToAction from './components/CallToAction';
import GuildSkills from './components/GuildSkills';
import AlbumBook from './components/AlbumBook';

export default async function BamkongGuildPage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;
  const isMember = !!(session?.user as any)?.isBamkongMember;

  return (
    <div className="min-h-screen font-sans selection:bg-amber-500 selection:text-white overflow-x-hidden relative scroll-smooth">
      <div className="fixed inset-0 -z-20 pointer-events-none select-none">
        <Image
          src="/images/bg-main.jpg"
          alt="밤콩 길드 배경"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="hidden md:block object-cover object-top"
        />
        <Image
          src="/images/bg-mobile.jpg"
          alt="밤콩 길드 모바일 배경"
          fill
          priority
          quality={80}
          sizes="100vw"
          className="block md:hidden object-cover object-top"
        />
      </div>

      {/* 은은한 깊이감을 위한 오버레이 */}
      <div className="fixed inset-0 bg-stone-900/15 -z-10 pointer-events-none"></div>
      
      {/* 실제 콘텐츠 영역 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <HeroSection isAuthenticated={isAuthenticated} isMember={isMember} />
          <section className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 mb-28 mt-8">
            <div id="about" className="absolute -top-[120px]"></div>
            
            <InfoCard 
              title="길드 소개"
              theme="light"
              items={[
                <><span className="block font-bold text-stone-800 mb-1 text-lg">길드 퀘스트</span> 100% 자유 참여 (밤 10시 고정!)</>,
                <><span className="block font-bold text-stone-800 mb-1 text-lg">길드 점령전</span> 자유롭게 참여 가능 (투표)</>,
                <><span className="block font-bold text-stone-800 mb-1 text-lg">비공정 낚시</span> 사전 공지 후 투표로 유연하게 진행</>,
                <><span className="block font-bold text-stone-800 mb-1 text-lg">주력 맵</span> 이벤트 & 미션 위주 (하코, 8인, 협동 등 모두 환영)</>
              ]}
            />
            
            <InfoCard 
              title="가입 조건"
              theme="light"
              items={[
                <><span className="block font-bold text-stone-800 mb-1 text-lg">나이 및 성별</span> 05 ~ 95년생 성인 (남성은 군필 또는 면제자)</>,
                <>
                  <span className="block font-bold text-stone-800 mb-1 text-lg">레벨 조건</span> 
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-50/80 rounded-md border border-amber-300 mr-1.5 align-text-bottom relative shadow-sm">
                    <Image src="/images/갤럭시윙.png" alt="갤럭시윙" fill className="object-contain p-0.5" sizes="28px" />
                  </span>
                  갤럭시윙 이상,<span> </span>
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-50/80 rounded-md border border-amber-300 ml-1 mr-1.5 align-text-bottom relative shadow-sm">
                    <Image src="/images/스텔라윙.png" alt="스텔라윙" fill className="object-contain p-0.5" sizes="28px" />
                  </span>
                  스텔라윙 이상은 문의 시 고려
                </>,
                <><span className="block font-bold text-stone-800 mb-1 text-lg">소통 수단</span> 디코 필수 / 마이크 자유 (고음질 TTS 상시 대기 🎙️)</>,
                <><span className="block font-bold text-stone-800 mb-1 text-lg">마인드</span> 혼자 게임하기 심심해서 소소하게 달리고 싶으신 분</>
              ]}
            />
            
            <InfoCard 
              title="이런 분을 격하게 환영해요"
              theme="dark"
              items={[
                <span className="text-lg">소소하게 즐기는 런너님 <span className="text-amber-300 font-semibold">(뉴비/복귀 대환영!)</span></span>,
                <span className="text-lg">배려심이 넘치고 넘쳐 흘러 넘치는 분들</span>,
                <span className="text-lg">다양한 이벤트를 즐기고 두루두루 플레이 즐겨하시는 분</span>,
                <span className="text-lg">너무 테런에 몰두하지 않고 타겜도 즐겨하시는 분</span>
              ]}
            />
            
            <InfoCard 
              title="정중히 거절합니다"
              theme="warning"
              items={[
                <span className="text-stone-900 font-bold text-lg">여미새, 남미새 및 과도한 친목 요구</span>,
                <span className="text-stone-900 font-bold text-lg">과한 욕설, 선 넘는 발언 및 채팅 매너 불량</span>,
                <span className="text-stone-900 font-bold text-lg">활동이 너무 적거나 길드원과 소통 노력이 전혀 없으신 분</span>,
                <span className="text-stone-900 font-bold text-lg">테미<span className="text-amber-800 font-semibold">(테런에 진심으로 미침)</span>, 뉴비 과도하게 괴롭히는 고인물</span>
              ]}
            />
          </section>

          <div className="flex flex-wrap justify-center gap-3 mb-16 px-4">
            {['#성인·친목', '#TTS완비', '#자율참여', '#뉴비·복귀환영'].map((tag) => (
              <span 
                key={tag}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm text-amber-900 border border-amber-200/60 rounded-full text-sm lg:text-base font-bold shadow-sm cursor-default hover:-translate-y-1 hover:shadow-md hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 ease-out"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <GuildSkills />
          <AlbumBook />

          {/* 🎮 퀄리티업: 주말 타게임 배너 */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20 relative z-10">
            <div className="relative overflow-hidden bg-stone-900/90 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-700/50 flex flex-col md:flex-row items-center justify-between gap-10 group">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/30 transition-colors duration-700"></div>
              <div className="absolute -left-20 -top-20 w-64 h-64 bg-amber-700/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row relative z-10">
                <div className="p-5 bg-stone-800/80 rounded-2xl border border-stone-600/50 text-amber-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Gamepad2 className="w-12 h-12" />
                </div>
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-3 border border-amber-500/20 tracking-widest">
                    WEEKEND PLAYZONE
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black mb-3 text-white tracking-tight">
                    주말엔 타게임도 다 같이 달려요!
                  </h3>
                  <p className="text-stone-400 text-base lg:text-lg font-medium break-keep max-w-2xl">
                    스팀 게임, 마피아, 파티 게임 등 길드원들과 함께 즐기는 타게임 목록과 링크를 확인해보세요.
                  </p>
                </div>
              </div>

              <Link
                href="/games"
                className="shrink-0 inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 
                text-stone-950 font-black text-[16px] md:text-lg rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.05] active:scale-95 relative z-10"
              >
                타게임 목록 확인하기
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>
          </section>

          <CallToAction />

        </main>

        <footer className="w-full py-12 text-center text-stone-800 text-sm bg-white/5 mt-auto border-t border-stone-600/20 backdrop-blur-md break-keep">
          <p className="font-bold text-stone-800 mb-2 text-base">테일즈런너 밤콩 길드 (Since 2026)</p>
          <p className="flex items-center justify-center gap-1">
            ⓒ 2026 밤콩 길드. 모든 권리 보유.
          </p>
        </footer>
      </div>
    </div>
  );
}