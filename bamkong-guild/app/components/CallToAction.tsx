// app/components/CallToAction.tsx
'use client';
import React, { useState } from 'react';
import { MessageCircle, Copy, X, ArrowRight } from 'lucide-react';

export default function CallToAction() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formText = "닉네임 / 접속시간대(00~24시) / 나이 / 성별(남성 : 군필여부) / 레벨";
  const kakaoLink = "https://open.kakao.com/o/ssd2leIi";

  const handleCopyAndEnter = async () => {
    try {
      // 1. 클립보드에 양식 복사
      await navigator.clipboard.writeText(formText);
      setIsCopied(true);
      
      // 2. 복사 완료 문구를 0.8초 정도 보여준 뒤 오픈톡 링크로 이동
      setTimeout(() => {
        window.open(kakaoLink, '_blank');
        setIsModalOpen(false);
        setIsCopied(false); // 상태 초기화
      }, 800); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // 복사 권한이 없는 브라우저 환경을 위한 예외 처리
      alert('복사에 실패했습니다. 오픈톡방에서 직접 양식을 작성해 주세요!');
      window.open(kakaoLink, '_blank');
      setIsModalOpen(false);
    }
  };

  return (
    <section id="contact" className="text-center py-24 flex flex-col items-center relative">
      {/* 간판 이미지 버튼 (클릭 시 동일하게 팝업 오픈) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="z-20 mb-4 hover:scale-110 transition-transform drop-shadow-lg inline-block cursor-pointer bg-transparent border-none p-0"
      >
        <img 
          src="/images/cta-sign.png" 
          alt="가입 문의 안내소" 
          className="w-48 h-48 md:w-66 md:h-66 object-contain"
        />
      </button>
      
      {/* 메인 오픈톡 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="group relative z-20 inline-flex items-center justify-center gap-3 px-10 py-5 md:px-12 md:py-6 bg-amber-700 text-white text-xl md:text-[21px] font-black rounded-full shadow-[0_8px_0_0_#92400e,0_15px_20px_rgba(0,0,0,0.2)] hover:translate-y-2 hover:shadow-[0_2px_0_0_#92400e,0_5px_10px_rgba(0,0,0,0.2)] active:translate-y-3 active:shadow-none transition-all duration-200"
      >
        <MessageCircle className="w-7 h-7 group-hover:animate-bounce" />
        1:1 오픈톡 가입 문의하기
      </button>
      
      <p className="mt-8 text-[13px] sm:text-[15px] md:text-base text-stone-600 font-bold bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 rounded-full border border-white/10 whitespace-nowrap">
        🌰 가벼운 대화 후 길드 디스코드 서버로 안내해 드립니다. 🌰
      </p>

      {/* 📋 양식 안내 팝업(모달) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 border border-amber-200 rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl relative text-left">
            {/* 닫기 버튼 */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 transition-colors bg-stone-100 hover:bg-stone-200 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-amber-800 mb-2 flex items-center gap-2">
              <span>📋</span> 가입 양식 안내
            </h3>
            <p className="text-sm text-stone-600 font-medium mb-6 break-keep">
              원활한 가입 진행을 위해 아래 양식을 복사한 뒤 오픈톡방에 남겨주세요!
            </p>

            {/* 양식 텍스트 박스 */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
              <p className="text-[13px] md:text-[14px] font-bold text-amber-900 leading-relaxed break-keep text-center">
                {formText}
              </p>
            </div>

            {/* 복사 및 입장 액션 버튼 */}
            <button
              onClick={handleCopyAndEnter}
              disabled={isCopied}
              className="w-full group inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-700 hover:bg-amber-600 text-white text-[15px] md:text-base font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isCopied ? (
                '복사 완료! 입장하는 중... 🏃'
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  양식 복사하고 입장하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}