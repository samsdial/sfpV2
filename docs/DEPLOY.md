# Deploy — SFP v2

## Base de datos local (Podman)

Motor objetivo en local: **MariaDB 11.4** (`mariadb:11.4` en [docker-compose.yml](../docker-compose.yml)).

```bash
podman machine start          # macOS, si hace falta
podman compose up -d
npm run db:migrate
```

Bases: `sfp` (dev), `sfp_test` (tests de integración). Charset `utf8mb4_unicode_ci`.

### Versión del motor (T-M0-03)

| Entorno | Motor | Versión | Fecha verificación | Verificado por |
|---------|--------|---------|-------------------|----------------|
| Local (Podman) | MariaDB | 11.4.x | — | Automático vía imagen |
| Producción (Hostinger) | MySQL o MariaDB | _Ejecutar `SELECT VERSION();` en phpMyAdmin_ | _Pendiente Sergio_ | _Pendiente_ |

Cuando Hostinger confirme la versión, alinear la imagen local si la familia difiere (mantener `provider = mysql` en Prisma).

## Build en Hostinger (Node.js Web Apps)

1. Conectar repositorio GitHub → rama `main`.
2. Node **22+**, build: `npm run build`, start: `npm start`.
3. Variables (ver [.env.example](../.env.example)):

| Variable | Notas |
|---|---|
| `DATABASE_URL` | URL MySQL/MariaDB (contraseña URL-encoded) |
| `BETTER_AUTH_SECRET` | ≥ 32 caracteres (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | URL pública `https://…` |
| `ALLOW_SIGNUP` | `true` solo para crear el primer usuario |
| `RUN_SEED` | `true` en el primer deploy **después** de crear usuario |
| `TZ` | `America/Bogota` |

4. Eliminar variables heredadas de Auth.js: `AUTH_SECRET`, `NEXTAUTH_*`, `AUTH_URL`.

### Primer deploy (checklist Dev A)

- [ ] Push a `main` dispara build
- [ ] `prisma migrate deploy` termina sin error en logs de build
- [ ] `ALLOW_SIGNUP=true` → crear usuario en `/registro`
- [ ] `ALLOW_SIGNUP=false` + redeploy → `/registro` responde 404
- [ ] `RUN_SEED=true` un deploy → taxonomía M1; luego `false`
- [ ] `GET /api/health` → `db: "up"` en HTTPS
- [ ] Marcar [docs/smoke/m0.md](./smoke/m0.md) sección **Producción**

## Plan B (build sin acceso a DB)

Habilitar MySQL remoto en hPanel y desde local:

```bash
DATABASE_URL="mysql://..." npx prisma migrate deploy
DATABASE_URL="mysql://..." RUN_SEED=true npx prisma db seed
```

Luego redeploy sin migrate en build (ajustar script temporalmente o usar migrate ya aplicado).

## Verificación

- `GET /api/health` → `{ ok: true, db: "up", version, time }`
- Login, shell, ajustes ([docs/smoke/m0.md](./smoke/m0.md))
- E2E: `npm run test:e2e` (local con app en marcha)
