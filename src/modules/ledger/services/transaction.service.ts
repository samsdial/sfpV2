import type { DbClient } from '@/modules/core';
import type { CreateTransactionInput } from '../validators/transaction';
import type { RecordTransactionInput, TransactionListItem } from '../types';
import * as accountRepo from '../repository/account.repository';
import * as categoryRepo from '../repository/category.repository';
import * as txRepo from '../repository/transaction.repository';

function toListItem(row: Awaited<ReturnType<typeof txRepo.listTransactions>>[number]): TransactionListItem {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    date: row.date.toISOString().slice(0, 10),
    description: row.description,
    merchant: row.merchant,
    accountId: row.accountId,
    accountName: row.account.name,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    tagNames: row.tags.map((t) => t.tag.name),
  };
}

export async function recordTransaction(
  userId: string,
  input: RecordTransactionInput,
  tx?: DbClient,
) {
  const account = await accountRepo.findAccountById(userId, input.accountId, tx);
  if (!account || account.archived) throw new Error('Cuenta no válida');

  if (input.transferFromId) {
    const from = await accountRepo.findAccountById(userId, input.transferFromId, tx);
    if (!from || from.archived) throw new Error('Cuenta origen no válida');
  }

  if (input.categoryId) {
    const cat = await categoryRepo.findCategoryById(userId, input.categoryId, tx);
    if (!cat) throw new Error('Categoría no válida');
  }

  return txRepo.createTransactionRow(
    userId,
    {
      type: input.type,
      accountId: input.accountId,
      transferFromId: input.transferFromId ?? null,
      categoryId: input.categoryId ?? null,
      amount: input.amountCents,
      date: new Date(input.date),
      description: input.description ?? null,
      merchant: input.merchant ?? null,
      tagIds: input.tagIds,
    },
    tx,
  );
}

export async function createTransaction(userId: string, input: CreateTransactionInput, tx?: DbClient) {
  return recordTransaction(
    userId,
    {
      type: input.type,
      accountId: input.accountId,
      transferFromId: input.transferFromId,
      categoryId: input.categoryId,
      amountCents: input.amountCents,
      date: input.date,
      description: input.description,
      merchant: input.merchant,
      tagIds: input.tagIds,
    },
    tx,
  );
}

export async function listRecentTransactions(
  userId: string,
  opts?: {
    from?: string;
    to?: string;
    limit?: number;
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    accountId?: string;
    categoryId?: string;
  },
  tx?: DbClient,
): Promise<TransactionListItem[]> {
  const rows = await txRepo.listTransactions(
    userId,
    {
      from: opts?.from ? new Date(opts.from) : undefined,
      to: opts?.to ? new Date(opts.to) : undefined,
      limit: opts?.limit,
      type: opts?.type,
      accountId: opts?.accountId,
      categoryId: opts?.categoryId,
    },
    tx,
  );
  return rows.map(toListItem);
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: CreateTransactionInput,
  tx?: DbClient,
) {
  const existing = await txRepo.findTransactionById(userId, id, tx);
  if (!existing) throw new Error('El registro no existe');

  if (input.categoryId) {
    const cat = await categoryRepo.findCategoryById(userId, input.categoryId, tx);
    if (!cat) throw new Error('Categoría no válida');
  }

  return txRepo.updateTransactionRow(
    userId,
    id,
    {
      type: input.type,
      accountId: input.accountId,
      transferFromId: input.transferFromId ?? null,
      categoryId: input.categoryId ?? null,
      amount: input.amountCents,
      date: new Date(input.date),
      description: input.description ?? null,
      merchant: input.merchant ?? null,
      tagIds: input.tagIds,
    },
    tx,
  );
}

export async function deleteTransaction(userId: string, id: string, tx?: DbClient) {
  const existing = await txRepo.findTransactionById(userId, id, tx);
  if (!existing) throw new Error('El registro no existe');
  await txRepo.deleteTransactionRow(userId, id, tx);
}
