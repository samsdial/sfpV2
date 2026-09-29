import { db } from '@/lib/db';
import type { DbClient } from '@/modules/core';

function client(tx?: DbClient) {
  return tx ?? db;
}

export async function findPeriod(userId: string, period: string, tx?: DbClient) {
  return client(tx).period.findUnique({
    where: { userId_period: { userId, period } },
    include: {
      lines: {
        include: { category: { select: { name: true } } },
        orderBy: { label: 'asc' },
      },
    },
  });
}

export async function createPeriod(userId: string, period: string, tx?: DbClient) {
  return client(tx).period.create({
    data: { userId, period, status: 'OPEN' },
  });
}

export async function createPeriodLines(
  periodId: string,
  lines: Array<{
    categoryId?: string | null;
    label: string;
    lineType: string;
    plannedCents: bigint;
  }>,
  tx?: DbClient,
) {
  if (!lines.length) return;
  await client(tx).periodLine.createMany({ data: lines.map((l) => ({ periodId, ...l })) });
}

export async function findLine(userId: string, lineId: string, tx?: DbClient) {
  return client(tx).periodLine.findFirst({
    where: { id: lineId, period: { userId } },
    include: { period: true },
  });
}

export async function markLinePaid(
  lineId: string,
  transactionId: string,
  tx?: DbClient,
) {
  return client(tx).periodLine.update({
    where: { id: lineId },
    data: { paid: true, transactionId },
  });
}
