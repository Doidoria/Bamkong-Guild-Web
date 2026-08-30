// app/admin/game/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'; 
import { db } from '@/app/lib/firebase';
import { Shield, Zap, FastForward, RotateCcw, RefreshCw, Trash2, UserX } from 'lucide-react';

interface BamkongUser {
  id: string;
  globalName: string;
  level: number;
  exp: number;
  ap: number;
}

export default function AdminGameDashboard() {
  const [users, setUsers] = useState<BamkongUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const MAX_AP = 15; 

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'bamkong_growth'));
      const userData: BamkongUser[] = [];
      querySnapshot.forEach((doc) => {
        userData.push({ id: doc.id, ...doc.data() } as BamkongUser);
      });
      setUsers(userData.sort((a, b) => b.level - a.level));
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 기존 관리자 제어 함수들 ---
  const handleFillAp = async (userId: string) => {
    await setDoc(doc(db, 'bamkong_growth', userId), { ap: MAX_AP }, { merge: true });
    fetchUsers();
  };

  const handleLevelUp = async (userId: string, currentLevel: number) => {
    const nextLevel = Math.min(100, currentLevel + 10);
    await setDoc(doc(db, 'bamkong_growth', userId), { level: nextLevel }, { merge: true });
    fetchUsers();
  };

  const handleResetMinigames = async (userId: string) => {
    await setDoc(doc(db, 'bamkong_growth', userId), { playedGamesTime: {} }, { merge: true });
    fetchUsers();
  };

  // ✨ 신규: 데이터 완전 삭제 및 1레벨 초기화 함수
  const handleHardReset = async (userId: string, userName: string) => {
    const isConfirmed = window.confirm(`⚠️ 경고: [${userName}]님의 모든 게임 데이터(레벨, 경험치, 행동력)를 삭제하고 1레벨로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.`);
    
    if (isConfirmed) {
      // 모든 성장 데이터를 초기값(Lv.1, 0 Exp, 0 AP, 횟수 초기화)으로 덮어씌웁니다.
      await setDoc(doc(db, 'bamkong_growth', userId), { 
        level: 1, 
        exp: 0, 
        ap: 0, 
        playedGamesTime: {} 
      }, { merge: true });
      alert('데이터가 완전히 초기화되었습니다.');
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const isConfirmed = window.confirm(`🚨 치명적 경고: [${userName}]님의 모든 게임 데이터를 DB에서 '완전히 삭제'하시겠습니까?\n이 작업은 절대 복구할 수 없습니다.`);
    
    if (isConfirmed) {
      try {
        // DB에서 해당 유저의 문서 자체를 완전히 날려버립니다.
        await deleteDoc(doc(db, 'bamkong_growth', userId));
        alert(`[${userName}]님의 데이터가 영구적으로 삭제되었습니다.`);
        fetchUsers(); // 삭제 후 목록 새로고침
      } catch (error) {
        console.error('데이터 삭제 실패:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans p-8 md:p-12 relative overflow-hidden">
      <div className="fixed inset-0 bg-white/40 -z-10 backdrop-blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-stone-800 flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-amber-600" />
              밤콩 게임 관리자 센터
            </h1>
            <p className="text-stone-500 font-bold">길드원 전체의 성장 현황을 모니터링하고 제어합니다.</p>
          </div>
          <button 
            onClick={fetchUsers} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-stone-600 hover:text-amber-600 font-bold rounded-xl border border-stone-200 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </header>

        <div className="bg-white/80 backdrop-blur-lg border border-amber-200/50 rounded-[2rem] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-100 text-amber-900 font-black text-sm uppercase tracking-wider">
                  <th className="p-5">디스코드 닉네임</th>
                  <th className="p-5 text-center">레벨 / EXP</th>
                  <th className="p-5 text-center">보유 행동력</th>
                  <th className="p-5 text-right">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-amber-600 font-bold animate-pulse">
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/50 transition-colors">
                      <td className="p-5 font-bold">{user.globalName}</td>
                      <td className="p-5 text-center">
                        <span className="text-amber-600 font-black">Lv.{user.level}</span> <span className="text-xs text-stone-400">({user.exp}%)</span>
                      </td>
                      <td className="p-5 text-center font-bold">
                        {user.ap} <span className="text-xs text-stone-400">/ {MAX_AP}</span>
                      </td>
                      <td className="p-5 flex justify-end gap-2">
                        <button onClick={() => handleFillAp(user.id)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg shadow-sm tooltip" title="AP 풀충전">
                          <Zap className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleLevelUp(user.id, user.level)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg shadow-sm tooltip" title="강제 10업">
                          <FastForward className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleResetMinigames(user.id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg shadow-sm tooltip" title="미니게임 횟수 초기화">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        
                        {/* 구분선 및 위험 관리 버튼 영역 */}
                        <div className="w-px h-8 bg-stone-200 mx-1"></div>
                        
                        {/* 1레벨 초기화 버튼 */}
                        <button 
                          onClick={() => handleHardReset(user.id, user.globalName)} 
                          className="p-2 bg-orange-50 text-orange-500 hover:bg-orange-100 hover:text-orange-600 rounded-lg shadow-sm tooltip transition-colors" 
                          title="데이터 초기화 (Lv.1로 강등)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* 데이터 완전 삭제 버튼 */}
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.globalName)} 
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-lg shadow-sm tooltip transition-colors" 
                          title="데이터 영구 삭제 (DB에서 제거)"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}