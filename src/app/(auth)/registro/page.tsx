import { notFound } from 'next/navigation';
import { env } from '@/env';
import { RegistroForm } from '@/components/auth/registro-form';

export default function RegistroPage() {
  if (env.ALLOW_SIGNUP !== 'true') {
    notFound();
  }
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <RegistroForm />
    </div>
  );
}
