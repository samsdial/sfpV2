import { requireUser } from '@/lib/session';
import { getSettings } from '@/modules/core';
import { today, periodOf } from '@/lib/dates';
import { AppShellWithQuickAdd } from '@/components/app/app-shell-with-quick-add';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  const currentPeriod = periodOf(today(), settings.periodStartDay);
  const userName = user.name?.trim() || user.email.split('@')[0] || 'Usuario';

  return (
    <AppShellWithQuickAdd userId={user.id} userName={userName} currentPeriod={currentPeriod}>
      {children}
    </AppShellWithQuickAdd>
  );
}
