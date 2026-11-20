// app/components/GuildGuide.tsx
import { AlertTriangle, Ban, Heart } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { ABOUT_CARDS, DECLINE, JOIN_REQUIREMENTS, RULES, WELCOME, type InfoItem } from '@/app/data/guideData';

function DotList({ items, dotClass }: { items: InfoItem[]; dotClass: string }) {
  return (
    <ul className="grid gap-3 text-base leading-relaxed text-stone-100">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 break-keep">
          <span aria-hidden className={`shrink-0 mt-[9px] w-1.5 h-1.5 rounded-full ${dotClass}`} />
          <span>{item.content}</span>
        </li>
      ))}
    </ul>
  );
}

/** 01 길드 소개 · 02 가입 조건 · 03 분위기/금지 사항 (서버 컴포넌트) */
export default function GuildGuide() {
  return (
    <>
      {/* 01 · ABOUT */}
      <section id="about" className="scroll-mt-24 max-w-6xl mx-auto px-6 pt-16 md:pt-20 pb-10">
        <SectionHeading eyebrow="01 · ABOUT" title={<>모든 활동은 자유 참여,<br />배려는 필수예요</>} description="부담 없이 하고 싶은 것만 골라서 함께해요." />
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ABOUT_CARDS.map(({ icon: Icon, label, title, description }, i) => (
            <li key={label}>
              <Reveal delay={(i % 3) * 80} className="h-full">
                <div className="h-full p-7 rounded-3xl bg-gradient-to-b from-[#1c1813] to-[#15120f] border border-white/[0.07] hover:border-amber-400/45 hover:-translate-y-1 transition duration-300 motion-reduce:transition-none">
                  <span className="inline-flex w-12 h-12 rounded-2xl bg-amber-400/12 items-center justify-center text-amber-400">
                    <Icon className="w-6 h-6" aria-hidden />
                  </span>
                  <p className="mt-5 mb-1.5 text-sm text-stone-400">{label}</p>
                  <p className="text-[26px] leading-tight text-white">{title}</p>
                  <p className="mt-2.5 text-[15px] text-stone-300 break-keep">{description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* 02 · JOIN */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] p-7 md:p-12 bg-gradient-to-br from-[#2a1f12] to-[#17130f] to-60% border border-amber-400/30">
            <div aria-hidden className="absolute -right-24 -top-40 w-[400px] h-[400px] rounded-full bg-amber-400/15 blur-[80px] transform-gpu" />
            <div className="relative grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12">
              <SectionHeading eyebrow="02 · JOIN" title="가입 조건" description="아래 조건을 확인하고, 맨 아래 가입 양식을 복사해 오픈톡에 남겨주세요." className="mb-0" />
              <dl>
                {JOIN_REQUIREMENTS.map((item, i) => (
                  <div
                    key={item.label}
                    className={`grid sm:grid-cols-[120px_1fr] gap-2 sm:gap-4 py-[18px] ${i < JOIN_REQUIREMENTS.length - 1 ? 'border-b border-white/[0.08]' : ''}`}
                  >
                    <dt className="text-[17px] text-amber-400">{item.label}</dt>
                    <dd className="text-base leading-relaxed text-stone-100 break-keep">{item.content}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 03 · VIBE */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <SectionHeading eyebrow="03 · VIBE" title="이런 분과 함께하고 싶어요" />
        <div className="grid lg:grid-cols-2 gap-4">
          <Reveal className="h-full">
            <div className="h-full p-7 md:p-8 rounded-3xl bg-[#15120f] border border-emerald-300/20">
              <h3 className="mb-5 flex items-center gap-2.5 text-[22px] text-emerald-300">
                <Heart className="w-[22px] h-[22px]" aria-hidden />
                이런 분을 격하게 환영해요
              </h3>
              <DotList items={WELCOME} dotClass="bg-emerald-300" />
            </div>
          </Reveal>
          <Reveal className="h-full" delay={100}>
            <div className="h-full p-7 md:p-8 rounded-3xl bg-[#15120f] border border-rose-300/20">
              <h3 className="mb-5 flex items-center gap-2.5 text-[22px] text-rose-300">
                <Ban className="w-[22px] h-[22px]" aria-hidden />
                정중히 거절합니다
              </h3>
              <DotList items={DECLINE} dotClass="bg-rose-300" />
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-4 p-7 md:px-8 rounded-3xl border border-rose-300/30 bg-[#15120f] bg-[repeating-linear-gradient(135deg,rgba(253,164,175,0.06)_0_12px,transparent_12px_24px)] grid md:grid-cols-3 gap-5 items-center">
            <p className="flex items-center gap-2.5 text-[22px] text-rose-300">
              <AlertTriangle className="w-6 h-6" aria-hidden />
              길드 내 금지 사항
            </p>
            {RULES.map((rule) => (
              <p key={rule.label} className="text-[15px] leading-relaxed break-keep">
                <span className="block text-[17px] text-white">{rule.label}</span>
                <span className="text-stone-300">{rule.content}</span>
              </p>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
