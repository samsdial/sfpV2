import { toMonthly, type Periodicity } from '@/modules/core';
import type { DbClient } from '@/modules/core';
import * as repo from '../repository/budget.repository';

export async function getBudgetOverview(userId: string, tx?: DbClient) {
  const [incomes, expenses] = await Promise.all([
    repo.listIncome(userId, tx),
    repo.listExpenses(userId, tx),
  ]);

  const totalIncomeCents = incomes.reduce((s, i) => s + i.amountCents, 0n);
  const totalExpenseMonthlyCents = expenses.reduce(
    (s, e) => s + toMonthly(e.amountCents, e.periodicity as Periodicity),
    0n,
  );

  return {
    incomes,
    expenses,
    totalIncomeCents,
    totalExpenseMonthlyCents,
    surplusCents: totalIncomeCents - totalExpenseMonthlyCents,
  };
}

export { listIncome, listExpenses, upsertIncome, upsertExpense, deleteIncome, deleteExpense } from '../repository/budget.repository';
