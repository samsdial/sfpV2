import { db } from '@/lib/db';
import type { DbClient } from '@/modules/core';

function client(tx?: DbClient) {
  return tx ?? db;
}

export async function listIncome(userId: string, tx?: DbClient) {
  return client(tx).budgetIncome.findMany({
    where: { userId },
    orderBy: { label: 'asc' },
  });
}

export async function listExpenses(userId: string, tx?: DbClient) {
  return client(tx).budgetExpense.findMany({
    where: { userId },
    include: { category: { select: { name: true, kind: true } } },
    orderBy: { label: 'asc' },
  });
}

export async function upsertIncome(
  userId: string,
  data: { id?: string; label: string; incomeType: string; amountCents: bigint },
  tx?: DbClient,
) {
  if (data.id) {
    return client(tx).budgetIncome.update({
      where: { id: data.id, userId },
      data: {
        label: data.label,
        incomeType: data.incomeType,
        amountCents: data.amountCents,
      },
    });
  }
  return client(tx).budgetIncome.create({
    data: {
      userId,
      label: data.label,
      incomeType: data.incomeType,
      amountCents: data.amountCents,
    },
  });
}

export async function upsertExpense(
  userId: string,
  data: {
    id?: string;
    categoryId: string;
    label: string;
    amountCents: bigint;
    periodicity: string;
    isFixed: boolean;
    paidByCard: boolean;
    isAntExpense: boolean;
  },
  tx?: DbClient,
) {
  if (data.id) {
    return client(tx).budgetExpense.update({
      where: { id: data.id, userId },
      data: {
        categoryId: data.categoryId,
        label: data.label,
        amountCents: data.amountCents,
        periodicity: data.periodicity,
        isFixed: data.isFixed,
        paidByCard: data.paidByCard,
        isAntExpense: data.isAntExpense,
      },
    });
  }
  return client(tx).budgetExpense.create({
    data: { userId, ...data },
  });
}

export async function deleteIncome(userId: string, id: string, tx?: DbClient) {
  await client(tx).budgetIncome.delete({ where: { id, userId } });
}

export async function deleteExpense(userId: string, id: string, tx?: DbClient) {
  await client(tx).budgetExpense.delete({ where: { id, userId } });
}
