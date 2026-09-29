'use server';

import { createAction } from '@/lib/action';
import { createTransactionSchema } from '../validators/transaction';
import { createTransaction } from '../services/transaction.service';

export const createTransactionAction = createAction({
  schema: createTransactionSchema,
  revalidate: ['/', '/movimientos', '/cuentas'],
  handler: async (input, { user }) => {
    const tx = await createTransaction(user.id, input);
    return { id: tx.id };
  },
});
