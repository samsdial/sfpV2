import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { getDashboardSummary, dashboardCopy } from '@/modules/dashboard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { StatusMessage } from '@/components/shared/StatusMessage';
import { Thermometer } from '@/components/shared/Thermometer';
import { PeriodPicker } from '@/components/shared/PeriodPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const user = await requireUser();
  const summary = await getDashboardSummary(user.id);

  return (
    <>
      <PageHeader
        title={dashboardCopy.title}
        description={dashboardCopy.welcome}
        actions={<PeriodPicker value={summary.period} />}
      />
      <div className="mb-6 space-y-2">
        {summary.alerts.map((a) => (
          <StatusMessage key={a.title} level={a.level} title={a.title} />
        ))}
      </div>
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Gasto del mes vs plan</h2>
        <Thermometer value={summary.planVsReal.spendRatio} className="mb-2 max-w-md" />
        <p className="text-sm">
          Real: <Money cents={summary.planVsReal.realExpenseCents} tone="negative" /> · Plan:{' '}
          <Money cents={summary.planVsReal.plannedExpenseCents} />
          {' · '}
          <Link href={`/mes/${summary.period}`} className="underline">
            Ver periodo
          </Link>
        </p>
      </section>
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
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-medium">Metas de ahorro</h2>
          {summary.goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin metas.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {summary.goals.slice(0, 5).map((g) => (
                <li key={g.id} className="flex justify-between px-4 py-2 text-sm">
                  <span>{g.name}</span>
                  <Money cents={g.currentCents} /> / <Money cents={g.targetCents} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
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
                  <Money cents={tx.type === 'EXPENSE' ? -tx.amount : tx.amount} tone="auto" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
