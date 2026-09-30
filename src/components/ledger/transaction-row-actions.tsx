'use client';

import { toast } from 'sonner';
import { deleteTransactionAction } from '@/modules/ledger/actions/delete-transaction';
import { Button } from '@/components/ui/button';

export function TransactionRowActions({ id }: { id: string }) {
  async function onDelete() {
    if (!confirm('¿Eliminar este movimiento?')) return;
    const result = await deleteTransactionAction({ id });
    if (!result.ok) toast.error(result.error);
    else toast.success('Movimiento eliminado');
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => void onDelete()}>
      Eliminar
    </Button>
  );
}
