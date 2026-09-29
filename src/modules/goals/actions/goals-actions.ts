'use server';

import { createAction } from '@/lib/action';
import { addContributionSchema, upsertGoalSchema } from '../validators/goals';
import { registerContribution, saveGoal } from '../services/goals.service';

export const upsertGoalAction = createAction({
  schema: upsertGoalSchema,
  revalidate: ['/metas', '/'],
  handler: async (input, { user }) => {
    const row = await saveGoal(user.id, input);
    return { id: row.id };
  },
});

export const addContributionAction = createAction({
  schema: addContributionSchema,
  revalidate: ['/metas', '/movimientos', '/'],
  handler: async (input, { user }) => registerContribution(user.id, input),
});
