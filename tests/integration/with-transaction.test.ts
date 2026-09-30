import { describe, expect, it } from 'vitest';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../src/generated/prisma/client';

const testUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL?.replace(/\/sfp(\?|$)/, '/sfp_test$1');

describe.runIf(!!testUrl)('withTransaction (sfp_test)', () => {
  it('rolls back when handler throws', async () => {
    const adapter = new PrismaMariaDb(testUrl!);
    const prisma = new PrismaClient({ adapter });

    const before = await prisma.verification.count();

    await expect(
      prisma.$transaction(async (tx) => {
        await tx.verification.create({
          data: {
            identifier: 'vitest-rollback',
            value: 'x',
            expiresAt: new Date(Date.now() + 60_000),
          },
        });
        throw new Error('force rollback');
      }),
    ).rejects.toThrow('force rollback');

    const after = await prisma.verification.count();
    expect(after).toBe(before);
    await prisma.$disconnect();
  });
});
