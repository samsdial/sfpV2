import type { DbClient } from '@/modules/core';
import * as repo from '../repository/debts.repository';

export async function getDebtsSummary(userId: string, tx?: DbClient) {
  const [loans, cards] = await Promise.all([
    repo.listLoans(userId, tx),
    repo.listCreditCards(userId, tx),
  ]);
  const totalLoanBalance = loans.reduce((s, l) => s + l.balanceCents, 0n);
  return { loans, cards, totalLoanBalanceCents: totalLoanBalance };
}

export { upsertLoan, upsertCreditCard, listLoans, listCreditCards } from '../repository/debts.repository';
