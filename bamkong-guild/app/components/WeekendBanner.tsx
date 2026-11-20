// app/components/WeekendBanner.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface WeekendBannerProps {
  badge: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export default function WeekendBanner({ badge, title, description, href, cta }: WeekendBannerProps) {
  return (
    <section id="weekend" className="scroll-mt-24 max-w-6xl mx-auto px-6 pt-16 md:pt-20 pb-10">
      <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-[52px] bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 text-stone-900 flex flex-col md:flex-row md:items-center justify-between gap-7">
        <div aria-hidden className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-[40px] border-white/20" />
        <div className="relative">
          <span className="inline-block mb-3 px-3 py-1.5 rounded-lg bg-stone-900 text-amber-400 text-xs tracking-[0.14em]">{badge}</span>
          <h2 className="mb-2.5 text-[28px] md:text-4xl leading-tight break-keep">{title}</h2>
          <p className="max-w-xl text-base text-stone-800 break-keep">{description}</p>
        </div>
        <Link
          href={href}
          className="group relative shrink-0 inline-flex items-center justify-center gap-2 h-14 px-7 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-lg transition-colors"
        >
          {cta}
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
