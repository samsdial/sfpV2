import { requireUser } from '@/lib/session';
import { getSettings } from '@/modules/core';
import { listAssets, computeNetWorth, networthCopy } from '@/modules/networth';
import { today, periodOf } from '@/lib/dates';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';

export default async function PatrimonioPage() {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  const period = periodOf(today(), settings.periodStartDay);
  const [assets, { snapshot }] = await Promise.all([
    listAssets(user.id),
    computeNetWorth(user.id, period),
  ]);

  return (
    <>
      <PageHeader title={networthCopy.title} description="Activos y patrimonio neto." />
      <p className="mb-6 text-2xl font-medium">
        <Money cents={snapshot.netWorthCents} tone="auto" />
      </p>
      <section>
        <h2 className="mb-2 font-medium">{networthCopy.assets}</h2>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">{networthCopy.emptyAssets}</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {assets.map((asset) => (
              <li key={asset.id} className="flex justify-between px-4 py-2 text-sm">
                <span>{asset.name}</span>
                <Money cents={asset.valueCents} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
