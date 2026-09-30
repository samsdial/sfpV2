import type { AccountType, CategoryKind, TransactionType } from '@/generated/prisma/client';

export type TransactionListItem = {
  id: string;
  type: TransactionType;
  amount: bigint;
  date: string;
  description: string | null;
  merchant: string | null;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  tagNames: string[];
};

export type AccountSummary = {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: bigint;
  balance: bigint;
  currency: string;
  archived: boolean;
};

export type CategoryNode = {
  id: string;
  name: string;
  kind: CategoryKind;
  parentId: string | null;
  children: CategoryNode[];
};

export type RecordTransactionInput = {
  type: TransactionType;
  accountId: string;
  transferFromId?: string;
  categoryId?: string;
  amountCents: bigint;
  date: string;
  description?: string;
  merchant?: string;
  tagIds?: string[];
};
