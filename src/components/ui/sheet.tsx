'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  className,
  children,
  side = 'left',
  ...props
}: React.ComponentProps<typeof Dialog.Content> & { side?: 'left' | 'right' }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <Dialog.Content
        className={cn(
          'fixed z-50 flex h-full w-72 flex-col gap-4 border border-border bg-background p-4 shadow-lg transition ease-in-out',
          side === 'left' ? 'inset-y-0 left-0' : 'inset-y-0 right-0',
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1 text-left', className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title className={cn('text-lg font-semibold', className)} {...props} />;
}
