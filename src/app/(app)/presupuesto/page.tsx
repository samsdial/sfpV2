import { requireUser } from '@/lib/session';
import { getBudgetOverview, budgetCopy } from '@/modules/budget';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { toMonthly, type Periodicity } from '@/modules/core';

export default async function PresupuestoPage() {
  const user = await requireUser();
  const budget = await getBudgetOverview(user.id);

  return (
    <>
      <PageHeader title={budgetCopy.title} description="Ingresos y gastos normalizados al mes." />
      <div className="mb-6 flex gap-6 text-sm">
        <span>
          Ingresos: <Money cents={budget.totalIncomeCents} tone="positive" />
        </span>
        <span>
          Gastos (mes): <Money cents={budget.totalExpenseMonthlyCents} tone="negative" />
        </span>
      </div>
      <section className="mb-8">
        <h2 className="mb-2 font-medium">{budgetCopy.incomeSection}</h2>
        {budget.incomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{budgetCopy.emptyIncome}</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {budget.incomes.map((i) => (
              <li key={i.id} className="flex justify-between px-4 py-2 text-sm">
                <span>{i.label}</span>
                <Money cents={i.amountCents} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-2 font-medium">{budgetCopy.expenseSection}</h2>
        {budget.expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">{budgetCopy.emptyExpense}</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {budget.expenses.map((e) => (
              <li key={e.id} className="flex justify-between px-4 py-2 text-sm">
                <span>
                  {e.label} · {e.category.name}
                </span>
                <Money cents={toMonthly(e.amountCents, e.periodicity as Periodicity)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
