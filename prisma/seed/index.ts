import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../src/generated/prisma/client';
import { seedLedgerForUser } from './ledger.seed';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required for seed');

  const adapter = new PrismaMariaDb(url, { connectionLimit: 2 } as ConstructorParameters<
    typeof PrismaMariaDb
  >[1]);
  const db = new PrismaClient({ adapter });

  const users = await db.user.findMany({ select: { id: true, email: true } });
  if (users.length === 0) {
    console.log('Seed: no users yet — skip ledger taxonomy');
    await db.$disconnect();
    return;
  }

  for (const user of users) {
    await seedLedgerForUser(db, user.id);
    console.log(`Seed ledger OK for ${user.email}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
