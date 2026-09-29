import { z } from 'zod';

export const upsertGoalSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  goalType: z.string().default('OTHER'),
  targetCents: z.coerce.bigint().positive(),
  currentCents: z.coerce.bigint().nonnegative().optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const addContributionSchema = z.object({
  goalId: z.string().min(1),
  amountCents: z.coerce.bigint().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountId: z.string().min(1),
  note: z.string().max(300).optional(),
});
