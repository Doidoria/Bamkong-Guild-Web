// app/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import InfoCard from './components/InfoCard';
import CallToAction from './components/CallToAction';
import GuildSkills from './components/GuildSkills';
import { Gamepad2, ArrowRight } from 'lucide-react';

export default async function BamkongGuildPage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;
  const isMember = !!(session?.user as any)?.isBamkongMember;

  return (
    <div className="min-h-screen font-sans selection:bg-amber-200 overflow-x-hidden relative">
      <div className="fixed inset-0 -z-20 bg-[url('/images/bg-mobile.jpg')] md:bg-[url('/images/bg-main.jpg')] bg-cover bg-top"></div>
      <div className="fixed inset-0 bg-white/20 -z-10 pointer-events-none transform-gpu"></div>
      
      {/* 실제 콘텐츠 영역 */}
      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection isAuthenticated={isAuthenticated} isMember={isMember} />
          <section className="relative max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <div id="about" className="absolute -top-[110px]"></div>
            <InfoCard 
              title="길드 소개"
              theme="light"
              items={[
                <><span className="block font-bold text-stone-800 mb-0.5">길드 퀘스트</span> 100% 자유 참여 (밤 10시 고정!)</>,
                <><span className="block font-bold text-stone-800 mb-0.5">길드 점령전</span> 자유롭게 참여 가능</>,
                <><span className="block font-bold text-stone-800 mb-0.5">비공정 낚시</span> 사전 공지 후 투표로 유연하게 진행</>,
                <><span className="block font-bold text-stone-800 mb-0.5">주력 맵</span> 이벤트 & 미션 위주 (하코, 8인, 협동 등 모두 환영)</>
              ]}
            />
            <InfoCard 
              title="가입 조건"
              theme="light"
              items={[
                <><span className="block font-bold text-stone-800 mb-0.5">나이 및 성별</span> 05 ~ 93년생 성인 (남성은 군필 또는 면제자)</>,
                <>
                  <span className="block font-bold text-stone-800 mb-0.5">레벨 조건</span> 
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-50 rounded-md border border-amber-300 mr-1 align-text-bottom relative">
                    <Image src="/images/스텔라윙.png" alt="스텔라윙" fill className="object-contain p-0.5" sizes="24px" />
                  </span>
                  스텔라윙 이상,<span> </span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-50 rounded-md border border-amber-300 mr-1 align-text-bottom relative">
                    <Image src="/images/쏠라윙.png" alt="쏠라윙" fill className="object-contain p-0.5" sizes="24px" />
                  </span>
                  쏠라윙 이상은 문의 시 고려
                </>,
                <><span className="block font-bold text-stone-800 mb-0.5">소통 수단</span> 디코 필수 / 마이크 자유 (고음질 TTS 상시 대기 🎙️)</>,
                <><span className="block font-bold text-stone-800 mb-0.5">마인드</span> 혼자 게임하기 심심해서 소소하게 달리고 싶으신 분</>
              ]}
            />
            <InfoCard 
              title="이런 분을 격하게 환영해요"
              theme="dark"
              items={[
                <span className="text-lg md:text-[17px]">소소하게 즐기는 런너님 <span className="text-amber-200">(뉴비/복귀 대환영!)</span></span>,
                <span className="text-lg md:text-[17px]">혼자 게임하기 심심해서 따뜻한 소속감이 필요하신 분</span>,
                <span className="text-lg md:text-[16.5px]">다양한 이벤트와 억압 없는 자유로운 길드를 원하시는 분</span>
              ]}
            />
            <InfoCard 
              title="정중히 거절합니다"
              theme="warning"
              items={[
                <span className="text-stone-800 font-bold text-lg md:text-[17px]">여미새, 남미새 및 과도한 친목 요구</span>,
                <span className="text-stone-800 font-bold text-lg md:text-[17px]">과한 욕설, 선 넘는 발언 및 채팅 매너 불량</span>,
                <span className="text-stone-800 font-bold text-lg md:text-[16.5px]">활동이 너무 적거나 길드원과 소통 노력이 전혀 없으신 분</span>
              ]}
            />
          </section>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">#성인·친목</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">#TTS완비</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">#자율참여</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">#뉴비·복귀환영</span>
          </div>
          
          <GuildSkills />

          {/* 📸 길드 앨범 유도 섹션 */}
          <section className="max-w-5xl mx-auto px-6 mb-36 relative z-10 text-center flex flex-col items-center">
            {/* 3D 책 컨테이너 */}
            <div className="group w-full max-w-[340px] md:max-w-[400px] h-[400px] md:h-[450px] mx-auto [perspective:1200px] cursor-pointer">
              <div className="relative w-full h-full transition-transform duration-1000 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-amber-900 rounded-r-3xl rounded-l-lg shadow-2xl border border-stone-800 overflow-hidden flex flex-col items-center justify-center p-8 bg-[url('/images/bg-main.jpg')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-amber-950/60 backdrop-blur-sm"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black/40 to-transparent border-r border-white/10 z-10"></div>
                  <div className="relative z-20 flex flex-col items-center">
                    <span className="text-6xl md:text-7xl mb-6 drop-shadow-xl animate-pulse">📖</span>
                    <h3 className="text-2xl md:text-3xl font-black text-amber-50 drop-shadow-lg mb-3 tracking-widest border-y-2 border-amber-50/30 py-3">
                      BAMKONG
                      <span className="block text-lg md:text-xl font-bold mt-1 text-amber-200">추억 앨범</span>
                    </h3>
                    <p className="text-amber-100/80 font-bold text-sm bg-black/20 px-4 py-1.5 rounded-full mt-4 border border-white/10">
                      마우스를 올려서 돌려보세요
                    </p>
                  </div>
                </div>

                {/* 📄 책 내지 */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#faf8f5] rounded-l-3xl rounded-r-lg shadow-2xl border-2 border-amber-100 overflow-hidden flex flex-col items-center justify-center p-6 md:p-8">
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-stone-300/50 to-transparent border-l border-stone-200/50"></div>
                  <div className="relative z-10 flex flex-col items-center h-full justify-between py-4">
                    <div className="flex flex-col items-center mt-15">
                      <h3 className="text-xl md:text-2xl font-black text-amber-900 mb-4 text-center">
                        밤콩들의 <br/> 따뜻한 기록
                      </h3>
                      <p className="text-stone-600 font-medium text-sm md:text-[15px] break-keep text-center leading-relaxed">
                        함께 달리고 웃었던 시간들,<br/>
                        뉴비, 복귀 런너님들도 앞으로<br/>
                        예쁜 추억을 채워나가요!
                      </p>
                    </div>

                    <Link href="/album"
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 text-white text-[15px] md:text-base font-bold rounded-xl shadow-[0_6px_0_0_#92400e] hover:translate-y-1 hover:shadow-[0_3px_0_0_#92400e] active:translate-y-2 active:shadow-none transition-all duration-200 w-full"
                    >
                      앨범 구경하러 가기
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 🎮 주말 타게임 확인 배너 섹션 */}
          <section className="max-w-5xl mx-auto px-6 mb-10 relative z-10">
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-800 to-stone-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-amber-700/40 text-white flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-amber-300 shadow-inner">
                  <Gamepad2 className="w-10 h-10" />
                </div>
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black mb-2 border border-amber-400/20">
                    WEEKEND PLAYZONE
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-2 text-amber-50">
                    주말엔 타게임도 다 같이 달려요!
                  </h3>
                  <p className="text-stone-300 text-sm md:text-base font-medium break-keep">
                    스팀 게임, 마피아, 파티 게임 등 길드원들과 함께 즐기는 타게임 목록과 링크를 확인해보세요.
                  </p>
                </div>
              </div>

              <Link
                href="/games"
                className="group shrink-0 inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-black rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                타게임 목록 확인하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>

          <CallToAction />

        </main>

        <footer className="w-full py-12 text-center text-stone-600 text-sm bg-stone-100/50 mt-10 border-t border-stone-200/50 backdrop-blur-md break-keep">
          <p className="font-bold text-stone-700 mb-2">테일즈런너 밤콩 길드 (Since 2026)</p>
          <p className="flex items-center justify-center gap-1">
            ⓒ 2026 밤콩 길드. 모든 권리 보유.
          </p>
        </footer>
      </div>
    </div>
  );
}