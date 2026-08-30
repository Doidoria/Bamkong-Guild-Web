// app/admin/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GuildMember } from './types';
import { getDaysSinceJoined, getDaysSinceLastPromotion, getPromotionInfo } from './utils';
import { Lock, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminStats from './components/AdminStats';
import AdminMemberForm from './components/AdminMemberForm';
import AdminMemberTable from './components/AdminMemberTable';
import { getGameSession } from '../game/actions'; 

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // 권한 검증 로딩 상태 추가
  
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);

  const isCheckAttempted = useRef(false);

  // 디스코드 로그인 기반 최고 관리자 검증 로직
  useEffect(() => {
    if (isCheckAttempted.current) return;
    isCheckAttempted.current = true;
    
    const verifyAdmin = async () => {
      try {
        const user = await getGameSession();
        const userId = (user as any)?.id; 
        const ADMIN_UIDS = process.env.NEXT_PUBLIC_ADMIN_UIDS?.split(',') || []; 

        if (!user || !ADMIN_UIDS.includes(userId)) {
          alert('최고 관리자 권한이 없습니다! 🌰');
          router.push('/');
          return;
        }

        // 검증 통과
        setIsAuthorized(true);
      } catch (error) {
        console.error('관리자 권한 확인 에러:', error);
        router.push('/');
      } finally {
        setAuthLoading(false);
      }
    };

    verifyAdmin();
  }, [router]);

  // Firebase 실시간 데이터 연동
  useEffect(() => {
    // 권한 검증이 끝나지 않았으면 DB 호출을 차단합니다.
    if (!isAuthorized) return; 

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
  }, [isAuthorized]);

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
      if (!promoInfo) return false; 
      const daysSince = getDaysSinceLastPromotion(m.joined_at, m.last_promoted_at);
      return daysSince >= promoInfo.reqDays;
    }).length;
    const warningCount = members.filter(m => m.warning_count >= 2).length;
    const breakCount = members.filter(m => m.is_on_break).length;

    return { totalMembers, newThisMonth, promotionCandidates, warningCount, breakCount };
  }, [members]);

  const handleAddMember = async (newMember: any) => {
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
    if (!promoInfo) return; 

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const memberRef = doc(db, 'members', id);
      await updateDoc(memberRef, {
        rank: promoInfo.nextRank, 
        promotion_status: '등업 완료',
        last_promoted_at: todayStr 
      });
    } catch (error) {
      console.error("등업 에러:", error);
    }
  };

  const handleWarningChange = async (id: string, currentWarning: number, delta: number) => {
    try { await updateDoc(doc(db, 'members', id), { warning_count: Math.max(0, currentWarning + delta) }); } 
    catch (error) { console.error("경고 수정 에러:", error); }
  };

  const handleUpdateMember = async (id: string, updatedData: Partial<GuildMember>) => {
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

  // ⏳ 권한 검증 및 데이터 로딩 화면
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center font-sans">
        <Lock className="w-8 h-8 text-amber-500 mb-4 animate-pulse" />
        <div className="font-black text-amber-500 text-lg sm:text-xl">
          관리자 권한을 확인하는 중입니다... 🌰
        </div>
      </div>
    );
  }

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

          <Link
            href="/admin/game"
            className="group shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold rounded-xl border border-amber-500/20 transition-all shadow-sm"
          >
            <Gamepad2 className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all" />
            게임 관리자 센터로 이동
          </Link>
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