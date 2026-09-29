'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Tablero' },
  { href: '/movimientos', label: 'Movimientos' },
  { href: '/cuentas', label: 'Cuentas' },
  { href: '/presupuesto', label: 'Presupuesto' },
  { href: '/mes', label: 'Mes actual', dynamicPeriod: true },
  { href: '/deudas', label: 'Deudas' },
  { href: '/metas', label: 'Metas' },
  { href: '/patrimonio', label: 'Patrimonio' },
  { href: '/ajustes', label: 'Ajustes' },
];

export function AppNav({ currentPeriod }: { currentPeriod: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 text-sm">
      {links.map((link) => {
        const href = link.dynamicPeriod ? `/mes/${currentPeriod}` : link.href;
        const active =
          link.href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={href}
            className={cn(
              'rounded-md px-3 py-2 transition-colors hover:bg-muted',
              active && 'bg-muted font-medium text-foreground',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
