import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(['CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS', 'INVESTMENT', 'DIGITAL_WALLET']),
  initialBalanceCents: z.coerce.bigint(),
});

export const updateAccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80).optional(),
  archived: z.boolean().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
