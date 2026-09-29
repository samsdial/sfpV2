import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Level = 'good' | 'warn' | 'bad' | 'info';

const styles: Record<Level, { icon: typeof Info; className: string }> = {
  good: { icon: CheckCircle2, className: 'text-positive border-positive/30 bg-positive/5' },
  warn: { icon: AlertCircle, className: 'text-warning border-warning/30 bg-warning/5' },
  bad: { icon: AlertCircle, className: 'text-negative border-negative/30 bg-negative/5' },
  info: { icon: Info, className: 'text-foreground border-border bg-muted/40' },
};

export function StatusMessage({
  level,
  title,
  children,
  className,
}: {
  level: Level;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: tone } = styles[level];
  return (
    <div className={cn('flex gap-3 rounded-md border px-3 py-2 text-sm', tone, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        {title ? <p className="font-medium">{title}</p> : null}
        <p className={title ? 'text-muted-foreground' : undefined}>{children}</p>
      </div>
    </div>
  );
}
