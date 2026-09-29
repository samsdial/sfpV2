import { z } from 'zod';

export const upsertAssetSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  assetType: z.string().min(1).max(40),
  valueCents: z.coerce.bigint().nonnegative(),
  notes: z.string().max(500).optional(),
});

export const snapshotSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/),
});
