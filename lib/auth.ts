import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('NextAuth authorize called with:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          console.log('Finding user...');
          
          // Dynamic import to avoid issues in API routes
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              player: {
                include: {
                  team: true
                }
              }
            }
          });

          console.log('User found:', !!user, user?.email, user?.role);

          if (!user) {
            console.log('User not found');
            return null;
          }

          if (!user.password) {
            console.log('User has no password');
            return null;
          }

          console.log('Comparing password...');
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log('Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('Invalid password');
            return null;
          }

          console.log('Login successful for:', user.email);
          const result = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            playerId: user.playerId,
            player: user.player
          };
          
          console.log('Returning user object:', result);
          await prisma.$disconnect();
          return result as any;
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.playerId = user.playerId;
        token.player = user.player;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.playerId = token.playerId as string;
        session.user.player = token.player as any;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt"
  }
};

export default authOptions;