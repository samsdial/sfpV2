'use server';

import { createAction } from '@/lib/action';
import { createAccountSchema } from '../validators/account';
import { createAccount } from '../services/account.service';

export const createAccountAction = createAction({
  schema: createAccountSchema,
  revalidate: ['/cuentas', '/'],
  handler: async (input, { user }) => {
    const account = await createAccount(user.id, input);
    return { id: account.id };
  },
});
