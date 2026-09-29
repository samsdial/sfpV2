'use server';

import { createAction } from '@/lib/action';
import { snapshotSchema, upsertAssetSchema } from '../validators/networth';
import { computeNetWorth, upsertAsset } from '../services/networth.service';

export const upsertAssetAction = createAction({
  schema: upsertAssetSchema,
  revalidate: ['/patrimonio', '/'],
  handler: async (input, { user }) => {
    const row = await upsertAsset(user.id, input);
    return { id: row.id };
  },
});

export const computeNetWorthAction = createAction({
  schema: snapshotSchema,
  revalidate: ['/patrimonio', '/'],
  handler: async (input, { user }) => {
    const result = await computeNetWorth(user.id, input.period);
    return { netWorthCents: result.snapshot.netWorthCents.toString() };
  },
});
