import type { ZodType } from 'zod';
import { fail, ok, type Result } from '@/lib/result';
import { getOptionalUser } from '@/lib/session';
import { Prisma } from '@/generated/prisma';

type User = { id: string; email: string; name: string | null };

function prismaErrorMessage(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') return 'Ya existe un registro con ese nombre';
    if (e.code === 'P2025') return 'El registro no existe';
  }
  return 'No se pudo completar la operación';
}

export function createAction<I, O>(opts: {
  schema: ZodType<I>;
  revalidate?: string[];
  handler: (input: I, ctx: { user: User }) => Promise<O>;
}) {
  return async (input: I): Promise<Result<O>> => {
    const user = await getOptionalUser();
    if (!user) return fail('Sesión expirada');

    const parsed = opts.schema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || '_form';
        fieldErrors[key] = issue.message;
      }
      return fail('Revisa los campos marcados', fieldErrors);
    }

    try {
      const data = await opts.handler(parsed.data, { user });
      if (opts.revalidate?.length) {
        const { revalidatePath } = await import('next/cache');
        for (const path of opts.revalidate) {
          revalidatePath(path);
        }
      }
      return ok(data);
    } catch (e) {
      console.error(e);
      return fail(prismaErrorMessage(e));
    }
  };
}
