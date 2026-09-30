import { requireUser } from '@/lib/session';
import { listRecentTransactions, ledgerCopy } from '@/modules/ledger';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { EmptyState } from '@/components/shared/EmptyState';
import { TransactionRowActions } from '@/components/ledger/transaction-row-actions';

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; type?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const transactions = await listRecentTransactions(user.id, {
    from: sp.from,
    to: sp.to,
    type: sp.type as 'INCOME' | 'EXPENSE' | 'TRANSFER' | undefined,
    limit: 100,
  });

  return (
    <>
      <PageHeader title="Movimientos" description="Libro de ingresos, gastos y transferencias." />
      <form className="mb-4 flex flex-wrap gap-2 text-sm" method="get">
        <input type="date" name="from" defaultValue={sp.from} className="rounded-md border border-border px-2 py-1" />
        <input type="date" name="to" defaultValue={sp.to} className="rounded-md border border-border px-2 py-1" />
        <select name="type" defaultValue={sp.type ?? ''} className="rounded-md border border-border px-2 py-1">
          <option value="">Todos</option>
          <option value="EXPENSE">Gastos</option>
          <option value="INCOME">Ingresos</option>
          <option value="TRANSFER">Transferencias</option>
        </select>
        <button type="submit" className="rounded-md border border-border px-3 py-1">
          Filtrar
        </button>
      </form>
      {transactions.length === 0 ? (
        <EmptyState title={ledgerCopy.noTransactions} description={ledgerCopy.noTransactionsHint} />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {transactions.map((tx) => (
            <li key={tx.id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto]">
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
              <TransactionRowActions id={tx.id} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
