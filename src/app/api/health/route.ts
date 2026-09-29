import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import pkg from '../../../../package.json';

export async function GET() {
  let dbStatus: 'up' | 'down' = 'down';
  try {
    await db.$queryRaw`SELECT 1`;
    dbStatus = 'up';
  } catch {
    dbStatus = 'down';
  }

  return NextResponse.json({
    ok: dbStatus === 'up',
    db: dbStatus,
    version: pkg.version,
    time: new Date().toISOString(),
  });
}
