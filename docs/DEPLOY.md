# Deploy — SFP v2 (Hostinger)

## Requisitos

- Node.js 22+
- MySQL/MariaDB con base `sfp` (utf8mb4)
- Variables de entorno del `.env.example`

## Build en Hostinger

El script `npm run build` ejecuta:

1. `prisma migrate deploy`
2. `node scripts/maybe-seed.mjs` (solo si `RUN_SEED=true`)
3. `next build`

Arranque: `npm start` (puerto `PORT` del panel).

## Variables de producción

| Variable | Notas |
|---|---|
| `DATABASE_URL` | URL MySQL/MariaDB |
| `BETTER_AUTH_SECRET` | ≥ 32 caracteres |
| `BETTER_AUTH_URL` | URL pública HTTPS |
| `ALLOW_SIGNUP` | `true` solo para crear el primer usuario |
| `RUN_SEED` | `true` en el primer deploy con usuario creado |
| `TZ` | `America/Bogota` |

## Plan B (sin DB en build)

Habilitar MySQL remoto en hPanel y desde local:

```bash
DATABASE_URL=... npx prisma migrate deploy
DATABASE_URL=... RUN_SEED=true npx prisma db seed
```

## Verificación

- `GET /api/health` → `{ ok: true, db: "up", version, time }`
- Login y navegación del shell
- Checklist `docs/smoke/m0.md`
