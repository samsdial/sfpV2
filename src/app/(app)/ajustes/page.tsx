import { requireUser } from '@/lib/session';
import { getSettings } from '@/modules/core';
import { PageHeader } from '@/components/shared/PageHeader';
import { SettingsForm } from '@/components/app/settings-form';

export default async function AjustesPage() {
  const user = await requireUser();
  const settings = await getSettings(user.id);

  return (
    <>
      <PageHeader title="Ajustes" description="Preferencias personales y del ciclo mensual." />
      <SettingsForm
        initialName={user.name ?? ''}
        initialRate={Number(settings.savingsTargetRate)}
        initialStartDay={settings.periodStartDay}
      />
    </>
  );
}
