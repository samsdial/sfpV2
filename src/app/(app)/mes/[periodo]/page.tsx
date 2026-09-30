import { requireUser } from '@/lib/session';
import { getPeriodDetail, getPeriodPlanVsReal, monthlyCopy, openPeriod } from '@/modules/monthly';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { Thermometer } from '@/components/shared/Thermometer';
import { PeriodPicker } from '@/components/shared/PeriodPicker';
import { Button } from '@/components/ui/button';

export default async function MesPage({ params }: { params: Promise<{ periodo: string }> }) {
  const { periodo } = await params;
  const user = await requireUser();
  const [period, comparison] = await Promise.all([
    getPeriodDetail(user.id, periodo),
    getPeriodPlanVsReal(user.id, periodo),
  ]);

  async function openPeriodFormAction() {
    'use server';
    await openPeriod(user.id, periodo);
  }

  return (
    <>
      <PageHeader
        title={`${monthlyCopy.title} ${periodo}`}
        description="Plan vs real y pagos fijos."
        actions={<PeriodPicker value={periodo} />}
      />
      <section className="mb-6 max-w-md">
        <Thermometer value={comparison.spendRatio} className="mb-2" />
        <p className="text-sm">
          Gastos reales <Money cents={comparison.realExpenseCents} tone="negative" /> / plan{' '}
          <Money cents={comparison.plannedExpenseCents} />
        </p>
      </section>
      {!period ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{monthlyCopy.noPeriod}</p>
          <form action={openPeriodFormAction}>
            <Button type="submit">{monthlyCopy.openPeriod}</Button>
          </form>
        </div>
      ) : period.lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">Periodo abierto sin líneas fijas.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {period.lines.map((line) => (
            <li key={line.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{line.label}</p>
                <p className="text-muted-foreground">
                  {line.paid ? monthlyCopy.linePaid : monthlyCopy.linePending}
                </p>
              </div>
              <Money cents={line.plannedCents} tone="negative" />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
