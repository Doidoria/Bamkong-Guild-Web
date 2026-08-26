// app/components/AlbumGallery.tsx
'use client';
import React, { useState } from 'react';
import PhotoModal from './PhotoModal';

// 실제 추가하실 앨범 데이터 목록입니다. 
const ALBUM_DATA = [
  { id: 1, src: '/images/album-1.jpg', title: '밤콩 길드 1주년 파티', date: '2026.04.15', desc: '다 같이 모여서 옹기종기 스샷 찍은 날!' },
  { id: 2, src: '/images/album-2.jpg', title: '길드 점령전 우승 기념', date: '2026.05.02', desc: '모두 고생 많으셨습니다 🏆 진짜 감동이었어요' },
  { id: 3, src: '/images/album-3.jpg', title: '비공정 낚시 단체샷', date: '2026.05.20', desc: '드디어 대물 낚은 날 🎣' },
  { id: 4, src: '/images/album-4.jpg', title: '신규 길드원 환영회', date: '2026.06.11', desc: '새로운 런너님들 앞으로 잘 부탁드려요!' },
  { id: 5, src: '/images/album-5.jpg', title: '하드코어 클리어', date: '2026.07.08', desc: '몇 번의 도전 끝에 드디어 깼다 ㅠㅠ' },
  { id: 6, src: '/images/album-6.jpg', title: '새벽 수다 타임', date: '2026.08.15', desc: '잠 안 오는 런너들의 소소한 모임 🌙' },
];

export default function AlbumGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  return (
    <>
      {/* 폴라로이드 감성의 그리드 레이아웃 */}
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
              {/* 반투명 마스킹 테이프 장식 */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/50 backdrop-blur-md border border-stone-200/50 shadow-sm -rotate-2 z-20"></div>
              
              {/* 사진 컨테이너 */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-stone-200 relative mb-5 shadow-inner border border-stone-100">
                <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                  <span className="text-4xl animate-pulse">📸</span>
                </div>
                <img 
                  src={photo.src} 
                  alt={photo.title} 
                  className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                {/* 호버 시 따뜻한 앰버톤 오버레이 필터 */}
                <div className="absolute inset-0 bg-amber-900/0 group-hover:bg-amber-900/10 transition-colors duration-500 z-20 pointer-events-none"></div>
              </div>
              
              {/* 사진 캡션 */}
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