import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
