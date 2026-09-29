'use server';

import { createAction } from '@/lib/action';
import { updateSettingsSchema } from '../validators/settings';
import { updateSettings } from '../services/settings';

export const updateSettingsAction = createAction({
  schema: updateSettingsSchema,
  revalidate: ['/', '/ajustes'],
  handler: async (input, { user }) => {
    await updateSettings(user.id, input);
    return { saved: true as const };
  },
});
