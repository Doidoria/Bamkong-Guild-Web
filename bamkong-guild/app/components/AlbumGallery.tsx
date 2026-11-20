// app/components/AlbumGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Images } from 'lucide-react';
import PhotoModal from './PhotoModal';
import { ALBUM_DATA } from '../album/data/albumData';

export type AlbumPhoto = (typeof ALBUM_DATA)[number];

export default function AlbumGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);

  return (
    <>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 px-2 py-4">
        {ALBUM_DATA.map((photo, index) => {
          const tilt = index % 2 === 0 ? '-rotate-2 hover:rotate-1' : 'rotate-2 hover:-rotate-1';

          return (
            <li key={photo.id}>
              {/* 폴라로이드 카드: 키보드로도 열 수 있도록 button */}
              <button
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className={`group relative w-full text-left p-4 pb-6 rounded-md bg-[#f5efe6] shadow-[0_20px_40px_rgba(0,0,0,0.45)] hover:shadow-[0_28px_60px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition duration-500 ease-out motion-reduce:transition-none outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60 cursor-pointer ${tilt}`}
              >
                {/* 마스킹 테이프 */}
                <span aria-hidden className="absolute -top-3 left-1/2 -translate-x-1/2 -rotate-2 w-16 h-5 bg-amber-200/70 shadow-sm" />

                <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-stone-300 mb-5">
                  <Image
                    src={photo.images[0]}
                    alt={photo.title}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  {photo.images.length > 1 && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-900/70 backdrop-blur-sm text-white text-xs">
                      <Images className="w-3.5 h-3.5" aria-hidden />+{photo.images.length - 1}
                    </span>
                  )}
                </span>

                <span className="block px-2 text-center">
                  <span className="block mb-1 text-lg text-stone-800 group-hover:text-amber-800 transition-colors break-keep">{photo.title}</span>
                  <span className="block text-sm tracking-widest text-amber-800/80">{photo.date}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selectedPhoto && <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
    </>
  );
}
