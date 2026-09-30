import { requireUser } from '@/lib/session';
import { getDebtsSummary, debtsCopy } from '@/modules/debts';
import { PageHeader } from '@/components/shared/PageHeader';
import { Money } from '@/components/shared/Money';
import { LoanSimulator } from '@/components/debts/loan-simulator';

export default async function DeudasPage() {
  const user = await requireUser();
  const { loans, cards, totalLoanBalanceCents } = await getDebtsSummary(user.id);

  return (
    <>
      <PageHeader title={debtsCopy.title} description="Créditos y tarjetas." />
      <p className="mb-6 text-sm">
        Saldo total créditos: <Money cents={totalLoanBalanceCents} tone="negative" />
      </p>
      <section className="mb-8">
        <h2 className="mb-2 font-medium">{debtsCopy.loans}</h2>
        {loans.length === 0 ? (
          <p className="text-sm text-muted-foreground">{debtsCopy.emptyLoans}</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {loans.map((loan) => (
              <li key={loan.id} className="flex justify-between px-4 py-2 text-sm">
                <span>{loan.name}</span>
                <Money cents={loan.balanceCents} tone="negative" />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-2 font-medium">{debtsCopy.creditCards}</h2>
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">{debtsCopy.emptyCards}</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {cards.map((card) => (
              <li key={card.id} className="flex justify-between px-4 py-2 text-sm">
                <span>{card.account.name}</span>
                <span className="text-muted-foreground">Cupo {String(card.creditLimitCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <LoanSimulator />
      </section>
    </>
  );
}
