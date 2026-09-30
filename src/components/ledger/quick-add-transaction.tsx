'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createTransactionAction } from '@/modules/ledger/actions/create-transaction';
import { ledgerCopy } from '@/modules/ledger/copy';
import { today } from '@/lib/dates';
import { parseCOP } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type Option = { id: string; label: string };

export function QuickAddTransaction({
  accounts,
  expenseCategories,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  accounts: Option[];
  expenseCategories: Option[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [transferFromId, setTransferFromId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = useCallback(() => {
    setAmountRaw('');
    setDescription('');
    setDate(today());
    setCategoryId('');
    setTransferFromId('');
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'n' || e.key === 'N') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        reset();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, reset, setOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amountCents = parseCOP(amountRaw);
    if (!amountCents || amountCents <= 0n) {
      toast.error('Indica un monto válido');
      return;
    }
    if (!accountId) {
      toast.error('Selecciona una cuenta');
      return;
    }
    setSaving(true);
    const result = await createTransactionAction({
      type,
      accountId,
      transferFromId: type === 'TRANSFER' ? transferFromId : undefined,
      categoryId: categoryId || undefined,
      amountCents,
      date,
      description: description || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(ledgerCopy.saved);
    reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{ledgerCopy.quickAddTitle}</SheetTitle>
        </SheetHeader>
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="qa-type">Tipo</Label>
            <select
              id="qa-type"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Ingreso</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>
          {type === 'TRANSFER' ? (
            <div>
              <Label htmlFor="qa-from">Cuenta origen</Label>
              <select
                id="qa-from"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={transferFromId}
                onChange={(e) => setTransferFromId(e.target.value)}
              >
                <option value="">—</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <Label htmlFor="qa-account">{type === 'TRANSFER' ? 'Cuenta destino' : 'Cuenta'}</Label>
            <select
              id="qa-account"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          {type !== 'TRANSFER' ? (
            <div>
              <Label htmlFor="qa-cat">Categoría</Label>
              <select
                id="qa-cat"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">—</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <Label htmlFor="qa-amount">Monto</Label>
            <Input
              id="qa-amount"
              value={amountRaw}
              onChange={(e) => setAmountRaw(e.target.value)}
              placeholder="1.234.567"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="qa-date">Fecha</Label>
            <Input
              id="qa-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="qa-desc">Descripción</Label>
            <Input
              id="qa-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
