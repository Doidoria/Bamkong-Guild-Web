// app/admin/layout.tsx (새 파일)
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminSession();
  if (!admin) redirect('/');
  return <>{children}</>;
}