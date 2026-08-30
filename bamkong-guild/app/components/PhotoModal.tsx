// app/components/PhotoModal.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoModalProps {
  photo: { images: string[]; title: string; date: string; desc: string };
  onClose: () => void;
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photo.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photo.images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    setIsVisible(true);
    // 모달이 열릴 때 항상 첫 번째 사진부터 보이도록 초기화
    setCurrentIndex(0);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      // 서브 사진이 2장 이상일 때만 방향키 작동
      if (photo.images.length > 1) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; 
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [photo]); 

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // 현재 보여줄 이미지
  const currentImageSrc = photo.images[currentIndex];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-900/95 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div className={`relative max-w-5xl w-full bg-[#faf8f5] rounded-2xl overflow-hidden shadow-xl border border-stone-200/30 flex flex-col transition-all duration-300 ease-out ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40 text-stone-500 hover:text-stone-800 bg-white/90 hover:bg-white p-2.5 rounded-full transition-all shadow-sm hover:rotate-90 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="group/modal w-full h-[50vh] sm:h-[65vh] bg-stone-100 flex items-center justify-center relative overflow-hidden p-6 sm:p-10">
            <span className="absolute text-6xl opacity-10 text-stone-400">📸</span>

            {photo.images.length > 1 && (
              <>
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 bg-black/40 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm">
                  {currentIndex + 1} / {photo.images.length}
                </div>

                <button onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-2 sm:left-4 z-30 p-2 sm:p-3 bg-white/50 hover:bg-white/90 text-stone-700 rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover/modal:opacity-100 -translate-x-4 group-hover/modal:translate-x-0"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>

                <button onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-2 sm:right-4 z-30 p-2 sm:p-3 bg-white/50 hover:bg-white/90 text-stone-700 rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover/modal:opacity-100 translate-x-4 group-hover/modal:translate-x-0"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </>
            )}
          
            <div key={currentImageSrc} className="relative w-full h-full z-10 animate-fadeIn">
              <img 
                src={currentImageSrc} 
                alt={`${photo.title} - ${currentIndex + 1}`}
                className="w-full h-full object-contain shadow-md rounded-sm"
              />
            </div>
        </div>
        
        <div className="w-full bg-[#faf8f5] p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-stone-200">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-stone-800 flex items-center justify-center sm:justify-start gap-3">
              <span className="text-amber-600">🌰</span> {photo.title}
            </h3>
            <p className="text-stone-600 font-medium text-[15px] sm:text-[16px] break-keep">{photo.desc}</p>
          </div>
          
          <div className="px-5 py-3 bg-white rounded-xl border border-amber-200/60 shadow-sm shrink-0">
            <span className="text-amber-800 font-bold text-sm sm:text-base flex items-center gap-2">
              🗓️ {photo.date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}