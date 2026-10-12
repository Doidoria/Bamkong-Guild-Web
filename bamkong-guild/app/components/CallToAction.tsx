// app/components/CallToAction.tsx
'use client';

import { useId, useState } from 'react';
import { MessageCircle, Copy, Check, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Modal from './Modal';

const FORM_TEXT = `닉네임 : 
접속시간대(00~24시) : 
나이 : 
성별(남성 : 군필여부) : 
레벨 : `;
const KAKAO_LINK = 'https://open.kakao.com/o/ssd2leIi';

export default function CallToAction() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const titleId = useId();

  const openModal = () => {
    setIsCopied(false);
    setIsModalOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FORM_TEXT);
      setIsCopied(true);
      toast.success('양식이 복사됐어요! 오픈톡에 붙여넣어 주세요 🌰');
    } catch {
      toast.error('복사에 실패했어요. 양식을 길게 눌러 직접 복사해 주세요!');
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 text-center py-20 md:py-24 px-4 flex flex-col items-center relative">
      <button
        type="button"
        onClick={openModal}
        aria-label="가입 문의 안내 열기"
        className="z-20 mb-4 hover:scale-110 transition-transform drop-shadow-lg cursor-pointer motion-reduce:transition-none"
      >
        <img src="/images/cta-sign.png" alt="" className="w-48 h-48 md:w-66 md:h-66 object-contain" />
      </button>

      <button
        type="button"
        onClick={openModal}
        className="group relative z-20 inline-flex items-center justify-center gap-3 px-10 py-5 md:px-12 md:py-6 bg-amber-700 text-white text-xl md:text-[21px] font-black rounded-full shadow-[0_8px_0_0_#92400e,0_15px_20px_rgba(0,0,0,0.2)] hover:translate-y-2 hover:shadow-[0_2px_0_0_#92400e,0_5px_10px_rgba(0,0,0,0.2)] active:translate-y-3 active:shadow-none transition-all duration-200"
      >
        <MessageCircle className="w-7 h-7 group-hover:animate-bounce" aria-hidden />
        1:1 오픈톡 가입 문의하기
      </button>

      <p className="mt-8 max-w-md text-sm md:text-base text-stone-800 font-bold bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/40 break-keep">
        🌰 가벼운 대화 후 길드 디스코드 서버로 안내해 드립니다. 🌰
      </p>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} labelledBy={titleId}>
        <div className="text-left">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            aria-label="닫기"
            className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 transition-colors bg-stone-100 hover:bg-stone-200 p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 id={titleId} className="text-xl font-black text-amber-800 mb-2 flex items-center gap-2 pr-10">
            <span aria-hidden>📋</span> 가입 양식 안내
          </h3>
          <p className="text-sm text-stone-600 font-medium mb-5 break-keep">
            원활한 가입 진행을 위해 아래 양식을 복사한 뒤 오픈톡방에 남겨주세요!
          </p>

          {/* select-all: 복사 실패 시 길게 눌러 한 번에 선택 가능 */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-5 text-[13px] md:text-sm font-bold text-amber-900 leading-relaxed whitespace-pre-line select-all">
            {FORM_TEXT}
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-xl border transition-colors ${
                isCopied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200'
              }`}
            >
              {isCopied ? <Check className="w-5 h-5" aria-hidden /> : <Copy className="w-5 h-5" aria-hidden />}
              {isCopied ? '복사 완료!' : '① 양식 복사하기'}
            </button>

            {/* 실제 <a> 링크라 팝업 차단에 걸리지 않음 */}
            <a
              href={KAKAO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsModalOpen(false)}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 transition-all ${
                isCopied ? 'ring-4 ring-amber-300/60' : ''
              }`}
            >
              ② 오픈톡 입장하기
              <ExternalLink className="w-4 h-4" aria-hidden />
            </a>
          </div>
        </div>
      </Modal>
    </section>
  );
}