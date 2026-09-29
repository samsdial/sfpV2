import { formatCOP } from '@/lib/money';
import { cn } from '@/lib/utils';

type Tone = 'positive' | 'negative' | 'neutral' | 'auto';

export function Money({
  cents,
  tone = 'auto',
  compact,
  className,
}: {
  cents: bigint;
  tone?: Tone;
  compact?: boolean;
  className?: string;
}) {
  const isNeg = cents < 0n;
  const color =
    tone === 'auto'
      ? isNeg
        ? 'text-negative'
        : cents > 0n
          ? 'text-positive'
          : 'text-foreground'
      : tone === 'positive'
        ? 'text-positive'
        : tone === 'negative'
          ? 'text-negative'
          : 'text-foreground';

  return (
    <span className={cn('font-mono tabular-nums', color, className)}>
      {formatCOP(cents, { sign: 'auto', compact })}
    </span>
  );
}
