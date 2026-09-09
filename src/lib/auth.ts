import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/db';
import { FREE_EMAIL_DOMAINS } from '@/lib/constants';

function isWorkEmailServer(email: string): boolean {
  const domain = email.trim().split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.includes(domain);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Block non-work emails at the auth layer — not just the UI
      if (!user.email || !isWorkEmailServer(user.email)) {
        return false;
      }
      return true;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create Recruiter record when a new user signs up
      if (user.email) {
        await prisma.recruiter.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            email: user.email,
          },
        });
      }
    },
  },
  pages: {
    signIn: '/recruiter/signup',
    verifyRequest: '/recruiter/verify',
  },
};