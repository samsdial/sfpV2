import { notFound } from 'next/navigation';
import { Money } from '@/components/shared/Money';
import { Percent } from '@/components/shared/Percent';
import { StatusMessage } from '@/components/shared/StatusMessage';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function DevUiPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <>
      <PageHeader title="Design system (dev)" description="Componentes compartidos M0." />
      <div className="space-y-8">
        <section>
          <h2 className="mb-2 font-medium">Money</h2>
          <div className="flex gap-4">
            <Money cents={123456700n} tone="positive" />
            <Money cents={5000000n} tone="negative" />
          </div>
        </section>
        <section>
          <h2 className="mb-2 font-medium">Percent</h2>
          <Percent value={0.15} />
        </section>
        <section className="space-y-2">
          <StatusMessage level="good" title="Meta cumplida" />
          <StatusMessage level="warn" title="Cuidado con el presupuesto" />
          <StatusMessage level="bad" title="Gastos superan ingresos" />
        </section>
        <EmptyState title="Sin datos" description="Ejemplo de estado vacío." />
      </div>
    </>
  );
}
