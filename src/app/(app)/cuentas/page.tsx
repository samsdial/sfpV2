import { requireUser } from '@/lib/session';
import { listAccounts, ledgerCopy } from '@/modules/ledger';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { EmptyState } from '@/components/shared/EmptyState';

export default async function CuentasPage() {
  const user = await requireUser();
  const accounts = await listAccounts(user.id);
  const active = accounts.filter((a) => !a.archived);

  return (
    <>
      <PageHeader title="Cuentas" description="Saldos por cuenta financiera." />
      {active.length === 0 ? (
        <EmptyState title={ledgerCopy.noAccounts} description={ledgerCopy.noAccountsHint} />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {active.map((acc) => (
            <li key={acc.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{acc.name}</p>
                <p className="text-sm text-muted-foreground">{acc.type}</p>
              </div>
              <Money cents={acc.balance} tone="auto" />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
