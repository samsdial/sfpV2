import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/lib/db';

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'mysql' }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.ALLOW_SIGNUP !== 'true',
    minPasswordLength: 12,
  },
  user: {
    additionalFields: {},
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.userSettings.create({
            data: { userId: user.id },
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
