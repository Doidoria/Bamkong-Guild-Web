'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminStats from './components/AdminStats';
import AdminMemberForm from './components/AdminMemberForm';
import AdminMemberTable from './components/AdminMemberTable';
import { GuildMember } from './types';
import { getDaysSinceJoined, getDaysSinceLastPromotion, getPromotionInfo } from './utils';
import { Lock } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);

  // 로그인 핸들러
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1117') {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 일치하지 않습니다. 🌰');
      setPasswordInput('');
    }
  };

  // Firebase 실시간 데이터 연동
  useEffect(() => {
    if (!isAuthenticated) return; // 로그인 전에는 DB를 안 불러옵니다.

    const q = query(collection(db, 'members'), orderBy('joined_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GuildMember[];
      setMembers(membersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = members.filter(m => {
      const jDate = new Date(m.joined_at);
      return jDate.getMonth() === currentMonth && jDate.getFullYear() === currentYear;
    }).length;
    const promotionCandidates = members.filter(m => {
      if (m.is_blacklisted) return false;
      const promoInfo = getPromotionInfo(m.rank);
      if (!promoInfo) return false; // 최고 등급이면 제외
      const daysSince = getDaysSinceLastPromotion(m.joined_at, m.last_promoted_at);
      return daysSince >= promoInfo.reqDays;
    }).length;
    const warningCount = members.filter(m => m.warning_count >= 2).length;
    const breakCount = members.filter(m => m.is_on_break).length;

    return { totalMembers, newThisMonth, promotionCandidates, warningCount, breakCount };
  }, [members]);

  // 🛡️ 신규 길드원 DB 추가 핸들러 (중복 검사 포함)
  const handleAddMember = async (newMember: any) => {
    // 이미 등록된 닉네임인지 확인 (대소문자 무시)
    const isDuplicate = members.some(
      (m) => m.nickname.toLowerCase() === newMember.nickname.toLowerCase()
    );

    if (isDuplicate) {
      alert(`'${newMember.nickname}' 님은 이미 등록된 길드원입니다! 🌰`);
      return;
    }

    try { await addDoc(collection(db, 'members'), newMember); } 
    catch (error) { console.error("등록 에러:", error); }
  };

  const handlePromote = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    const promoInfo = getPromotionInfo(member.rank);
    if (!promoInfo) return; // 더 이상 승급할 수 없는 경우 방지

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const memberRef = doc(db, 'members', id);
      await updateDoc(memberRef, {
        rank: promoInfo.nextRank, // 자동으로 다음 등급
        promotion_status: '등업 완료',
        last_promoted_at: todayStr // 최근 등업일 갱신
      });
    } catch (error) {
      console.error("등업 에러:", error);
    }
  };

  const handleWarningChange = async (id: string, currentWarning: number, delta: number) => {
    try { await updateDoc(doc(db, 'members', id), { warning_count: Math.max(0, currentWarning + delta) }); } 
    catch (error) { console.error("경고 수정 에러:", error); }
  };

  // 🛡️ 길드원 정보 업데이트 핸들러 (닉네임 변경 시 중복 검사 포함)
  const handleUpdateMember = async (id: string, updatedData: Partial<GuildMember>) => {
    // 닉네임을 변경하려고 할 때만 중복 검사 수행
    if (updatedData.nickname) {
      const isDuplicate = members.some(
        (m) => m.id !== id && m.nickname.toLowerCase() === updatedData.nickname!.toLowerCase()
      );

      if (isDuplicate) {
        alert(`'${updatedData.nickname}' 닉네임은 이미 다른 길드원이 사용 중입니다! 🌰`);
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'members', id), updatedData);
    } catch (error) {
      console.error("업데이트 에러:", error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (error) {
      console.error("삭제 에러:", error);
    }
  };

  // 로그인 화면 UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center font-sans px-4">
        <div className="bg-stone-900 border border-stone-800 p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-black/50 max-w-sm w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-100 mb-2">관리자 로그인</h1>
          <p className="text-xs sm:text-sm text-stone-400 mb-8 text-center">밤콩 길드 대시보드 접근 권한이 필요합니다.</p>
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="비밀번호 입력" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 text-center text-stone-100 placeholder-stone-600 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              autoFocus
            />
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-900/20">
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ⏳ 로딩 화면
  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center font-black text-amber-500 text-lg sm:text-xl">데이터를 불러오는 중입니다... 🌰</div>;

  // 💻 메인 대시보드 UI (다크 모드)
  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 md:p-10 font-sans text-stone-300">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-800 pb-4 md:pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-100 flex items-center gap-2 sm:gap-3">
              <span className="text-amber-500">🌰</span> 밤콩 관리자 대시보드
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 font-medium mt-2">
              길드원 가입일, 등업 조건, 경고 및 휴식 현황을 효율적으로 관리하세요.
            </p>
          </div>
        </div>

        <AdminStats stats={stats} />
        <AdminMemberForm onAddMember={handleAddMember} />
        <AdminMemberTable 
          members={members} 
          stats={stats} 
          onPromote={handlePromote} 
          onWarningChange={handleWarningChange}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
        />
      </div>
    </div>
  );
}