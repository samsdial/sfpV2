import { db } from '@/lib/db';
import type { AccountType, FinancialAccount } from '@/generated/prisma';
import type { DbClient } from '@/modules/core';

function client(tx?: DbClient) {
  return tx ?? db;
}

export async function findAccountsByUser(
  userId: string,
  tx?: DbClient,
): Promise<FinancialAccount[]> {
  return client(tx).financialAccount.findMany({
    where: { userId },
    orderBy: [{ archived: 'asc' }, { name: 'asc' }],
  });
}

export async function findAccountById(
  userId: string,
  id: string,
  tx?: DbClient,
): Promise<FinancialAccount | null> {
  return client(tx).financialAccount.findFirst({
    where: { id, userId },
  });
}

export async function createAccount(
  userId: string,
  data: { name: string; type: AccountType; initialBalance: bigint },
  tx?: DbClient,
): Promise<FinancialAccount> {
  return client(tx).financialAccount.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      initialBalance: data.initialBalance,
    },
  });
}

export async function updateAccount(
  userId: string,
  id: string,
  data: { name?: string; archived?: boolean },
  tx?: DbClient,
): Promise<FinancialAccount> {
  const updated = await client(tx).financialAccount.updateMany({
    where: { id, userId },
    data,
  });
  if (updated.count === 0) throw new Error('El registro no existe');
  return client(tx).financialAccount.findFirstOrThrow({ where: { id, userId } });
}
