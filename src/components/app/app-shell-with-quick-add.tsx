import { listAccounts, listCategoriesTree } from '@/modules/ledger';
import { AppShell } from '@/components/app/app-shell';

function flattenCategories(
  nodes: Awaited<ReturnType<typeof listCategoriesTree>>,
  prefix = '',
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const n of nodes) {
    const label = prefix ? `${prefix} › ${n.name}` : n.name;
    out.push({ id: n.id, label });
    if (n.children?.length) out.push(...flattenCategories(n.children, label));
  }
  return out;
}

export async function AppShellWithQuickAdd({
  userId,
  userName,
  currentPeriod,
  children,
}: {
  userId: string;
  userName: string;
  currentPeriod: string;
  children: React.ReactNode;
}) {
  const [accounts, expenseTree, incomeTree] = await Promise.all([
    listAccounts(userId),
    listCategoriesTree(userId, 'EXPENSE'),
    listCategoriesTree(userId, 'INCOME'),
  ]);

  const accountOptions = accounts.filter((a) => !a.archived).map((a) => ({ id: a.id, label: a.name }));
  const categoryOptions = [
    ...flattenCategories(expenseTree),
    ...flattenCategories(incomeTree),
  ];

  return (
    <AppShell
      userName={userName}
      currentPeriod={currentPeriod}
      quickAddAccounts={accountOptions}
      quickAddCategories={categoryOptions}
    >
      {children}
    </AppShell>
  );
}
