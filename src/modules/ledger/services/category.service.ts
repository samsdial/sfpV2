import type { CategoryKind } from '@/generated/prisma/client';
import type { DbClient } from '@/modules/core';
import type { CategoryNode } from '../types';
import * as categoryRepo from '../repository/category.repository';

function buildTree(categories: Awaited<ReturnType<typeof categoryRepo.listCategories>>): CategoryNode[] {
  const byId = new Map<string, CategoryNode>();
  for (const c of categories) {
    byId.set(c.id, {
      id: c.id,
      name: c.name,
      kind: c.kind,
      parentId: c.parentId,
      children: [],
    });
  }
  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sort = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    for (const n of nodes) sort(n.children);
  };
  sort(roots);
  return roots;
}

export async function listCategoriesTree(
  userId: string,
  kind?: CategoryKind,
  tx?: DbClient,
): Promise<CategoryNode[]> {
  const rows = await categoryRepo.listCategories(userId, kind, tx);
  return buildTree(rows);
}

import { db } from '@/lib/db';

export async function listTags(userId: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.tag.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}
