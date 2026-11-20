// app/components/CallToAction.tsx
'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const FORM_TEXT = `닉네임 :
접속시간대(00~24시) :
나이 :
성별(남성 : 군필여부) :
레벨 : `;

const KAKAO_LINK = 'https://open.kakao.com/o/ssd2leIi';

export default function CallToAction() {
  const [isCopied, setIsCopied] = useState(false);

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
    <section id="contact" className="scroll-mt-24 max-w-6xl mx-auto px-6 pt-10 pb-24">
      <div className="rounded-[2rem] p-7 md:p-12 bg-[#15120f] border border-white/[0.07] grid lg:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col items-center text-center gap-4">
          <img src="/images/cta-sign.png" alt="" loading="lazy" className="w-44 h-44 md:w-56 md:h-56 object-contain" />
          <h2 className="text-[28px] md:text-[34px] leading-tight text-white">1:1 오픈톡 가입 문의하기</h2>
          <p className="text-base text-stone-300 break-keep">🌰 가벼운 대화 후 길드 디스코드 서버로 안내해 드립니다. 🌰</p>
        </div>

        <div className="p-6 md:p-7 rounded-3xl bg-[#0f0d0b] border border-amber-400/25">
          <h3 className="mb-1.5 text-xl text-amber-400">
            <span aria-hidden>📋</span> 가입 양식 안내
          </h3>
          <p className="mb-4 text-sm text-stone-400 break-keep">원활한 가입 진행을 위해 아래 양식을 복사한 뒤 오픈톡방에 남겨주세요!</p>
          {/* select-all: 복사 실패 시 길게 눌러 한 번에 선택 가능 */}
          <div className="mb-5 px-5 py-4 rounded-2xl bg-[#1c1813] border border-white/[0.06] text-[15px] leading-[1.9] text-stone-100 whitespace-pre-line select-all">
            {FORM_TEXT}
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center justify-center gap-2 h-[52px] rounded-2xl border text-base transition-colors cursor-pointer ${
                isCopied
                  ? 'border-emerald-300/50 bg-emerald-300/10 text-emerald-300'
                  : 'border-amber-400/45 hover:bg-amber-400/10 text-amber-400'
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
              className={`inline-flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-[#fee500] hover:bg-[#ffeb3b] text-[#191600] text-base transition ${
                isCopied ? 'ring-4 ring-amber-300/50' : ''
              }`}
            >
              ② 오픈톡 입장하기
              <ExternalLink className="w-4 h-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
