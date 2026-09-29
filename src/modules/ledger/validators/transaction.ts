import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

export const createTransactionSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    accountId: z.string().min(1),
    transferFromId: z.string().optional(),
    categoryId: z.string().optional(),
    amountCents: z.coerce.bigint().positive('El monto debe ser mayor que cero'),
    date: dateSchema,
    description: z.string().max(500).optional(),
    merchant: z.string().max(120).optional(),
    tagIds: z.array(z.string()).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'TRANSFER') {
      if (!val.transferFromId) {
        ctx.addIssue({
          code: 'custom',
          message: 'Indica la cuenta origen',
          path: ['transferFromId'],
        });
      } else if (val.transferFromId === val.accountId) {
        ctx.addIssue({
          code: 'custom',
          message: 'Origen y destino deben ser distintos',
          path: ['transferFromId'],
        });
      }
    }
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const listTransactionsSchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  limit: z.number().int().min(1).max(200).optional(),
});
