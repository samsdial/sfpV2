# Cierre M0 — certificación

**Producción:** https://peru-cobra-411499.hostingersite.com/  
**Tag Git:** `m0`  
**Fecha cierre código/docs:** 2026-09-30

## Automático (verificado)

| Criterio | Evidencia |
|----------|-----------|
| Health HTTPS | `GET /api/health` → `db: "up"` |
| Proxy sin sesión | `/` → 307 `/login?next=/` |
| Next 16.3.7 + Prisma 7 | [README.md](../README.md), build Hostinger |
| Tests unitarios dominio | `npm test` (19+) |
| DEPLOY + smoke | [DEPLOY.md](./DEPLOY.md), [smoke/m0.md](./smoke/m0.md) |
| `/dev/ui` en prod | 404 (ruta pública sin auth, `NODE_ENV=production`) |

Script: `chmod +x scripts/verify-m0-prod.sh && ./scripts/verify-m0-prod.sh`

## Un paso manual obligatorio (Sergio)

En **hPanel → Node.js Web App → Environment variables**:

1. `ALLOW_SIGNUP` = `false`
2. Redeploy
3. Confirmar `/registro` → **404** (`verify-m0-prod.sh` debe salir 0)

Opcional recomendado:

- `RUN_SEED=true` → un deploy → `RUN_SEED=false` (taxonomía M1)
- phpMyAdmin: `SELECT VERSION();` → completar tabla en [DEPLOY.md](./DEPLOY.md)

## Smoke manual prod (Sergio)

Marcar en [smoke/m0.md](./smoke/m0.md): login, logout, ajustes, tema, navegación móvil.

## Tras completar

- Actualizar [specs/README.md](../specs/README.md) §6: M0 **Cerrado**
- Siguiente gate oficial: **M1** ([smoke/m1.md](./smoke/m1.md))
