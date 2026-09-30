# M0 — Núcleo

**Estado**: listo para revisión
**Depende de**: —
**Lo usan**: todos los módulos
**Tag al cerrar**: `m0`

---

## 1. Objetivo

Dejar el proyecto listo para construir módulos. Al terminar M0 deben cumplirse cinco cosas:

1. Sergio entra con su usuario en producción (Hostinger) y ve el shell de la app con navegación hacia todos los módulos. Los módulos aún vacíos muestran un estado "en construcción".
2. Existen y están probadas las librerías compartidas que todos los módulos usarán: dinero, fechas, periodicidad y matemática financiera.
3. El design system está instalado con los tokens y los componentes compartidos.
4. El esqueleto de carpetas de todos los módulos existe, con las reglas de dependencia forzadas por lint.
5. Cada push a `main` despliega solo.

## 2. Alcance

**Incluye**
- Inicialización del proyecto Next.js 16.3 y del tooling (ESLint, Prettier, Vitest, Playwright, CI).
- Base de datos local con Docker (mismo motor que producción).
- Prisma 7: configuración, adaptador MariaDB, esquema multiarchivo, singleton, primera migración.
- Autenticación de un solo usuario con Better Auth (login, logout, registro controlado por variable).
- Modelo `UserSettings` y página `/ajustes`.
- Librerías: `money`, `dates`, `result`, `action`, `session`, `env`, periodicidad y matemática financiera.
- Design system: shadcn/ui, tokens, fuentes, tema claro/oscuro y componentes compartidos.
- Shell: layout autenticado, sidebar, rutas placeholder de M1–M7 y botón de quick-add global (deshabilitado hasta M1).
- Esqueleto `src/modules/*` y reglas de dependencia en ESLint.
- Infraestructura de seed (orquestador + `RUN_SEED`).
- Deploy en Hostinger, `docs/DEPLOY.md`, ruta `/api/health` y smoke test.

**No incluye**
- Ninguna entidad financiera (cuentas, movimientos, presupuesto…).
- Recuperación de contraseña, 2FA, correos y multiusuario.

## 3. Dependencias

Ninguna. Ver `00-fundamentos/*` para stack, arquitectura y convenciones.

## 4. Historias de usuario

- **US-M0-01**: Como Sergio, quiero crear mi usuario una única vez y que después nadie más pueda registrarse.
- **US-M0-02**: Como Sergio, quiero iniciar y cerrar sesión, y que cualquier ruta de la app me mande a `/login` si no tengo sesión.
- **US-M0-03**: Como Sergio, quiero configurar mi nombre, mi meta de ahorro (% del ingreso) y el día de inicio de mi periodo mensual en `/ajustes`.
- **US-M0-04**: Como Sergio, quiero ver la navegación completa de la app aunque los módulos todavía no estén hechos, para entender hacia dónde va.
- **US-M0-05**: Como Sergio, quiero que la app funcione igual de bien en tema claro y oscuro, en escritorio y en celular.

## 5. Reglas de negocio y fórmulas (librerías compartidas)

### 5.1 Periodicidad (`src/modules/core/domain/periodicity.ts`)

Enum compartido por presupuesto (M2), deudas (M4) y futuros recurrentes.

| Valor | Etiqueta UI | Factor → mensual |
|---|---|---|
| `DAILY` | Diario | 365 / 12 (≈ 30,4167) |
| `WEEKLY` | Semanal | 52 / 12 (≈ 4,3333) |
| `BIWEEKLY` | Quincenal | 2 |
| `MONTHLY` | Mensual | 1 |
| `BIMONTHLY` | Bimestral | 1 / 2 |
| `QUARTERLY` | Trimestral | 1 / 3 |
| `FOUR_MONTHLY` | Cuatrimestral | 1 / 4 |
| `SEMIANNUAL` | Semestral | 1 / 6 |
| `ANNUAL` | Anual | 1 / 12 |

```ts
toMonthly(amountCents: bigint, p: Periodicity): bigint
// Decimal(amount) × factor → redondeo a peso entero (ROUND_HALF_UP) → centavos
```

**Diferencia deliberada con la plantilla Excel** (decisión D-07): el Excel usa ×30 para diario y ×4 para semanal; SFP usa 365/12 y 52/12.

### 5.2 Matemática financiera (`src/modules/core/domain/finance-math.ts`)

Todas las funciones trabajan con `Decimal` y son puras.

```ts
eaToMonthly(ea: Decimal): Decimal
// im = (1 + ea)^(1/12) − 1

monthlyToEa(im: Decimal): Decimal
// ea = (1 + im)^12 − 1

futureValue(pv: Decimal, pmt: Decimal, im: Decimal, n: number): Decimal
// FV = pv·(1+im)^n + pmt·((1+im)^n − 1)/im      (si im = 0: pv + pmt·n)

requiredMonthlyContribution(fv: Decimal, pv: Decimal, im: Decimal, n: number): Decimal
// PMT = (fv − pv·(1+im)^n) · im / ((1+im)^n − 1)   (si im = 0: (fv − pv)/n)
// Si el resultado es < 0 → 0 (la meta ya se cumple con lo ahorrado).
// n ≤ 0 → error de dominio.

loanPayment(principal: Decimal, im: Decimal, n: number): Decimal
// cuota = P·im / (1 − (1+im)^−n)                   (si im = 0: P/n)

amortizationSchedule(principal: Decimal, im: Decimal, n: number, extra?: Decimal): Row[]
// Row = { k, payment, interest, capital, balance }
// Sistema francés (cuota fija). Última cuota ajusta el residuo de redondeo a 0.
// `extra` = abono extra mensual a capital (reduce plazo).
```

Tests obligatorios:

- casos con tasa 0;
- ida y vuelta entre `eaToMonthly` y `monthlyToEa` con error menor a 1e-10;
- una cuota conocida (p. ej. $10.000.000 al 24% E.A. a 36 meses), verificada contra una calculadora bancaria;
- que el saldo final de la tabla de amortización sea exactamente 0.

### 5.3 Fechas (`src/lib/dates.ts`)

```ts
today(): string                                   // "YYYY-MM-DD" en Bogotá
periodOf(date: string, startDay: number): string  // "YYYY-MM" del periodo que contiene la fecha
periodRange(period: string, startDay: number): { from: string; to: string }  // inclusive
daysLeftInPeriod(period: string, startDay: number): number
shiftPeriod(period: string, delta: number): string
formatDate(date: string, style: 'short' | 'long' | 'input'): string   // locale es
```

Regla del día de inicio (`startDay` entre 1 y 28):

- Con `startDay = 1`, el periodo `2026-09` va del 1 al 30 de septiembre.
- Con `startDay = 15`, el periodo `2026-09` va del 15 de septiembre al 14 de octubre. El periodo se nombra por el mes en que **empieza**.
- Se limita a 28 para evitar ambigüedades con meses cortos.

Tests: fin de mes, febrero, cambio de año y `startDay` distinto de 1.

### 5.4 Dinero (`src/lib/money.ts`)

API definida en `convenciones.md §3`. Tests: parseo de formatos (`1.234.567`, `$1.234.567`, `46,9k`, `8M`, entradas inválidas), formato de negativos y ceros, redondeo.

## 6. Modelo de datos

`prisma/schema/_base.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../../src/generated/prisma"
}

datasource db {
  provider = "mysql"
}
```

La URL va en `prisma.config.ts`, que apunta al **directorio** `prisma/schema`, a las migraciones en `prisma/migrations` y al seed con `tsx prisma/seed/index.ts`. La IA ejecutora ajusta las rutas relativas a lo que exija la versión instalada de Prisma 7.

`prisma/schema/auth.prisma`: generado por el CLI de Better Auth (modelos `User`, `Session`, `Account`, `Verification`) con proveedor `mysql`. Se agrega a `User` la relación `settings UserSettings?`.

`prisma/schema/core.prisma`:

```prisma
model UserSettings {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  currency          String   @default("COP") @db.Char(3)
  timezone          String   @default("America/Bogota") @db.VarChar(64)
  savingsTargetRate Decimal  @default(0.15) @db.Decimal(9, 6)   // meta de ahorro: fracción del ingreso
  periodStartDay    Int      @default(1)                         // 1..28 — ver D-09
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

Se crea un `UserSettings` con valores por defecto automáticamente la primera vez que el usuario inicia sesión (hook `databaseHooks.user.create.after` de Better Auth, o creación perezosa en `getSettings`).

Migración inicial: `npx prisma migrate dev --name m0_core`.

## 7. API pública y Server Actions

### `src/lib/*` (transversal)

```ts
// session.ts
requireUser(): Promise<{ id: string; email: string; name: string | null }>  // redirige a /login si no hay sesión (en páginas); en actions lo usa createAction
getOptionalUser(): Promise<... | null>

// action.ts
createAction<I, O>(opts: {
  schema: ZodType<I>;
  revalidate?: string[];
  handler: (input: I, ctx: { user: User }) => Promise<O>;
}): (input: I) => Promise<Result<O>>

// db.ts
export const db: PrismaClient   // singleton con PrismaMariaDb(DATABASE_URL, connectionLimit 5)
```

### `src/modules/core/index.ts`

```ts
export type { Periodicity } from './domain/periodicity';
export { PERIODICITIES, toMonthly } from './domain/periodicity';
export * as financeMath from './domain/finance-math';
export { withTransaction, type DbClient } from './services/transaction';
export { getSettings } from './services/settings';          // (userId) → UserSettings (crea si no existe)
```

### Server Actions (`src/modules/core/actions/`)

| Action | Entrada (Zod) | Efecto | Revalida |
|---|---|---|---|
| `updateSettingsAction` | `{ name?: string(1..60), savingsTargetRate?: number(0..0.9), periodStartDay?: int(1..28) }` | Actualiza `User.name` y `UserSettings` | `/`, `/ajustes` |

El cambio de `periodStartDay` muestra una advertencia en UI: "Afecta cómo se agrupan los meses. Los periodos ya cerrados no cambian." (el cierre de periodos llega en M3).

## 8. Rutas y UI

### 8.1 Autenticación (Better Auth)

- `src/lib/auth.ts`:
  - `betterAuth({...})` con `prismaAdapter(db, { provider: 'mysql' })`;
  - `emailAndPassword: { enabled: true, disableSignUp: env.ALLOW_SIGNUP !== 'true', minPasswordLength: 12 }`;
  - plugin `nextCookies()` (debe ser el último de la lista de plugins).
- `src/lib/auth-client.ts`: `createAuthClient()`.
- `src/app/api/auth/[...all]/route.ts`: `export const { GET, POST } = toNextJsHandler(auth)`.
- `src/proxy.ts`:
  - si no hay cookie de sesión (`getSessionCookie`) y la ruta no es `/login`, `/registro`, `/api/auth/*` ni `/api/health`, redirige a `/login?next=<ruta>`;
  - si hay cookie y la ruta es `/login`, redirige a `/`.
- `(app)/layout.tsx` llama `requireUser()`: esta es la verificación real.
- `/login`: email + contraseña, error genérico ("Correo o contraseña incorrectos"), Enter envía, y tras el login redirige a `next` o `/`.
- `/registro`: solo existe si `ALLOW_SIGNUP=true`; si no, responde 404. Pide nombre, email y contraseña (mínimo 12 caracteres) y crea el usuario.
- Logout en el menú de usuario del sidebar.

La IA ejecutora verifica en la documentación vigente de Better Auth los nombres exactos de imports y opciones antes de implementar.

### 8.2 Shell `(app)/layout.tsx`

```
┌──────────────┬──────────────────────────────────────────────────┐
│ SFP          │  PageHeader (título de la sección)   [+ Registrar]│
│              │──────────────────────────────────────────────────│
│ Tablero      │                                                  │
│ Movimientos  │                 contenido de la ruta             │
│ Cuentas      │                                                  │
│ Presupuesto  │                                                  │
│ Mes actual   │                                                  │
│ Deudas       │                                                  │
│ Metas        │                                                  │
│ Patrimonio   │                                                  │
│ ──────────── │                                                  │
│ Ajustes      │                                                  │
│ Sergio  ▾    │  (menú: tema claro/oscuro, cerrar sesión)        │
└──────────────┴──────────────────────────────────────────────────┘
```

- Sidebar de shadcn: colapsable en escritorio y en `Sheet` en móvil (botón hamburguesa).
- El enlace "Mes actual" apunta a `/mes/<periodo actual>`, calculado con `periodOf(today(), periodStartDay)`.
- El botón global "+ Registrar" (atajo `N`) queda visible pero deshabilitado con tooltip "Disponible con M1". M1 lo habilita.
- Cada ruta de M1–M7 renderiza `<EmptyState title="Módulo en construcción" description="Llega en M#: <nombre>">`.

### 8.3 `/ajustes`

Formulario con tres campos:

- **Nombre**.
- **Meta de ahorro**: input de porcentaje. Muestra en vivo el mensaje motivacional de la plantilla (ver tabla abajo).
- **Día de inicio del periodo**: select de 1 a 28, con la advertencia de la §7.

Mensaje motivacional según la meta de ahorro (adaptado del Excel, sin emojis, con `<StatusMessage>`):

| Rango | Nivel | Texto |
|---|---|---|
| ≤ 5 % | warn | Podrías ahorrar más. Revisa tus gastos y ajusta tu plan. |
| 5–10 % | info | Es un porcentaje aceptable. Mantén la disciplina para lograrlo. |
| 10–15 % | good | Buena meta de ahorro. Tu yo del futuro te lo va a agradecer. |
| 15–25 % | good | Muy bien: es un nivel de ahorro ideal. |
| > 25 % | good | Excelente. El siguiente paso es poner ese ahorro a rendir. |

Los límites de cada rango son inclusivos por arriba, como en el Excel. Esta función vive en `core/domain/savings-message.ts` porque M2 y M7 la reutilizan.

### 8.4 `/api/health`

Responde `GET → { ok: true, db: "up" | "down", version: <package.json version>, time: <ISO> }`. Hace un `SELECT 1` y no requiere auth. No expone secretos.

## 9. Tareas ejecutables

**T-M0-01 — Inicializar repositorio**
- `npx create-next-app@latest sfp-v2` con TypeScript, ESLint, Tailwind, App Router, `src/` y alias `@/*`.
- Verificar que quedó Next 16.3.x (mínimo 16.3.7).
- `tsconfig`: `strict`, `noUncheckedIndexedAccess`.
- `.nvmrc` con 22 y `engines.node >= 22`.
- `.gitignore` con `.env*` (excepto `.env.example`), `src/generated/`, `playwright-report/` y `test-results/`.
- Repo privado en GitHub, commit inicial y copia de la carpeta `specs/` al repo.

**T-M0-02 — Tooling**
- Prettier + `prettier-plugin-tailwindcss`.
- Vitest (entorno node para `domain/` y `lib/`).
- Playwright.
- Scripts de `deploy-hostinger.md §3.2`.

**T-M0-03 — Base de datos local**
- Consultar en phpMyAdmin de producción `SELECT VERSION();` y registrar el resultado en `docs/DEPLOY.md`.
- `docker-compose.yml` con la imagen equivalente, bases `sfp` y `sfp_test`, y `utf8mb4`.
- `.env.example` completo.

**T-M0-04 — Prisma 7**
- Instalar `prisma`, `@prisma/client`, `@prisma/adapter-mariadb`, `mariadb`, `dotenv` y `tsx`.
- `prisma.config.ts` y esquema multiarchivo (`_base.prisma`, `core.prisma`).
- `src/lib/db.ts` con singleton (patrón `globalThis` en dev) y `connectionLimit: 5`.
- Verificar que las columnas `BigInt` se leen como `bigint` en TypeScript.

**T-M0-05 — Variables de entorno**
- `src/env.ts` con Zod: `DATABASE_URL`, `BETTER_AUTH_SECRET` (min 32), `BETTER_AUTH_URL` (url), `ALLOW_SIGNUP` (enum "true"/"false"), `TZ`.
- Si falta alguna, falla al arrancar y al hacer build.

**T-M0-06 — Librerías compartidas + tests**
- `lib/result.ts`, `lib/money.ts`, `lib/dates.ts`.
- `modules/core/domain/periodicity.ts`, `finance-math.ts` y `savings-message.ts`.
- Tests según §5.

**T-M0-07 — Autenticación**
- Better Auth según §8.1.
- Generar `auth.prisma` con su CLI.
- Migración `m0_core` (auth + `UserSettings`).
- `lib/session.ts` y `lib/action.ts`.
- Páginas `/login` y `/registro`, y `proxy.ts`.

**T-M0-08 — Design system**
- `shadcn init` y primitivas de `ui-design-system.md §1`.
- Tokens semánticos y fuentes.
- next-themes y Toaster.
- Componentes compartidos de `ui-design-system.md §5`, con una página interna `/dev/ui` (solo en desarrollo) que los muestre todos.

**T-M0-09 — Shell y ajustes**
- `(app)/layout.tsx` con sidebar y menú de usuario.
- Rutas placeholder de M1–M7.
- `/ajustes` completo con `updateSettingsAction`.

**T-M0-10 — Esqueleto de módulos y límites**
- Crear `src/modules/{core,ledger,budget,monthly,debts,goals,networth,dashboard}` con la anatomía de `arquitectura.md §3` (`index.ts` vacío con comentario).
- Configurar las reglas de ESLint de `arquitectura.md §4`.
- Añadir un test de lint que falle a propósito para demostrar que la regla funciona, y luego eliminarlo.

**T-M0-11 — Transacciones entre módulos**
- `withTransaction` y tipo `DbClient` en core.
- Test de integración contra `sfp_test` que haga rollback al lanzar un error.

**T-M0-12 — Infraestructura de seed**
- `prisma/seed/index.ts` como orquestador que llama los seeds de módulos registrados (vacío por ahora).
- `scripts/maybe-seed.mjs` (corre solo si `RUN_SEED=true`).

**T-M0-13 — Deploy en Hostinger**
- Checklist de `deploy-hostinger.md §3.5`.
- Conectar el repo y configurar las variables de §3.3.
- Primer deploy y crear el usuario de Sergio con `ALLOW_SIGNUP=true`.
- Después: `ALLOW_SIGNUP=false`, borrar las variables heredadas de Auth.js y redeploy.
- Escribir `docs/DEPLOY.md` con el procedimiento real, incluidas capturas o notas del panel.

**T-M0-14 — CI**
- `.github/workflows/ci.yml`: install, `prisma generate`, lint, typecheck y test, en cada PR y push a `main`.

**T-M0-15 — Smoke test**
- Escribir `docs/smoke/m0.md` (login, logout, protección de rutas, `/registro` en 404, ajustes guardan, tema claro/oscuro, navegación en móvil, `/api/health`) y pasarlo en producción.
- E2E Playwright: login → ajustes → cambiar meta → ver mensaje → logout.

## 10. Criterios de aceptación

- [x] Next 16.3.x (≥ 16.3.7), TypeScript estricto y lint, typecheck y tests en verde en CI.
- [ ] La base local en Docker/Podman usa el mismo motor y versión que producción (documentado en DEPLOY — versión prod pendiente phpMyAdmin).
- [x] Prisma 7 con adaptador MariaDB y esquema multiarchivo; migración `m0_core` aplicada en local y en producción.
- [ ] El usuario de Sergio existe en producción; `/registro` responde 404 con `ALLOW_SIGNUP=false` _(pendiente variable en hPanel)_.
- [x] Sin sesión, cualquier ruta de `(app)` redirige a `/login`; una Server Action llamada sin sesión devuelve `fail`.
- [ ] `/ajustes` guarda nombre, meta de ahorro y día de inicio; el mensaje motivacional cambia según el rango _(smoke manual prod)_.
- [x] `money`, `dates`, `periodicity` y `finance-math` tienen tests que cubren los casos de §5.
- [x] El shell muestra la navegación completa; funciona en móvil _(M1–M7 evolucionaron post-M0)_.
- [x] Tema claro y oscuro con tokens semánticos; `/dev/ui` muestra los componentes compartidos (solo en dev; 404 en prod).
- [x] Las reglas de dependencia entre módulos se cumplen por lint.
- [x] Un push a `main` despliega en Hostinger; `/api/health` responde `db: "up"` con HTTPS.
- [x] `docs/DEPLOY.md`, `docs/smoke/m0.md` y `docs/M0-CIERRE.md` están completos.
- [x] Tag `m0`.

## 11. Fuera de alcance

- Entidades financieras de cualquier tipo.
- Recuperación de contraseña, 2FA, correo transaccional, OAuth y multiusuario.
- Cache Components y optimizaciones de caché.
- Internacionalización (la app es solo es-CO).

## 12. Preguntas abiertas

- **Q-M0-01**: ¿La base de datos de Hostinger es MySQL 8 o MariaDB? Se resuelve en T-M0-03.
- **Q-M0-02**: ¿Qué comando de inicio usa el preset de Next.js en el panel (`npm start`, archivo de entrada o standalone)? Se resuelve en T-M0-13.
- **Q-M0-03**: ¿El build en Hostinger puede conectarse a la base de datos para ejecutar `prisma migrate deploy`? Si no, se aplica el plan B de `deploy-hostinger.md §3.2`.
