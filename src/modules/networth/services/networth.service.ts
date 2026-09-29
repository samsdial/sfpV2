import type { DbClient } from '@/modules/core';
import { listAccounts } from '@/modules/ledger';
import { getDebtsSummary } from '@/modules/debts';
import * as repo from '../repository/networth.repository';

export async function listAssets(userId: string, tx?: DbClient) {
  return repo.listAssets(userId, tx);
}

export async function computeNetWorth(userId: string, period: string, tx?: DbClient) {
  const [accounts, assets, debts] = await Promise.all([
    listAccounts(userId, tx),
    repo.listAssets(userId, tx),
    getDebtsSummary(userId, tx),
  ]);

  const liquidCents = accounts
    .filter((a) => !a.archived && a.type !== 'CREDIT_CARD')
    .reduce((s, a) => s + a.balance, 0n);

  const creditCardDebt = accounts
    .filter((a) => a.type === 'CREDIT_CARD')
    .reduce((s, a) => s + (a.balance < 0n ? -a.balance : 0n), 0n);

  const assetsCents = assets.reduce((s, a) => s + a.valueCents, 0n);
  const loansCents: bigint = debts.totalLoanBalanceCents + creditCardDebt;
  const netWorthCents = liquidCents + assetsCents - loansCents;

  const snapshot = await repo.upsertSnapshot(
    userId,
    {
      period,
      liquidCents,
      assetsCents,
      loansCents,
      netWorthCents,
    },
    tx,
  );

  return { snapshot, accounts, assets, debts };
}

export { upsertAsset } from '../repository/networth.repository';
