import { db } from '@/lib/db';
import type { DbClient } from '@/modules/core';

function client(tx?: DbClient) {
  return tx ?? db;
}

export async function listGoals(userId: string, tx?: DbClient) {
  return client(tx).savingsGoal.findMany({
    where: { userId },
    include: { contributions: { orderBy: { contributedAt: 'desc' }, take: 5 } },
    orderBy: { name: 'asc' },
  });
}

export async function upsertGoal(
  userId: string,
  data: {
    id?: string;
    name: string;
    goalType: string;
    targetCents: bigint;
    currentCents?: bigint;
    targetDate?: Date | null;
  },
  tx?: DbClient,
) {
  const payload = {
    name: data.name,
    goalType: data.goalType,
    targetCents: data.targetCents,
    ...(data.currentCents !== undefined ? { currentCents: data.currentCents } : {}),
    targetDate: data.targetDate ?? null,
  };
  if (data.id) {
    return client(tx).savingsGoal.update({ where: { id: data.id, userId }, data: payload });
  }
  return client(tx).savingsGoal.create({ data: { userId, ...payload } });
}

export async function addContribution(
  goalId: string,
  data: { amountCents: bigint; contributedAt: Date; transactionId?: string; note?: string },
  tx?: DbClient,
) {
  return client(tx).goalContribution.create({
    data: { goalId, ...data, note: data.note ?? null },
  });
}

export async function incrementGoalCurrent(goalId: string, delta: bigint, tx?: DbClient) {
  const goal = await client(tx).savingsGoal.findUniqueOrThrow({ where: { id: goalId } });
  return client(tx).savingsGoal.update({
    where: { id: goalId },
    data: { currentCents: goal.currentCents + delta },
  });
}
