import { db } from '@/lib/db';
import type { Transaction, TransactionType } from '@/generated/prisma/client';
import type { DbClient } from '@/modules/core';

function client(tx?: DbClient) {
  return tx ?? db;
}

export type CreateTransactionRow = {
  type: TransactionType;
  accountId: string;
  transferFromId?: string | null;
  categoryId?: string | null;
  amount: bigint;
  date: Date;
  description?: string | null;
  merchant?: string | null;
  tagIds?: string[];
};

export async function createTransactionRow(
  userId: string,
  data: CreateTransactionRow,
  tx?: DbClient,
): Promise<Transaction> {
  const { tagIds, ...rest } = data;
  return client(tx).transaction.create({
    data: {
      userId,
      ...rest,
      ...(tagIds?.length
        ? {
            tags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
  });
}

export async function findTransactionById(userId: string, id: string, tx?: DbClient) {
  return client(tx).transaction.findFirst({
    where: { id, userId },
    include: { tags: true },
  });
}

export async function deleteTransactionRow(userId: string, id: string, tx?: DbClient) {
  await client(tx).transaction.deleteMany({ where: { id, userId } });
}

export async function updateTransactionRow(
  userId: string,
  id: string,
  data: Omit<CreateTransactionRow, 'tagIds'> & { tagIds?: string[] },
  tx?: DbClient,
) {
  const { tagIds, ...rest } = data;
  await client(tx).transactionTag.deleteMany({ where: { transactionId: id } });
  const owned = await client(tx).transaction.findFirst({ where: { id, userId } });
  if (!owned) throw new Error('El registro no existe');

  return client(tx).transaction.update({
    where: { id },
    data: {
      ...rest,
      ...(tagIds
        ? {
            tags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
  });
}

export async function listTransactions(
  userId: string,
  opts: {
    from?: Date;
    to?: Date;
    limit?: number;
    type?: TransactionType;
    accountId?: string;
    categoryId?: string;
  },
  tx?: DbClient,
) {
  return client(tx).transaction.findMany({
    where: {
      userId,
      ...(opts.type ? { type: opts.type } : {}),
      ...(opts.accountId ? { accountId: opts.accountId } : {}),
      ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts.from || opts.to
        ? {
            date: {
              ...(opts.from ? { gte: opts.from } : {}),
              ...(opts.to ? { lte: opts.to } : {}),
            },
          }
        : {}),
    },
    include: {
      account: { select: { name: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: opts.limit ?? 50,
  });
}

export async function sumByAccount(userId: string, tx?: DbClient) {
  return client(tx).transaction.groupBy({
    by: ['accountId', 'type'],
    where: { userId },
    _sum: { amount: true },
  });
}

export async function sumTransferOut(userId: string, tx?: DbClient) {
  return client(tx).transaction.groupBy({
    by: ['transferFromId'],
    where: { userId, type: 'TRANSFER', transferFromId: { not: null } },
    _sum: { amount: true },
  });
}
