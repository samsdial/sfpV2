'use client';

import { toast } from 'sonner';
import { createAccountAction } from '@/modules/ledger/actions/create-account';
import { parseCOP } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CreateAccountForm() {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '');
    const type = String(fd.get('type') ?? 'BANK') as
      | 'CASH'
      | 'BANK'
      | 'CREDIT_CARD'
      | 'SAVINGS'
      | 'INVESTMENT'
      | 'DIGITAL_WALLET';
    const initial = parseCOP(String(fd.get('initial') ?? '0')) ?? 0n;
    const result = await createAccountAction({
      name,
      type,
      initialBalanceCents: initial,
    });
    if (!result.ok) toast.error(result.error);
    else {
      toast.success('Cuenta creada');
      e.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mb-6 grid gap-3 rounded-md border border-border p-4 sm:grid-cols-4">
      <div>
        <Label htmlFor="acc-name">Nombre</Label>
        <Input id="acc-name" name="name" required />
      </div>
      <div>
        <Label htmlFor="acc-type">Tipo</Label>
        <select
          id="acc-type"
          name="type"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="BANK">Banco</option>
          <option value="CASH">Efectivo</option>
          <option value="CREDIT_CARD">Tarjeta</option>
          <option value="SAVINGS">Ahorro</option>
          <option value="INVESTMENT">Inversión</option>
          <option value="DIGITAL_WALLET">Billetera digital</option>
        </select>
      </div>
      <div>
        <Label htmlFor="acc-initial">Saldo inicial</Label>
        <Input id="acc-initial" name="initial" placeholder="0" />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">
          Crear cuenta
        </Button>
      </div>
    </form>
  );
}
