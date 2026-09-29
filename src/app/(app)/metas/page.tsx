import { requireUser } from '@/lib/session';
import { listSavingsGoals, goalsCopy } from '@/modules/goals';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { EmptyState } from '@/components/shared/EmptyState';

export default async function MetasPage() {
  const user = await requireUser();
  const goals = await listSavingsGoals(user.id);

  return (
    <>
      <PageHeader title={goalsCopy.title} description="Metas de ahorro y aportes." />
      {goals.length === 0 ? (
        <EmptyState title={goalsCopy.empty} />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {goals.map((goal) => (
            <li key={goal.id} className="px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{goal.name}</span>
                <Money cents={goal.currentCents} tone="positive" />
              </div>
              <p className="text-muted-foreground">
                Meta: <Money cents={goal.targetCents} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
