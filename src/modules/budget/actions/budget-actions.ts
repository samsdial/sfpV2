'use server';

import { createAction } from '@/lib/action';
import {
  deleteBudgetItemSchema,
  upsertBudgetExpenseSchema,
  upsertBudgetIncomeSchema,
} from '../validators/budget';
import * as repo from '../repository/budget.repository';

export const upsertBudgetIncomeAction = createAction({
  schema: upsertBudgetIncomeSchema,
  revalidate: ['/presupuesto', '/'],
  handler: async (input, { user }) => {
    const row = await repo.upsertIncome(user.id, input);
    return { id: row.id };
  },
});

export const upsertBudgetExpenseAction = createAction({
  schema: upsertBudgetExpenseSchema,
  revalidate: ['/presupuesto', '/'],
  handler: async (input, { user }) => {
    const row = await repo.upsertExpense(user.id, input);
    return { id: row.id };
  },
});

export const deleteBudgetItemAction = createAction({
  schema: deleteBudgetItemSchema,
  revalidate: ['/presupuesto', '/'],
  handler: async (input, { user }) => {
    if (input.kind === 'income') await repo.deleteIncome(user.id, input.id);
    else await repo.deleteExpense(user.id, input.id);
    return { deleted: true as const };
  },
});
