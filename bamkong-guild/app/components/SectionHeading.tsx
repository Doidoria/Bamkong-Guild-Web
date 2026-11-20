// app/components/SectionHeading.tsx
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  className?: string;
}

/** 메인페이지 섹션 공통 제목 (번호 라벨 + 제목 + 설명) */
export default function SectionHeading({ eyebrow, title, description, className = 'mb-8 md:mb-10' }: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="mb-2.5 text-sm tracking-[0.14em] text-amber-400">{eyebrow}</p>
      <h2 className="text-[32px] md:text-[42px] leading-tight text-white break-keep">{title}</h2>
      {description && <p className="mt-3 text-base md:text-[17px] text-stone-400 break-keep">{description}</p>}
    </div>
  );
}
