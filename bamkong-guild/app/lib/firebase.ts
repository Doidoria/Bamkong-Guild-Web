import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 아까 2단계에서 복사해둔 본인의 설정값을 아래에 붙여넣으세요!
const firebaseConfig = {
  apiKey: "AIzaSyDsak0k8TbKFvRowg04P-_ak_yz4tJK14M",
  authDomain: "bamkong-admin-544f6.firebaseapp.com",
  projectId: "bamkong-admin-544f6",
  storageBucket: "bamkong-admin-544f6.firebasestorage.app",
  messagingSenderId: "977907899587",
  appId: "1:977907899587:web:7a6deb7f4b2a9d3fc25676"
};

// Firebase 초기화 (이미 초기화되어 있으면 기존 것을 사용)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };