// app/game/components/Leaderboard.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Trophy, Medal, RefreshCcw } from 'lucide-react';

interface Ranker {
  id: string;
  level: number;
  exp: number;
  name?: string;
  guildNickname?: string;
  globalName?: string;
  avatar?: string;
  image?: string;
}

export default function Leaderboard() {
  const [rankers, setRankers] = useState<Ranker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'bamkong_growth'),
        orderBy('level', 'desc'),
        orderBy('exp', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const data: Ranker[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Ranker);
      });
      
      setRankers(data);
    } catch (error) {
      console.error('랭킹 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-md transform-gpu scale-[1.02] z-10';
      case 1: return 'bg-stone-100/80 border-stone-300 text-stone-800 shadow-sm';
      case 2: return 'bg-orange-50/80 border-orange-200 text-orange-900 shadow-sm';
      default: return 'bg-white border-stone-100 text-stone-600 hover:bg-stone-50';
    }
  };

  const getRankBadge = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="w-5 h-5 text-amber-500 fill-amber-200" />;
      case 1: return <Medal className="w-5 h-5 text-stone-400 fill-stone-200" />;
      case 2: return <Medal className="w-5 h-5 text-orange-400 fill-orange-200" />;
      default: return <span className="font-bold w-5 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-amber-200/60 rounded-[2rem] p-6 shadow-lg flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
          🏆 명예의 전당
        </h3>
        <button 
          onClick={fetchRanking}
          disabled={isLoading}
          className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all disabled:opacity-50"
          title="새로고침"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1 custom-scrollbar flex flex-col gap-3">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-stone-400 font-bold animate-pulse">
            랭킹을 불러오는 중...
          </div>
        ) : rankers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-stone-400 font-medium">
            아직 랭킹 데이터가 없습니다.
          </div>
        ) : (
          rankers.map((ranker, idx) => (
            <div 
              key={ranker.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${getRankStyle(idx)}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8">
                  {getRankBadge(idx)}
                </div>
                {/* 프사 및 디스코드 닉네임 렌더링 */}
                <div className="flex items-center gap-2">
                  {ranker.avatar && (
                    <img src={ranker.avatar} alt="프로필" className="w-6 h-6 rounded-full border border-stone-200" />
                  )}
                  <span className="font-bold text-[15px]">
                    {ranker.guildNickname || ranker.globalName || ranker.name || ranker.id.substring(0, 8)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-black text-[15px]">Lv. {ranker.level}</span>
                <span className="block text-[11px] font-bold opacity-60">{ranker.exp} EXP</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}