import type { DbClient } from '@/modules/core';
import * as accountRepo from '../repository/account.repository';
import * as txRepo from '../repository/transaction.repository';

export async function computeAccountBalances(
  userId: string,
  tx?: DbClient,
): Promise<Map<string, bigint>> {
  const accounts = await accountRepo.findAccountsByUser(userId, tx);
  const balances = new Map<string, bigint>(
    accounts.map((a) => [a.id, a.initialBalance]),
  );

  const sums = await txRepo.sumByAccount(userId, tx);
  for (const row of sums) {
    const prev = balances.get(row.accountId) ?? 0n;
    const amount = row._sum.amount ?? 0n;
    if (row.type === 'INCOME') {
      balances.set(row.accountId, prev + amount);
    } else if (row.type === 'EXPENSE') {
      balances.set(row.accountId, prev - amount);
    } else if (row.type === 'TRANSFER') {
      balances.set(row.accountId, prev + amount);
    }
  }

  const outflows = await txRepo.sumTransferOut(userId, tx);
  for (const row of outflows) {
    if (!row.transferFromId) continue;
    const prev = balances.get(row.transferFromId) ?? 0n;
    balances.set(row.transferFromId, prev - (row._sum.amount ?? 0n));
  }

  return balances;
}
