import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function getOptionalUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getOptionalUser();
  if (!user) redirect('/login');
  return user;
}
