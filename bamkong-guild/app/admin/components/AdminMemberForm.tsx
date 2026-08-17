//app/admin/components/AdminMemberForm.tsx
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { getDaysSinceJoined } from '../utils';

interface Props { onAddMember: (member: any) => void; }

export default function AdminMemberForm({ onAddMember }: Props) {
  const [newNickname, setNewNickname] = useState('');
  const [newJoinedAt, setNewJoinedAt] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim()) return;

    const days = getDaysSinceJoined(newJoinedAt);
    const newMember = {
      nickname: newNickname, rank: '새싹', joined_at: newJoinedAt, warning_count: 0,
      is_on_break: false, promotion_status: days >= 30 ? '조건 충족' : '등업 대기',
      created_at: new Date().toISOString(),
    };
    onAddMember(newMember);
    setNewNickname('');
  };

  return (
    <div className="bg-stone-900 p-6 rounded-2xl shadow-lg border border-stone-800">
      <h2 className="text-lg font-bold text-stone-100 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-amber-500" /> 신규 길드원 수동 등록
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="테런 닉네임 입력"
          value={newNickname}
          onChange={(e) => setNewNickname(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium text-sm transition-all"
        />
        <input
          type="date"
          value={newJoinedAt}
          onChange={(e) => setNewJoinedAt(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium text-sm transition-all [color-scheme:dark]"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 transition-colors text-sm whitespace-nowrap"
        >
          길드원 등록
        </button>
      </form>
    </div>
  );
}