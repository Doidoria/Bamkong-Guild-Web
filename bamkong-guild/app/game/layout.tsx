// app/game/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route'; 

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.isBamkongMember) {
    redirect('/'); 
  }

  return <>{children}</>;
}