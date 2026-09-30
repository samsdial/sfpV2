'use server';

import { createAction } from '@/lib/action';
import { deleteTransactionSchema } from '../validators/transaction';
import { deleteTransaction } from '../services/transaction.service';

export const deleteTransactionAction = createAction({
  schema: deleteTransactionSchema,
  revalidate: ['/', '/movimientos', '/cuentas'],
  handler: async (input, { user }) => {
    await deleteTransaction(user.id, input.id);
    return { ok: true as const };
  },
});
