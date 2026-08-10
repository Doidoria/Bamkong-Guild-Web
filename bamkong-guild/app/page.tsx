import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import InfoCard from './components/InfoCard';
import CallToAction from './components/CallToAction';

export default function BamkongGuildPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-amber-200 overflow-x-hidden relative bg-[url('/images/bg-mobile.jpg')] md:bg-[url('/images/bg-main.jpg')] bg-cover bg-top bg-fixed">
      {/* 배경이 너무 진할 경우를 대비한 부드러운 화이트 오버레이 */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0 pointer-events-none"></div>
      
      {/* 실제 콘텐츠 영역 */}
      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <section id="about" className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
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
                <><span className="block font-bold text-stone-800 mb-0.5">나이 및 성별</span> 03년생 이상 성인 (남성은 군필 또는 면제자)</>,
                <>
                  <span className="block font-bold text-stone-800 mb-0.5">레벨 조건</span> 
                  <img src="/images/스텔라윙.png" alt="스텔라윙" className="inline-block w-5 h-5 align-text-bottom mr-1 drop-shadow-sm" />
                  스텔라윙 이상,<span> </span>
                  <img src="/images/쏠라윙.png" alt="쏠라윙" className="inline-block w-5 h-4 align-text-bottom mr-1 drop-shadow-sm" />쏠라윙 이상은 문의 시 고려
                </>,
                <><span className="block font-bold text-stone-800 mb-0.5">소통 수단</span> 디코 필수 / 마이크 자유 (고음질 TTS 상시 대기 🎙️)</>,
                <><span className="block font-bold text-stone-800 mb-0.5">마인드</span> 혼자 게임하기 심심해서 소소하게 달리고 싶으신 분</>
              ]}
            />
            <InfoCard 
              title="이런 분을 격하게 환영해요"
              theme="dark"
              items={[
                <>소소하게 즐기는 런너님 <span className="text-amber-200">(뉴비/복귀 대환영!)</span></>,
                <>혼자 게임하기 심심해서 따뜻한 소속감이 필요하신 분</>,
                <>다양한 이벤트와 억압 없는 자유로운 길드를 원하시는 분</>
              ]}
            />
            <InfoCard 
              title="정중히 거절합니다"
              theme="warning"
              items={[
                <span className="text-stone-800 font-bold">여미새, 남미새 및 과도한 친목 요구</span>,
                <span className="text-stone-800 font-bold">과한 욕설, 선 넘는 발언 및 채팅 매너 불량</span>,
                <span className="text-stone-800 font-bold">활동이 너무 적거나 길드원과 소통 노력이 전혀 없으신 분</span>
              ]}
            />
          </section>
          <CallToAction />
        </main>

        <footer className="w-full py-12 text-center text-stone-600 text-sm bg-stone-100/50 mt-10 border-t border-stone-200/50 backdrop-blur-md break-keep">
          <p className="font-bold text-stone-700 mb-2">테일즈런너 밤콩 길드 (Since 2026)</p>
          <p>ⓒ 2026 밤콩 길드. 모든 권리 보유.</p>
        </footer>
      </div>
    </div>
  );
}