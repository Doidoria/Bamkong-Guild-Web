// app/game/actions.ts
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function getGameSession() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}