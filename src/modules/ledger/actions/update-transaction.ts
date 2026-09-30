'use server';

import { createAction } from '@/lib/action';
import { updateTransactionSchema } from '../validators/transaction';
import { updateTransaction } from '../services/transaction.service';

export const updateTransactionAction = createAction({
  schema: updateTransactionSchema,
  revalidate: ['/', '/movimientos', '/cuentas'],
  handler: async (input, { user }) => {
    const { id, ...data } = input;
    await updateTransaction(user.id, id, data);
    return { id };
  },
});
