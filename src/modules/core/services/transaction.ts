import { db } from '@/lib/db';
import type { PrismaClient, Prisma } from '@/generated/prisma/client';

export type DbClient = PrismaClient | Prisma.TransactionClient;

export async function withTransaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
  return db.$transaction(async (tx) => fn(tx));
}
