'use client';

import { Menu, Plus } from 'lucide-react';
import { QuickAddTransaction } from '@/components/ledger/quick-add-transaction';
import { ledgerCopy } from '@/modules/ledger/copy';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { AppNav } from '@/components/app/app-nav';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function AppShell({
  userName,
  currentPeriod,
  quickAddAccounts = [],
  quickAddCategories = [],
  children,
}: {
  userName: string;
  currentPeriod: string;
  quickAddAccounts?: { id: string; label: string }[];
  quickAddCategories?: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  const { setTheme } = useTheme();
  const router = useRouter();

  async function logout() {
    await authClient.signOut();
    router.push('/login');
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-4">
      <div className="px-2 pt-1">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          SFP
        </Link>
      </div>
      <AppNav currentPeriod={currentPeriod} />
      <div className="mt-auto">
        <Separator className="mb-3" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-3">
              {userName}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme('light')}>Tema claro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>Tema oscuro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>Tema del sistema</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void logout()}>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card p-4 md:block">{sidebar}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir menú">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>SFP</SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>
          <span className="font-semibold">SFP</span>
          <div className="ml-auto">
            <QuickAddTransaction
              accounts={quickAddAccounts}
              expenseCategories={quickAddCategories}
              trigger={
                <Button size="icon" variant="outline" title={ledgerCopy.quickAddTooltip}>
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </header>
        <div className="hidden items-center justify-end gap-2 border-b border-border px-6 py-2 md:flex">
          <QuickAddTransaction
            accounts={quickAddAccounts}
            expenseCategories={quickAddCategories}
            trigger={
              <Button size="sm" variant="outline" title={ledgerCopy.quickAddTooltip}>
                <Plus className="mr-1 h-4 w-4" />
                Registrar
              </Button>
            }
          />
        </div>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
