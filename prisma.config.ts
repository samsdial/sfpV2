import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // @ts-expect-error Prisma 7 config typings lag seed block
  seed: {
    command: 'tsx prisma/seed/index.ts',
  },
});
