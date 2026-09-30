import { getSettings } from '@/modules/core';
import { getBudgetOverview } from '@/modules/budget';
import { getDebtsSummary } from '@/modules/debts';
import { listSavingsGoals } from '@/modules/goals';
import { listRecentTransactions, listAccounts } from '@/modules/ledger';
import { computeNetWorth } from '@/modules/networth';
import { getPeriodPlanVsReal } from '@/modules/monthly';
import { today, periodOf } from '@/lib/dates';

export async function getDashboardSummary(userId: string) {
  const settings = await getSettings(userId);
  const period = periodOf(today(), settings.periodStartDay);

  const [budget, transactions, accounts, goals, debts, networth, planVsReal] = await Promise.all([
    getBudgetOverview(userId),
    listRecentTransactions(userId, { limit: 10 }),
    listAccounts(userId),
    listSavingsGoals(userId),
    getDebtsSummary(userId),
    computeNetWorth(userId, period),
    getPeriodPlanVsReal(userId, period),
  ]);

  const alerts: { level: 'good' | 'warn' | 'bad'; title: string }[] = [];
  if (planVsReal.realExpenseCents > planVsReal.plannedExpenseCents && planVsReal.plannedExpenseCents > 0n) {
    alerts.push({ level: 'bad', title: 'Gastos del mes superan el presupuesto planificado.' });
  } else if (planVsReal.spendRatio >= 0.8) {
    alerts.push({ level: 'warn', title: 'Vas cerca del tope de gasto del mes.' });
  }
  if (budget.surplusCents < 0n) {
    alerts.push({ level: 'bad', title: 'El presupuesto mensual está en déficit.' });
  }

  return {
    period,
    settings,
    budget,
    transactions,
    accounts,
    goals,
    debts,
    netWorth: networth.snapshot,
    planVsReal,
    alerts,
  };
}
