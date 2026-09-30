'use client';

import { shiftPeriod } from '@/lib/dates';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function PeriodPicker({ value, basePath = '/mes' }: { value: string; basePath?: string }) {
  const prev = shiftPeriod(value, -1);
  const next = shiftPeriod(value, 1);

  return (
    <div className="inline-flex items-center gap-2">
      <Button variant="outline" size="icon" asChild aria-label="Periodo anterior">
        <Link href={`${basePath}/${prev}`}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      <span className="min-w-[5rem] text-center font-mono tabular-nums text-sm">{value}</span>
      <Button variant="outline" size="icon" asChild aria-label="Periodo siguiente">
        <Link href={`${basePath}/${next}`}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
