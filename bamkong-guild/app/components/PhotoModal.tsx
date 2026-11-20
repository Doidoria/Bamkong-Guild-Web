// app/components/PhotoModal.tsx
'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { X, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface PhotoModalProps {
  photo: { images: readonly string[]; title: string; date: string; desc: string };
  onClose: () => void;
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const titleId = useId();
  const total = photo.images.length;
  const hasMany = total > 1;

  const handlePrev = useCallback(() => setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1)), [total]);
  const handleNext = useCallback(() => setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1)), [total]);
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    // 마운트 직후 한 프레임 뒤에 켜야 등장 트랜지션이 적용됨
    const raf = requestAnimationFrame(() => setIsVisible(true));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (hasMany && e.key === 'ArrowLeft') handlePrev();
      if (hasMany && e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleClose, handlePrev, handleNext, hasMany]);

  const currentImageSrc = photo.images[currentIndex];
  const navButton =
    'absolute z-30 inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-stone-900/70 hover:bg-stone-900/90 border border-white/10 text-white backdrop-blur-sm transition md:opacity-0 md:group-hover/modal:opacity-100 focus-visible:opacity-100';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleClose}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl overflow-hidden rounded-3xl bg-[#15120f] border border-white/[0.08] shadow-2xl flex flex-col transition duration-300 ease-out ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="닫기"
          className="absolute top-4 right-4 z-40 inline-flex items-center justify-center w-11 h-11 rounded-full bg-stone-900/70 hover:bg-stone-800 border border-white/10 text-stone-200 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden />
        </button>

        <div className="group/modal relative w-full h-[50vh] sm:h-[65vh] bg-black/40 flex items-center justify-center p-4 sm:p-8">
          {hasMany && (
            <>
              <span className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full bg-stone-900/70 backdrop-blur-sm text-sm text-white">
                {currentIndex + 1} / {total}
              </span>
              <button type="button" onClick={handlePrev} aria-label="이전 사진" className={`${navButton} left-3 sm:left-4 cursor-pointer`}>
                <ChevronLeft className="w-6 h-6" aria-hidden />
              </button>
              <button type="button" onClick={handleNext} aria-label="다음 사진" className={`${navButton} right-3 sm:right-4 cursor-pointer`}>
                <ChevronRight className="w-6 h-6" aria-hidden />
              </button>
            </>
          )}
          {/* 원본 비율 그대로 보여주기 위해 <img> 사용 */}
          <img
            key={currentImageSrc}
            src={currentImageSrc}
            alt={`${photo.title} - ${currentIndex + 1}`}
            className="relative z-10 max-w-full max-h-full object-contain rounded-lg animate-fade-in"
          />
        </div>

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-t border-white/[0.06]">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h3 id={titleId} className="text-2xl sm:text-3xl text-white break-keep">
              <span aria-hidden className="mr-2">🌰</span>
              {photo.title}
            </h3>
            <p className="text-[15px] sm:text-base text-stone-300 break-keep">{photo.desc}</p>
          </div>
          <span className="self-center sm:self-auto shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-sm sm:text-base">
            <CalendarDays className="w-4 h-4" aria-hidden />
            {photo.date}
          </span>
        </div>
      </div>
    </div>
  );
}
