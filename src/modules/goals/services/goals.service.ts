import { withTransaction } from '@/modules/core';
import { recordTransaction } from '@/modules/ledger';
import type { DbClient } from '@/modules/core';
import * as repo from '../repository/goals.repository';

export async function listSavingsGoals(userId: string, tx?: DbClient) {
  return repo.listGoals(userId, tx);
}

export async function saveGoal(
  userId: string,
  input: {
    id?: string;
    name: string;
    goalType: string;
    targetCents: bigint;
    currentCents?: bigint;
    targetDate?: string;
  },
  tx?: DbClient,
) {
  return repo.upsertGoal(
    userId,
    {
      ...input,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    },
    tx,
  );
}

export async function registerContribution(
  userId: string,
  input: {
    goalId: string;
    amountCents: bigint;
    date: string;
    accountId: string;
    note?: string;
  },
) {
  return withTransaction(async (tx) => {
    const transaction = await recordTransaction(
      userId,
      {
        type: 'EXPENSE',
        accountId: input.accountId,
        amountCents: input.amountCents,
        date: input.date,
        description: input.note ?? 'Aporte a meta',
      },
      tx,
    );

    await repo.addContribution(
      input.goalId,
      {
        amountCents: input.amountCents,
        contributedAt: new Date(input.date),
        transactionId: transaction.id,
        note: input.note,
      },
      tx,
    );

    await repo.incrementGoalCurrent(input.goalId, input.amountCents, tx);
    return { transactionId: transaction.id };
  });
}
