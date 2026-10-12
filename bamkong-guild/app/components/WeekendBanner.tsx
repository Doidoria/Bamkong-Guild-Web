// app/components/WeekendBanner.tsx
import Link from 'next/link';
import { ArrowRight, Gamepad2 } from 'lucide-react';

interface WeekendBannerProps {
  badge: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export default function WeekendBanner({ badge, title, description, href, cta }: WeekendBannerProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-20">
      <div className="group relative overflow-hidden bg-stone-900/90 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-7 md:p-12 shadow-2xl border border-stone-700/50 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
        <div aria-hidden className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/30 transition-colors duration-700" />
        <div aria-hidden className="absolute -left-20 -top-20 w-64 h-64 bg-amber-700/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-6 text-center md:text-left">
          <div className="p-4 md:p-5 bg-stone-800/80 rounded-2xl border border-stone-600/50 text-amber-400 shadow-inner">
            <Gamepad2 className="w-10 h-10 md:w-12 md:h-12" aria-hidden />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-3 border border-amber-500/20 tracking-widest">
              {badge}
            </span>
            <h2 className="text-2xl md:text-4xl font-black mb-3 text-white tracking-tight break-keep">{title}</h2>
            <p className="text-stone-300 text-[15px] md:text-lg font-medium break-keep max-w-2xl">{description}</p>
          </div>
        </div>

        {/* group/btn: 화살표가 배너 전체가 아니라 버튼 hover에만 반응 */}
        <Link
          href={href}
          className="group/btn relative z-10 shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-base md:text-lg rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.04] active:scale-95"
        >
          {cta}
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover/btn:translate-x-1.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}