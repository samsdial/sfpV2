'use server';

import { createAction } from '@/lib/action';
import { updateAccountSchema } from '../validators/account';
import { updateAccount } from '../services/account.service';

export const updateAccountAction = createAction({
  schema: updateAccountSchema,
  revalidate: ['/cuentas', '/'],
  handler: async (input, { user }) => {
    await updateAccount(user.id, input);
    return { id: input.id };
  },
});
