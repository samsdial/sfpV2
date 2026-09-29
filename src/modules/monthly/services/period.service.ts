import { withTransaction, type DbClient } from '@/modules/core';
import { getBudgetOverview } from '@/modules/budget';
import { recordTransaction } from '@/modules/ledger';
import * as repo from '../repository/period.repository';

export async function getPeriodDetail(userId: string, period: string, tx?: DbClient) {
  return repo.findPeriod(userId, period, tx);
}

export async function openPeriod(userId: string, period: string) {
  return withTransaction(async (tx) => {
    const existing = await repo.findPeriod(userId, period, tx);
    if (existing) return existing;

    const created = await repo.createPeriod(userId, period, tx);
    const budget = await getBudgetOverview(userId, tx);

    const lines = [
      ...budget.expenses
        .filter((e) => e.isFixed)
        .map((e) => ({
          categoryId: e.categoryId,
          label: e.label,
          lineType: 'FIXED_EXPENSE',
          plannedCents: e.amountCents,
        })),
    ];

    await repo.createPeriodLines(created.id, lines, tx);
    return repo.findPeriod(userId, period, tx);
  });
}

export async function markPeriodLinePaid(
  userId: string,
  input: { lineId: string; accountId: string; date: string },
) {
  return withTransaction(async (tx) => {
    const line = await repo.findLine(userId, input.lineId, tx);
    if (!line || line.paid) throw new Error('Línea no válida');

    const transaction = await recordTransaction(
      userId,
      {
        type: 'EXPENSE',
        accountId: input.accountId,
        categoryId: line.categoryId ?? undefined,
        amountCents: line.plannedCents,
        date: input.date,
        description: line.label,
      },
      tx,
    );

    await repo.markLinePaid(line.id, transaction.id, tx);
    return { transactionId: transaction.id };
  });
}
