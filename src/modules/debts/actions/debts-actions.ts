'use server';

import { createAction } from '@/lib/action';
import { upsertCreditCardSchema, upsertLoanSchema } from '../validators/debts';
import * as repo from '../repository/debts.repository';

export const upsertLoanAction = createAction({
  schema: upsertLoanSchema,
  revalidate: ['/deudas', '/'],
  handler: async (input, { user }) => {
    const row = await repo.upsertLoan(user.id, input);
    return { id: row.id };
  },
});

export const upsertCreditCardAction = createAction({
  schema: upsertCreditCardSchema,
  revalidate: ['/deudas', '/'],
  handler: async (input, { user }) => {
    const { listAccounts } = await import('@/modules/ledger');
    const accounts = await listAccounts(user.id);
    if (!accounts.some((a) => a.id === input.accountId)) {
      throw new Error('Cuenta no válida');
    }
    const row = await repo.upsertCreditCard(input);
    return { id: row.id };
  },
});
