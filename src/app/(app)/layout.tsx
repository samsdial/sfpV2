import { requireUser } from '@/lib/session';
import { getSettings } from '@/modules/core';
import { today, periodOf } from '@/lib/dates';
import { AppShell } from '@/components/app/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  const currentPeriod = periodOf(today(), settings.periodStartDay);
  const userName = user.name?.trim() || user.email.split('@')[0] || 'Usuario';

  return (
    <AppShell userName={userName} currentPeriod={currentPeriod}>
      {children}
    </AppShell>
  );
}
