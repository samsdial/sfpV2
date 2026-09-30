import 'server-only';

import { periodRange } from '@/lib/dates';
import { getSettings } from '@/modules/core';
import { getBudgetOverview } from '@/modules/budget';
import { listRecentTransactions } from '@/modules/ledger';
import { getPeriodDetail } from './period.service';

export async function getPeriodPlanVsReal(userId: string, period: string) {
  const settings = await getSettings(userId);
  const { from, to } = periodRange(period, settings.periodStartDay);
  const [budget, txs, periodDetail] = await Promise.all([
    getBudgetOverview(userId),
    listRecentTransactions(userId, { from, to, limit: 500 }),
    getPeriodDetail(userId, period),
  ]);

  const plannedExpenseCents = budget.totalExpenseMonthlyCents;
  const plannedIncomeCents = budget.totalIncomeCents;

  let realExpenseCents = 0n;
  let realIncomeCents = 0n;
  for (const tx of txs) {
    if (tx.type === 'EXPENSE') realExpenseCents += tx.amount;
    if (tx.type === 'INCOME') realIncomeCents += tx.amount;
  }

  const spendRatio =
    plannedExpenseCents > 0n
      ? Number(realExpenseCents) / Number(plannedExpenseCents)
      : 0;

  return {
    period,
    from,
    to,
    plannedIncomeCents,
    plannedExpenseCents,
    realIncomeCents,
    realExpenseCents,
    spendRatio,
    fixedLinesPaid: periodDetail?.lines.filter((l) => l.paid).length ?? 0,
    fixedLinesTotal: periodDetail?.lines.length ?? 0,
  };
}
