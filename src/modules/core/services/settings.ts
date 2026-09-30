import { db } from '@/lib/db';
import type { UserSettings } from '@/generated/prisma/client';
import type { DbClient } from './transaction';

export async function getSettings(userId: string, tx?: DbClient): Promise<UserSettings> {
  const client = tx ?? db;
  const existing = await client.userSettings.findUnique({ where: { userId } });
  if (existing) return existing;
  return client.userSettings.create({
    data: { userId },
  });
}

export async function updateSettings(
  userId: string,
  data: {
    name?: string;
    savingsTargetRate?: number;
    periodStartDay?: number;
  },
  tx?: DbClient,
): Promise<UserSettings> {
  const client = tx ?? db;
  if (data.name !== undefined) {
    await client.user.update({
      where: { id: userId },
      data: { name: data.name },
    });
  }
  const settings = await getSettings(userId, client);
  return client.userSettings.update({
    where: { id: settings.id },
    data: {
      ...(data.savingsTargetRate !== undefined && {
        savingsTargetRate: data.savingsTargetRate,
      }),
      ...(data.periodStartDay !== undefined && { periodStartDay: data.periodStartDay }),
    },
  });
}
