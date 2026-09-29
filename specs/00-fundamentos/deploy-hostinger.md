# Entornos y deploy — SFP v2

## 1. Entornos

| Entorno | Dónde | Base de datos | URL |
|---|---|---|---|
| Local | Máquina de Sergio | Docker (`docker-compose.yml`) | `http://localhost:3000` |
| Producción | Hostinger — Node.js Web Apps | Base de datos MySQL de Hostinger | Dominio o subdominio asignado (p. ej. `finanzas.<dominio>`) |

No hay staging en v2.0. Todo se valida en local antes de hacer merge a `main`.

## 2. Local

`docker-compose.yml` con un servicio de base de datos:

- **Imagen**: la misma familia y versión que producción (`mysql:8.x` o `mariadb:<versión>`), verificada en T-M0-03.
- **Bases**: `sfp` (desarrollo) y `sfp_test` (tests), creadas con un script en `docker/init/`.
- **Volumen** persistente con nombre y puerto `3306`.
- **Charset**: `utf8mb4` con collation `utf8mb4_unicode_ci`.

`.env.local` (no se commitea; existe `.env.example` commiteado con todas las claves):

```
DATABASE_URL="mysql://sfp:sfp@localhost:3306/sfp"
BETTER_AUTH_SECRET="<32+ caracteres aleatorios>"
BETTER_AUTH_URL="http://localhost:3000"
ALLOW_SIGNUP="true"
TZ="America/Bogota"
RUN_SEED="false"
# Solo en la máquina de desarrollo, opcional:
API_KEY_21ST=""
```

## 3. Producción en Hostinger

### 3.1 Modalidad

Se usa **Node.js Web Apps** de Hostinger (planes Business o Cloud) con **integración GitHub**:

- Cada push a `main` dispara un build y un deploy automático.
- Hostinger detecta Next.js y precarga la configuración de build (versión de Node, comando de build y archivo o comando de inicio).
- En estos planes **no se pueden ejecutar comandos npm por SSH**. Todo lo que deba correr en el servidor, como las migraciones y el seed, va dentro del **script de build**.
- Ya no se usa PM2 ni `deploy.sh` (eso era del spec v0.1, que asumía VPS). Si en el futuro se migra a VPS, se escribe un anexo aparte.

### 3.2 Scripts de `package.json` (contrato con Hostinger)

```json
{
  "scripts": {
    "dev": "next dev",
    "postinstall": "prisma generate",
    "build": "prisma migrate deploy && node scripts/maybe-seed.mjs && next build",
    "start": "next start -p ${PORT:-3000}",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- `scripts/maybe-seed.mjs` ejecuta el seed **solo si `RUN_SEED=true`**. El seed es idempotente, así que correrlo dos veces no duplica nada.
- Si Hostinger no permite que el build alcance la base de datos, hay un plan B documentado en `docs/DEPLOY.md`: habilitar "MySQL remoto" en hPanel para la IP de Sergio y correr `prisma migrate deploy` y el seed desde local, apuntando a producción.
- La IA ejecutora confirma en T-M0-13 qué comando de inicio espera el panel (preset de Next.js, `npm start` o archivo de entrada) y ajusta este contrato.

### 3.3 Variables de entorno en hPanel

Estado actual del panel (según captura del 29/09/2026) y acción a tomar:

| Variable | Estado | Acción |
|---|---|---|
| `MYSQL_DATABASE`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD` | Existen (las inyecta Hostinger al conectar la base de datos) | **Mantener.** La app no las lee directamente; sirven de referencia para armar `DATABASE_URL` |
| `DATABASE_URL` | Existe | **Mantener.** Formato `mysql://USER:PASSWORD@HOST:PORT/DATABASE`, con la contraseña **URL-encoded** si tiene caracteres especiales |
| `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_URL` | Existen (heredadas de Auth.js) | **Eliminar** al cerrar M0; no las usa Better Auth |
| `BETTER_AUTH_SECRET` | Falta | Crear: 32+ caracteres aleatorios (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Falta | Crear: URL pública con `https://` |
| `ALLOW_SIGNUP` | Falta | `"true"` solo para crear el usuario de Sergio; luego `"false"` y redeploy |
| `TZ` | Falta | `"America/Bogota"` |
| `RUN_SEED` | Falta | `"true"` solo en el deploy que debe sembrar; luego `"false"` |
| `NODE_ENV` | La define la plataforma | No tocar |

`src/env.ts` valida con Zod todas las variables requeridas al arrancar. Si falta una, el build falla con un mensaje claro.

### 3.4 Pool de conexiones

Los planes compartidos limitan las conexiones simultáneas por usuario de MySQL. El adaptador MariaDB se configura con `connectionLimit: 5`, y se usa un único `PrismaClient` por proceso (singleton en `src/lib/db.ts`).

### 3.5 Checklist previo (T-M0-13)

- [ ] El plan de Hostinger incluye Node.js Web Apps (Business o Cloud) y ofrece Node 22 LTS o superior.
- [ ] La base de datos está creada y se conoce el motor y la versión (`SELECT VERSION();`).
- [ ] El repo privado de GitHub está conectado a la app, con la rama `main`.
- [ ] El dominio o subdominio está apuntado y el SSL está activo.
- [ ] Las variables de la §3.3 están configuradas.
- [ ] El primer deploy es exitoso, `/api/health` responde `{"ok":true,"db":"up"}` y `/login` renderiza con el tema.

### 3.6 Rollback

- **Código**: redeploy de un commit anterior desde el panel, o `git revert` + push.
- **Base de datos**: las migraciones son **solo aditivas** mientras un módulo está en uso. Renombres y borrados se hacen en dos pasos (agregar → migrar datos → quitar en una versión posterior).
- **Backups**: activar los backups automáticos de la base de datos en hPanel, y exportar un `.sql` manual antes de cada migración de un módulo nuevo.
