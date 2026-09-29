'use server';

import { createAction } from '@/lib/action';
import { markLinePaidSchema, openPeriodSchema } from '../validators/monthly';
import { markPeriodLinePaid, openPeriod } from '../services/period.service';

export const openPeriodAction = createAction({
  schema: openPeriodSchema,
  revalidate: ['/mes'],
  handler: async (input, { user }) => {
    const period = await openPeriod(user.id, input.period);
    return { id: period!.id };
  },
});

export const markLinePaidAction = createAction({
  schema: markLinePaidSchema,
  revalidate: ['/mes', '/movimientos', '/'],
  handler: async (input, { user }) => {
    return markPeriodLinePaid(user.id, input);
  },
});
