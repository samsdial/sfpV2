if (process.env.RUN_SEED === 'true') {
  const { execSync } = await import('node:child_process');
  console.log('RUN_SEED=true — running prisma db seed');
  execSync('npx prisma db seed', { stdio: 'inherit' });
} else {
  console.log('RUN_SEED is not true — skipping seed');
}
