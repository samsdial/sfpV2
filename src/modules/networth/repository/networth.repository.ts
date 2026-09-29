import { db } from '@/lib/db';
import type { DbClient } from '@/modules/core';

function client(tx?: DbClient) {
  return tx ?? db;
}

export async function listAssets(userId: string, tx?: DbClient) {
  return client(tx).asset.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export async function upsertAsset(
  userId: string,
  data: {
    id?: string;
    name: string;
    assetType: string;
    valueCents: bigint;
    notes?: string;
  },
  tx?: DbClient,
) {
  const payload = {
    name: data.name,
    assetType: data.assetType,
    valueCents: data.valueCents,
    notes: data.notes ?? null,
  };
  if (data.id) {
    return client(tx).asset.update({ where: { id: data.id, userId }, data: payload });
  }
  return client(tx).asset.create({ data: { userId, ...payload } });
}

export async function upsertSnapshot(
  userId: string,
  data: {
    period: string;
    liquidCents: bigint;
    assetsCents: bigint;
    loansCents: bigint;
    netWorthCents: bigint;
  },
  tx?: DbClient,
) {
  return client(tx).netWorthSnapshot.upsert({
    where: { userId_period: { userId, period: data.period } },
    create: { userId, ...data },
    update: data,
  });
}

export async function getSnapshot(userId: string, period: string, tx?: DbClient) {
  return client(tx).netWorthSnapshot.findUnique({
    where: { userId_period: { userId, period } },
  });
}
