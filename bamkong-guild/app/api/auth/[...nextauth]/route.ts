// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { fetchGuildMembership } from '@/app/lib/discord';

export const dynamic = "force-dynamic"; 

// 서버 단(layout.tsx)에서 불러올 수 있도록 authOptions를 분리합니다.
export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: { params: { scope: 'identify' } },
    }),
  ],
  // secret: process.env.NEXTAUTH_SECRET || 'bamkong-fallback-secret',
  
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.discordId = account.providerAccountId;
        const membership = await fetchGuildMembership(account.providerAccountId);
        token.isBamkongMember = membership?.isMember ?? false;
        token.guildNickname = membership?.nickname ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).isBamkongMember = token.isBamkongMember;
        (session.user as any).id = token.discordId;
        (session.user as any).guildNickname = token.guildNickname || null;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };