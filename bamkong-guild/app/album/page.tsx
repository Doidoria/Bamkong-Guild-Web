// app/album/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AlbumGallery from '../components/AlbumGallery';

export const metadata = {
  title: '밤콩 길드 앨범',
  description: '밤콩 길드의 따뜻한 추억들을 구경해보세요',
};

export default function AlbumPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-amber-200 overflow-x-hidden relative text-stone-800">
      <div className="fixed inset-0 -z-20 bg-[url('/images/bg-mobile.jpg')] md:bg-[url('/images/bg-main.jpg')] bg-cover bg-top"></div>
      <div className="fixed inset-0 bg-white/20 -z-10 pointer-events-none transform-gpu"></div>

      <header className="fixed top-0 w-full z-50 bg-white/25 border-b border-stone-200/50 transition-colors">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-amber-700 font-bold transition-colors group">
            <div className="bg-white/10 p-1.5 rounded-full group-hover:-translate-x-1 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline">메인으로</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-stone-800 flex items-center gap-2">
            밤콩 길드 추억 앨범
          </h1>
          <div className="w-[88px] sm:w-[100px]"></div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto min-h-screen relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-3xl font-black mb-4">
            <img src="/images/밤콩.png" alt="밤콩 도토리" className="w-8 h-8 inline-block mr-3 mb-4" />
            <span className="text-[#814325] mr-3">밤콩들의 따뜻한 기록</span>
            <img src="/images/밤콩.png" alt="밤콩 도토리" className="w-8 h-8 inline-block mb-4" />
          </h2>
          <p className="text-stone-700 font-medium bg-white/80 inline-block px-6 py-2 rounded-full border border-amber-900/10">
            <span className="text-[#814325]">밤콩들의 '오순도순' 기념적인 사진 앨범들을 모아두는 곳이에요!</span>
          </p>
        </div>
        
        <AlbumGallery />
      </main>
    </div>
  );
}