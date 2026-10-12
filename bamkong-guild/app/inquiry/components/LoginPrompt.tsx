// app/inquiry/components/LoginPrompt.tsx
'use client';

import { signIn, signOut } from 'next-auth/react';
import { Lock } from 'lucide-react';

export default function LoginPrompt({ reason }: { reason: 'login' | 'not-member' }) {
  return (
    <div className="bg-white/90 border border-amber-200 rounded-[2rem] p-8 shadow-lg text-center space-y-4 max-w-md mx-auto mt-10">
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
        <Lock className="w-6 h-6" aria-hidden />
      </div>
      <h2 className="text-xl font-black text-stone-800">길드원 전용 문의함입니다</h2>

      {reason === 'login' ? (
        <>
          <p className="text-sm text-stone-600 break-keep">디스코드로 로그인하면 익명으로 문의를 남길 수 있어요.</p>
          <button
            type="button"
            onClick={() => signIn('discord', { callbackUrl: '/inquiry' })}
            className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            디스코드로 로그인
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-stone-600 break-keep">
            밤콩 디스코드 서버에 가입된 계정으로 로그인했는지 확인해 주세요. 서버에 방금 들어왔다면 5분 뒤 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/inquiry' })}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl transition-colors text-sm"
          >
            다른 계정으로 로그인하기
          </button>
        </>
      )}
    </div>
  );
}