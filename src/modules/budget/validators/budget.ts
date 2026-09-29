import { z } from 'zod';
import { PERIODICITIES } from '@/modules/core';

export const upsertBudgetIncomeSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1).max(120),
  incomeType: z.enum(['FIXED', 'VARIABLE']).default('FIXED'),
  amountCents: z.coerce.bigint().nonnegative(),
});

export const upsertBudgetExpenseSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1),
  label: z.string().trim().min(1).max(120),
  amountCents: z.coerce.bigint().nonnegative(),
  periodicity: z.enum(PERIODICITIES).default('MONTHLY'),
  isFixed: z.boolean().default(true),
  paidByCard: z.boolean().default(false),
  isAntExpense: z.boolean().default(false),
});

export const deleteBudgetItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['income', 'expense']),
});
