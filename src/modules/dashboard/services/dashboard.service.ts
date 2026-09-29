import { getSettings } from '@/modules/core';
import { getBudgetOverview } from '@/modules/budget';
import { getDebtsSummary } from '@/modules/debts';
import { listSavingsGoals } from '@/modules/goals';
import { listRecentTransactions, listAccounts } from '@/modules/ledger';
import { computeNetWorth } from '@/modules/networth';
import { today, periodOf } from '@/lib/dates';

export async function getDashboardSummary(userId: string) {
  const settings = await getSettings(userId);
  const period = periodOf(today(), settings.periodStartDay);

  const [budget, transactions, accounts, goals, debts, networth] = await Promise.all([
    getBudgetOverview(userId),
    listRecentTransactions(userId, { limit: 10 }),
    listAccounts(userId),
    listSavingsGoals(userId),
    getDebtsSummary(userId),
    computeNetWorth(userId, period),
  ]);

  return {
    period,
    settings,
    budget,
    transactions,
    accounts,
    goals,
    debts,
    netWorth: networth.snapshot,
  };
}
