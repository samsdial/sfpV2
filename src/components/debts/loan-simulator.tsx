'use client';

import { useMemo, useState } from 'react';
import Decimal from 'decimal.js';
import * as financeMath from '@/modules/core/domain/finance-math';
import { parseCOP, formatCOP } from '@/lib/money';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoanSimulator() {
  const [principalRaw, setPrincipalRaw] = useState('10000000');
  const [eaPct, setEaPct] = useState('24');
  const [months, setMonths] = useState('36');

  const result = useMemo(() => {
    const principal = parseCOP(principalRaw);
    if (!principal) return null;
    const ea = new Decimal(eaPct.replace(',', '.')).div(100);
    const im = financeMath.eaToMonthly(ea);
    const n = Number(months);
    if (!Number.isFinite(n) || n <= 0) return null;
    const payment = financeMath.loanPayment(new Decimal(principal.toString()).div(100), im, n);
    return { payment, im };
  }, [principalRaw, eaPct, months]);

  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="mb-3 font-medium">Simulador de cuota (sistema francés)</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Monto</Label>
          <Input value={principalRaw} onChange={(e) => setPrincipalRaw(e.target.value)} />
        </div>
        <div>
          <Label>Tasa E.A. (%)</Label>
          <Input value={eaPct} onChange={(e) => setEaPct(e.target.value)} />
        </div>
        <div>
          <Label>Plazo (meses)</Label>
          <Input value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
      </div>
      {result ? (
        <p className="mt-3 text-sm">
          Cuota mensual estimada:{' '}
          <strong>{formatCOP(BigInt(result.payment.mul(100).toFixed(0)))}</strong>
        </p>
      ) : null}
    </div>
  );
}
