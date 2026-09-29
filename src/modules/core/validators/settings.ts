import { z } from 'zod';

export const updateSettingsSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(60).optional(),
  savingsTargetRate: z
    .number()
    .min(0, 'Mínimo 0 %')
    .max(0.9, 'Máximo 90 %')
    .optional(),
  periodStartDay: z.number().int().min(1).max(28).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
