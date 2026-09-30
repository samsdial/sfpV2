# SFP v2

Finanzas personales de Sergio — monolito modular Next.js 16 + Prisma 7 + Better Auth.

**Producción:** https://peru-cobra-411499.hostingersite.com/

## Versiones (septiembre 2026)

| Paquete | Versión |
|---|---|
| next | 16.3.7 |
| react | 19.2.8 |
| prisma / @prisma/client | 7.10.0 |
| better-auth | 1.7.6 |
| tailwindcss | 4.x |
| vitest | 3.2.7 |
| playwright | 1.63.0 |
| typescript | 5.x |
| node | ≥ 22 |

## Scripts

```bash
npm run dev          # desarrollo
npm run build        # migrate + maybe-seed + next build
npm run lint         # ESLint + boundaries
npm run typecheck    # tsc --noEmit
npm test             # Vitest unitarios
npm run test:e2e     # Playwright
npm run db:migrate   # prisma migrate dev
npm run db:seed      # taxonomía ledger
```

## Estructura

- `src/app/(auth)` — login / registro
- `src/app/(app)` — shell autenticado y rutas M0–M7
- `src/modules/*` — dominio por módulo (importar solo `index.ts`)
- `specs/` — documentación fuente de verdad

## Local

Base de datos con **Podman** (mismo `docker-compose.yml`):

```bash
# macOS: una vez, si el socket no responde
podman machine init    # solo la primera vez
podman machine start

podman compose up -d
cp .env.example .env     # si aún no tienes .env
npm install
npm run db:migrate       # aplica migraciones en `sfp`
npm run dev              # http://localhost:3000
```

Equivalente con Docker: `docker compose up -d`.

Primer usuario: `ALLOW_SIGNUP=true` en `.env`, registro en `/registro`, luego `ALLOW_SIGNUP=false`. Seed opcional: `npm run db:seed`.

Documentación de deploy: [docs/DEPLOY.md](docs/DEPLOY.md).
