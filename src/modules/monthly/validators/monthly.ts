import { z } from 'zod';

const periodSchema = z.string().regex(/^\d{4}-\d{2}$/);

export const openPeriodSchema = z.object({
  period: periodSchema,
});

export const markLinePaidSchema = z.object({
  lineId: z.string().min(1),
  accountId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
