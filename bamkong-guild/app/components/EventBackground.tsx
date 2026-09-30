// app/events/components/EventBackground.tsx
import type { ReactNode } from 'react';
import Image from 'next/image';

interface EventBackgroundProps {
  children: ReactNode;
}

export default function EventBackground({ children }: EventBackgroundProps) {
  return (
    <div className="min-h-screen font-sans selection:bg-amber-500 selection:text-white overflow-x-clip relative bg-stone-950">
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

      {/* 전체 어둡게 */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-stone-950/75"></div>
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,10,9,0.85)_100%)]"></div>

      <main className="relative z-10 min-h-screen">{children}</main>
    </div>
  );
}