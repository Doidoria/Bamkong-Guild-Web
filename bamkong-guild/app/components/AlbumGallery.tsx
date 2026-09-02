// app/components/AlbumGallery.tsx
'use client';
import React, { useState } from 'react';
import PhotoModal from './PhotoModal';
import { ALBUM_DATA } from '../album/data/albumData';

export default function AlbumGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 px-2 py-8">
        {ALBUM_DATA.map((photo, index) => {
          const rotateClass = index % 2 === 0 ? '-rotate-2' : 'rotate-2';
          const hoverRotate = index % 2 === 0 ? 'hover:rotate-1' : 'hover:-rotate-1';

          return (
            <div 
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className={`group cursor-pointer bg-[#faf8f5] p-4 pb-6 rounded-sm shadow-md hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 ease-out border border-stone-200/80 flex flex-col relative ${rotateClass} ${hoverRotate} z-10 hover:z-20`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/50 backdrop-blur-md border border-stone-200/50 shadow-sm -rotate-2 z-20"></div>
              
              <div className="aspect-[4/3] w-full overflow-hidden bg-stone-200 relative mb-5 shadow-inner border border-stone-100">
                <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                  <span className="text-4xl animate-pulse">📸</span>
                </div>
                <img 
                  src={photo.images[0]} 
                  alt={photo.title} 
                  className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                
                {/* 2장 이상일 경우 우측 상단 배지 */}
                {photo.images.length > 1 && (
                  <div className="absolute top-2 right-2 z-30 bg-black/60 text-white/90 text-[11px] font-bold px-2 py-1 rounded-md backdrop-blur-sm border border-white/20">
                    +{photo.images.length - 1}
                  </div>
                )}
                <div className="absolute inset-0 bg-amber-900/0 group-hover:bg-amber-900/10 transition-colors duration-500 z-20 pointer-events-none"></div>
              </div>
              
              <div className="px-2 text-center">
                <h3 className="font-black text-stone-700 text-lg mb-1.5 group-hover:text-amber-700 transition-colors">{photo.title}</h3>
                <p className="text-sm font-bold text-amber-600/80 tracking-widest">{photo.date}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </>
  );
}