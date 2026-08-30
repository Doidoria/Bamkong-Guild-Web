// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const dynamic = "force-dynamic"; 

// 서버 단(layout.tsx)에서 불러올 수 있도록 authOptions를 분리합니다.
export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: { params: { scope: 'identify guilds guilds.members.read' } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || 'bamkong-fallback-secret',
  
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        try {
          const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          });
          const guilds = await res.json();
          
          if (!Array.isArray(guilds)) {
            token.isBamkongMember = false;
            token.discordId = account.providerAccountId;
            return token; 
          }
          
          const BAMKONG_ID = process.env.NEXT_PUBLIC_BAMKONG_GUILD_ID;
          const isBamkongMember = guilds.some((guild: any) => guild.id === BAMKONG_ID);
          
          token.isBamkongMember = isBamkongMember;
          token.discordId = account.providerAccountId;

          // 권한이 추가되었으므로 이제 정상적으로 별명을 가져옵니다.
          if (isBamkongMember) {
            const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${BAMKONG_ID}/member`, {
              headers: { Authorization: `Bearer ${account.access_token}` },
            });
            
            if (memberRes.ok) {
              const memberData = await memberRes.json();
              token.guildNickname = memberData.nick; // 디스코드 API의 별명 키값은 'nick'
            } else {
              console.error('별명 가져오기 실패:', await memberRes.text());
            }
          }
        } catch (error) {
          token.isBamkongMember = false;
        }
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