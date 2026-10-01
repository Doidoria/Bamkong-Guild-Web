// app/lib/firebaseAdmin.ts
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // 환경변수에 "\n" 문자열로 저장된 줄바꿈을 실제 줄바꿈으로 복원
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin 환경변수가 설정되지 않았습니다.');
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

/** 호출 시점에 초기화 → 빌드 단계에서 환경변수가 없어도 에러가 나지 않음 */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}