import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  ALLOW_SIGNUP: z.enum(['true', 'false']),
  TZ: z.string().default('America/Bogota'),
  RUN_SEED: z.enum(['true', 'false']).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}

export const env = loadEnv();
