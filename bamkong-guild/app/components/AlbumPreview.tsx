// app/components/AlbumPreview.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

// 메인에 보여줄 앨범 사진 3장 (앞에서 뒤 순서: 마지막이 맨 앞)
const PHOTOS = [
  { src: '/images/albumgallery/album-1-sub.png', alt: '추억 앨범 사진 2', className: 'left-0 top-8 w-[58%] h-[220px] sm:h-[260px] -rotate-[5deg]' },
  { src: '/images/albumgallery/album-1-sub2.png', alt: '추억 앨범 사진 3', className: 'right-0 top-0 w-[52%] h-[200px] sm:h-[240px] rotate-[4deg]' },
  { src: '/images/albumgallery/album-1.png', alt: '추억 앨범 사진 1', className: 'left-[18%] bottom-0 w-[64%] h-[220px] sm:h-[260px] -rotate-1' },
] as const;

export default function AlbumPreview() {
  return (
    <section id="album" className="scroll-mt-24 max-w-6xl mx-auto px-6 py-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeading
            eyebrow="05 · ALBUM"
            title={<>밤콩들의<br />따뜻한 기록</>}
            description="함께 달리고 웃었던 시간들, 뉴비, 복귀 런너님들도 앞으로 예쁜 추억을 채워나가요!"
          />
          <Link
            href="/album"
            className="group inline-flex items-center gap-2 h-[52px] px-6 rounded-2xl border border-amber-400/45 text-amber-400 hover:bg-amber-400/10 text-[17px] transition-colors"
          >
            앨범 구경하러 가기
            <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <Reveal>
          <div className="relative h-[380px] sm:h-[440px]">
            {PHOTOS.map((photo) => (
              <div
                key={photo.src}
                className={`absolute overflow-hidden rounded-[18px] border-[6px] border-[#f5efe6] shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${photo.className}`}
              >
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 360px, 60vw" className="object-cover" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
