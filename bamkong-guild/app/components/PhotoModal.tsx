'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface PhotoModalProps {
  photo: { src: string; title: string; date: string; desc: string };
  onClose: () => void;
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; 
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-900/95 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div className={`relative max-w-5xl w-full bg-[#faf8f5] rounded-2xl overflow-hidden shadow-xl border border-stone-200/30 flex flex-col transition-all duration-300 ease-out ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 text-stone-500 hover:text-stone-800 bg-white/90 hover:bg-white p-2.5 rounded-full transition-all shadow-sm hover:rotate-90 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="w-full h-[50vh] sm:h-[65vh] bg-stone-100 flex items-center justify-center relative overflow-hidden p-6 sm:p-10">
            <span className="absolute text-6xl opacity-10 text-stone-400">📸</span>
          
            <div className="relative w-full h-full z-10">
              <Image 
                src={photo.src} 
                alt={photo.title}
                fill
                className="object-contain shadow-md rounded-sm"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
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