// app/components/NoticeToast.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const MESSAGES: Readonly<Record<string, string>> = {
  login: '디스코드 로그인 후 이용할 수 있어요! 🌰',
  'guild-only':
    '밤콩 길드원 확인에 실패했어요. 밤콩 디스코드 서버에 가입된 계정으로 다시 로그인해 주세요. 서버에 방금 들어왔다면 5분 뒤 다시 시도해 주세요!',
};

/** /?notice=... 로 들어왔을 때 안내 토스트를 한 번만 띄우고 주소를 정리 */
export default function NoticeToast() {
  const params = useSearchParams();
  const router = useRouter();
  const notice = params.get('notice');
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (!notice || shown.current === notice) return;
    const message = MESSAGES[notice];
    if (!message) return;

    shown.current = notice; // 개발 모드 StrictMode의 이중 실행으로 토스트가 두 번 뜨는 것 방지
    toast.error(message, { duration: 6000 });
    router.replace('/', { scroll: false }); // 주소창에서 ?notice 제거 → 새로고침해도 다시 안 뜸
  }, [notice, router]);

  return null;
}