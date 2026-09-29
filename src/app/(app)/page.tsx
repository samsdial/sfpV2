import { requireUser } from '@/lib/session';
import { getDashboardSummary, dashboardCopy } from '@/modules/dashboard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const user = await requireUser();
  const summary = await getDashboardSummary(user.id);

  return (
    <>
      <PageHeader title={dashboardCopy.title} description={dashboardCopy.welcome} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Superávit presupuestado</CardTitle>
          </CardHeader>
          <CardContent>
            <Money cents={summary.budget.surplusCents} tone="auto" className="text-2xl" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Patrimonio neto</CardTitle>
          </CardHeader>
          <CardContent>
            <Money cents={summary.netWorth.netWorthCents} tone="auto" className="text-2xl" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Deuda en créditos</CardTitle>
          </CardHeader>
          <CardContent>
            <Money cents={summary.debts.totalLoanBalanceCents} tone="negative" className="text-2xl" />
          </CardContent>
        </Card>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-medium">{dashboardCopy.recentMovements}</h2>
        {summary.transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos recientes.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {summary.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  {tx.date} · {tx.description ?? tx.accountName}
                </span>
                <Money
                  cents={tx.type === 'EXPENSE' ? -tx.amount : tx.amount}
                  tone="auto"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
