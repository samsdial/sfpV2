'use client';

import { useState } from 'react';
import { parseCOP } from '@/lib/money';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function MoneyInput({
  name,
  defaultValue,
  className,
  onValue,
}: {
  name?: string;
  defaultValue?: string;
  className?: string;
  onValue?: (cents: bigint | null) => void;
}) {
  const [raw, setRaw] = useState(defaultValue ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleChange(v: string) {
    setRaw(v);
    const cents = parseCOP(v);
    if (v.trim() && cents === null) setError('Monto inválido');
    else setError(null);
    onValue?.(cents);
  }

  return (
    <div className={cn('space-y-1', className)}>
      <Input
        name={name}
        inputMode="decimal"
        placeholder="1.234.567"
        value={raw}
        onChange={(e) => handleChange(e.target.value)}
        aria-invalid={!!error}
      />
      {error ? <p className="text-xs text-negative">{error}</p> : null}
      <input type="hidden" name={`${name ?? 'amount'}Cents`} value={parseCOP(raw)?.toString() ?? ''} />
    </div>
  );
}
