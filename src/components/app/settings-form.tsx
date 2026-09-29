'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { updateSettingsAction } from '@/modules/core/actions/update-settings';
import { savingsMessage } from '@/modules/core/domain/savings-message';
import { StatusMessage } from '@/components/shared/StatusMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SettingsForm({
  initialName,
  initialRate,
  initialStartDay,
}: {
  initialName: string;
  initialRate: number;
  initialStartDay: number;
}) {
  const [name, setName] = useState(initialName);
  const [ratePct, setRatePct] = useState(String(Math.round(initialRate * 1000) / 10));
  const [startDay, setStartDay] = useState(String(initialStartDay));
  const [saving, setSaving] = useState(false);

  const rate = Number(ratePct.replace(',', '.')) / 100;
  const message = savingsMessage(Number.isFinite(rate) ? rate : initialRate);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateSettingsAction({
      name,
      savingsTargetRate: Number(ratePct.replace(',', '.')) / 100,
      periodStartDay: Number(startDay),
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Ajustes guardados');
  }

  return (
    <form className="max-w-lg space-y-6" onSubmit={(e) => void onSubmit(e)}>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rate">Meta de ahorro (% del ingreso)</Label>
        <Input
          id="rate"
          inputMode="decimal"
          value={ratePct}
          onChange={(e) => setRatePct(e.target.value)}
        />
        <StatusMessage level={message.level === 'good' ? 'good' : message.level === 'warn' ? 'warn' : 'info'}>
          {message.text}
        </StatusMessage>
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDay">Día de inicio del periodo (1–28)</Label>
        <Input
          id="startDay"
          type="number"
          min={1}
          max={28}
          value={startDay}
          onChange={(e) => setStartDay(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Afecta cómo se agrupan los meses. Los periodos ya cerrados no cambian.
        </p>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar'}
      </Button>
    </form>
  );
}
