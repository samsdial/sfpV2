import { db } from '@/lib/db';
import type { Category, CategoryKind } from '@/generated/prisma/client';
import type { DbClient } from '@/modules/core';

function client(tx?: DbClient) {
  return tx ?? db;
}

export async function listCategories(
  userId: string,
  kind?: CategoryKind,
  tx?: DbClient,
): Promise<Category[]> {
  return client(tx).category.findMany({
    where: {
      userId,
      archived: false,
      ...(kind ? { kind } : {}),
    },
    orderBy: { name: 'asc' },
  });
}

export async function findCategoryById(
  userId: string,
  id: string,
  tx?: DbClient,
): Promise<Category | null> {
  return client(tx).category.findFirst({
    where: { id, userId, archived: false },
  });
}
