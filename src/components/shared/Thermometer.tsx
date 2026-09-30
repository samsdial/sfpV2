import { cn } from '@/lib/utils';

export function Thermometer({
  value,
  thresholds = [0.8, 1],
  className,
}: {
  value: number;
  thresholds?: [number, number];
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value * 100));
  const [warnAt, badAt] = thresholds;
  const tone =
    value >= badAt ? 'bg-negative' : value >= warnAt ? 'bg-warning' : 'bg-positive';

  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div className={cn('h-full transition-all', tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}
