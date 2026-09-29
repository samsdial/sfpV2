import type { DbClient } from '@/modules/core';
import type { CreateAccountInput, UpdateAccountInput } from '../validators/account';
import type { AccountSummary } from '../types';
import * as accountRepo from '../repository/account.repository';
import { computeAccountBalances } from './balance.service';

export async function listAccounts(userId: string, tx?: DbClient): Promise<AccountSummary[]> {
  const accounts = await accountRepo.findAccountsByUser(userId, tx);
  const balances = await computeAccountBalances(userId, tx);
  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    initialBalance: a.initialBalance,
    balance: balances.get(a.id) ?? a.initialBalance,
    currency: a.currency,
    archived: a.archived,
  }));
}

export async function createAccount(userId: string, input: CreateAccountInput, tx?: DbClient) {
  return accountRepo.createAccount(
    userId,
    {
      name: input.name,
      type: input.type,
      initialBalance: input.initialBalanceCents,
    },
    tx,
  );
}

export async function updateAccount(userId: string, input: UpdateAccountInput, tx?: DbClient) {
  const existing = await accountRepo.findAccountById(userId, input.id, tx);
  if (!existing) throw new Error('El registro no existe');
  return accountRepo.updateAccount(
    userId,
    input.id,
    {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.archived !== undefined ? { archived: input.archived } : {}),
    },
    tx,
  );
}
