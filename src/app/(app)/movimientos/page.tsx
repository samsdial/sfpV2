import { requireUser } from '@/lib/session';
import { listRecentTransactions, ledgerCopy } from '@/modules/ledger';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { EmptyState } from '@/components/shared/EmptyState';

export default async function MovimientosPage() {
  const user = await requireUser();
  const transactions = await listRecentTransactions(user.id, { limit: 50 });

  return (
    <>
      <PageHeader title="Movimientos" description="Libro de ingresos, gastos y transferencias." />
      {transactions.length === 0 ? (
        <EmptyState title={ledgerCopy.noTransactions} description={ledgerCopy.noTransactionsHint} />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {transactions.map((tx) => (
            <li key={tx.id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">{tx.description ?? tx.merchant ?? tx.type}</p>
                <p className="text-muted-foreground">
                  {tx.date} · {tx.accountName}
                  {tx.categoryName ? ` · ${tx.categoryName}` : ''}
                </p>
              </div>
              <Money
                cents={tx.type === 'EXPENSE' ? -tx.amount : tx.amount}
                className="sm:text-right"
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
