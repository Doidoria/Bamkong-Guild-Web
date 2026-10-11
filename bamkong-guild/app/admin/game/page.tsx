// app/admin/game/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Shield, Zap, Pencil, RotateCcw, RefreshCw, Trash2, UserX, Search, ArrowUpDown, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ActionResult } from '@/app/lib/adminAction';
import {
  deleteGameUser,
  fillGameUserAp,
  hardResetGameUser,
  listGameUsers,
  resetGameUserMinigames,
  setGameUserLevel,
} from './actions';
import { MAX_AP, MAX_LEVEL, MIN_LEVEL, type BamkongUser, type GameUserPatch } from './types';

const ITEMS_PER_PAGE = 10;

/** 액션 호출 공통: 실패/통신 오류 시 토스트 후 null */
async function callAction<T>(action: () => Promise<ActionResult<T>>): Promise<T | null> {
  try {
    const result = await action();
    if (!result.ok) {
      toast.error(result.message);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error('[admin/game]', error);
    toast.error('서버와 통신하지 못했습니다.');
    return null;
  }
}

type SortOption = 'levelDesc' | 'levelAsc' | 'apDesc' | 'apAsc' | 'nameAsc';

export default function AdminGameDashboard() {
  const [users, setUsers] = useState<BamkongUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 검색 및 정렬 상태 관리
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('levelDesc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy]);

    const fetchUsers = async (showToast = false) => {
    setIsLoading(true);
    const data = await callAction(() => listGameUsers());
    if (data !== null) {
      setUsers(data);
      if (showToast) toast.success('데이터를 최신 상태로 새로고침했습니다.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 0.3초 디바운스 적용 (타이핑 성능 최적화)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 필터링 및 정렬 파이프라인 (기존과 동일)
  const filteredAndSortedUsers = useMemo(() => {
    const result = users.filter((user) => {
      const targetName = (user.guildNickname || user.name || user.globalName || '').toLowerCase();
      return targetName.includes(debouncedSearch.toLowerCase());
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'levelDesc': return b.level - a.level;
        case 'levelAsc': return a.level - b.level;
        case 'apDesc': return b.ap - a.ap;
        case 'apAsc': return a.ap - b.ap;
        case 'nameAsc': {
          const nameA = a.guildNickname || a.name || a.globalName || '';
          const nameB = b.guildNickname || b.name || b.globalName || '';
          return nameA.localeCompare(nameB);
        }
        default: return 0;
      }
    });

    return result;
  }, [users, debouncedSearch, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 삭제로 마지막 페이지가 비면 이전 페이지로
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  /** 전체 재조회 대신 바뀐 값만 로컬 상태에 반영 (Firestore 읽기 절감) */
  const applyPatch = (userId: string, patch: GameUserPatch) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
  };

  // --- 관리자 제어 함수들 ---
  const handleFillAp = async (userId: string) => {
    const patch = await callAction(() => fillGameUserAp(userId));
    if (patch === null) return;
    applyPatch(userId, patch);
    toast.success('행동력(AP)이 최대치로 충전되었습니다.');
  };

  const handleEditLevel = async (userId: string, currentLevel: number, userName: string) => {
    const input = window.prompt(
      `[${userName}]님의 변경할 레벨을 입력하세요 (${MIN_LEVEL}~${MAX_LEVEL}):`,
      String(currentLevel),
    );
    if (input === null || input.trim() === '') return;

    const newLevel = Number(input.trim());
    if (!Number.isInteger(newLevel) || newLevel < MIN_LEVEL || newLevel > MAX_LEVEL) {
      toast.error(`${MIN_LEVEL}에서 ${MAX_LEVEL} 사이의 정수를 입력해주세요.`);
      return;
    }

    const patch = await callAction(() => setGameUserLevel(userId, newLevel));
    if (patch === null) return;
    applyPatch(userId, patch);
    toast.success(`[${userName}]님의 레벨이 ${newLevel}(으)로 변경되었습니다.`);
  };

  const handleResetMinigames = async (userId: string) => {
    const patch = await callAction(() => resetGameUserMinigames(userId));
    if (patch === null) return;
    toast.success('미니게임 플레이 횟수가 초기화되었습니다.');
  };

  const handleHardReset = async (userId: string, userName: string) => {
    const isConfirmed = window.confirm(
      `⚠️ 경고: [${userName}]님의 모든 게임 데이터(레벨, 포인트, 방 꾸미기 등)를 삭제하고 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    );
    if (!isConfirmed) return;

    const patch = await callAction(() => hardResetGameUser(userId));
    if (patch === null) return;
    applyPatch(userId, patch);
    toast.success(`[${userName}]님의 모든 데이터가 1레벨(첫 접속 상태)로 초기화되었습니다.`);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const isConfirmed = window.confirm(
      `🚨 치명적 경고: [${userName}]님의 모든 게임 데이터를 DB에서 '완전히 삭제'하시겠습니까?\n이 작업은 절대 복구할 수 없습니다.`,
    );
    if (!isConfirmed) return;

    const deletedId = await callAction(() => deleteGameUser(userId));
    if (deletedId === null) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));
    toast.error(`[${userName}]님의 데이터가 영구적으로 삭제되었습니다.`);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans p-8 md:p-12 relative overflow-hidden">
      <div className="fixed inset-0 bg-white/40 -z-10 backdrop-blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-stone-800 flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-amber-600" />
              밤콩 게임 관리자 센터
            </h1>
            <p className="text-stone-500 font-bold">길드원 전체의 성장 현황을 모니터링하고 제어합니다.</p>
          </div>
          
          {/* 버튼들을 그룹화하고 돌아가기 버튼 추가 */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <Link 
              href="/admin" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 font-bold rounded-xl border border-stone-200 shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Link>
            <button 
              onClick={() => fetchUsers(true)} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-stone-600 hover:text-amber-600 font-bold rounded-xl border border-stone-200 shadow-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </header>

        <div className="bg-white/90 backdrop-blur-lg border border-amber-200/60 rounded-[2rem] shadow-xl overflow-hidden flex flex-col">
          
          {/* 툴바 패널 (검색 및 정렬) */}
          <div className="p-4 sm:p-5 border-b border-amber-100 flex flex-col sm:flex-row items-center gap-3 bg-amber-50/30">
            <div className="relative w-full sm:w-auto shrink-0">
              <ArrowUpDown className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-stone-200 text-stone-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-bold cursor-pointer transition-shadow"
              >
                <option value="levelDesc">레벨 순 (높은순)</option>
                <option value="levelAsc">레벨 순 (낮은순)</option>
                <option value="apDesc">행동력 순 (많은순)</option>
                <option value="apAsc">행동력 순 (적은순)</option>
                <option value="nameAsc">이름 순 (가나다)</option>
              </select>
            </div>

            <div className="relative w-full flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="유저 이름 또는 닉네임 검색..." 
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium transition-shadow" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-100 text-amber-900 font-black text-sm uppercase tracking-wider">
                  <th className="p-4 sm:p-5 whitespace-nowrap">디스코드 닉네임</th>
                  <th className="p-4 sm:p-5 text-center whitespace-nowrap">레벨 / EXP</th>
                  <th className="p-4 sm:p-5 text-center whitespace-nowrap">보유 행동력</th>
                  <th className="p-4 sm:p-5 text-right whitespace-nowrap">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-amber-600 font-bold animate-pulse">
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-stone-400 font-bold">
                      검색 조건에 일치하는 유저가 없습니다.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="p-4 sm:p-5 font-bold text-stone-800 whitespace-nowrap">
                        {user.guildNickname || user.name || user.globalName || '알 수 없음'}
                      </td>
                      <td className="p-4 sm:p-5 text-center whitespace-nowrap">
                        <span className="text-amber-600 font-black">Lv.{user.level}</span> <span className="text-xs text-stone-400">({user.exp}%)</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center font-bold whitespace-nowrap">
                        {user.ap} <span className="text-xs text-stone-400">/ {MAX_AP}</span>
                      </td>
                      <td className="p-4 sm:p-5 flex justify-end gap-1.5 sm:gap-2">
                        <button onClick={() => handleFillAp(user.id)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg shadow-sm tooltip transition-colors" title="AP 풀충전">
                          <Zap className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditLevel(user.id, user.level, user.guildNickname || user.name || user.globalName || '알 수 없음')} 
                          className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg shadow-sm tooltip transition-colors" title="레벨 직접 설정">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleResetMinigames(user.id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg shadow-sm tooltip transition-colors" title="미니게임 횟수 초기화">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        
                        <div className="w-px h-8 bg-stone-200 mx-1"></div>
                        
                        <button 
                          onClick={() => handleHardReset(user.id, user.guildNickname || user.name || user.id)} 
                          className="p-2 bg-orange-50 text-orange-500 hover:bg-orange-100 hover:text-orange-600 rounded-lg shadow-sm tooltip transition-colors" 
                          title="데이터 초기화 (Lv.1로 강등)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(user.id, user.guildNickname || user.name || user.id)} 
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg shadow-sm tooltip transition-colors" 
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
          
          {/* 테이블 하단 요약 */}
          {!isLoading && filteredAndSortedUsers.length > 0 && (
            <div className="bg-amber-50/30 p-4 sm:p-5 border-t border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-500 font-bold">
                총 <span className="text-amber-600 font-black">{filteredAndSortedUsers.length}</span>명 중{' '}
                <span className="text-stone-700 font-black">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-
                <span className="text-stone-700 font-black">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedUsers.length)}</span>명 표시
              </p>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${
                          currentPage === i + 1
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                            : 'bg-white border border-stone-200 text-stone-500 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}