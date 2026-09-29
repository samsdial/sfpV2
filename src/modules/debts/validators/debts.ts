import { z } from 'zod';

export const upsertLoanSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  initialCents: z.coerce.bigint().nonnegative(),
  balanceCents: z.coerce.bigint().nonnegative(),
  monthlyPaymentCents: z.coerce.bigint().nonnegative(),
  annualRateEa: z.number().min(0).max(2),
});

export const upsertCreditCardSchema = z.object({
  id: z.string().optional(),
  accountId: z.string().min(1),
  creditLimitCents: z.coerce.bigint().positive(),
  cutDay: z.number().int().min(1).max(31),
  paymentDay: z.number().int().min(1).max(31),
  annualRateEa: z.number().min(0).max(2),
  usualPayment: z.string().max(120).optional(),
});
