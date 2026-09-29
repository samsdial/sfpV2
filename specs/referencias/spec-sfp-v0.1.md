# SPEC — Sistema Financiero Personal (SFP)

**Versión**: 0.1 (planeación inicial)
**Autor**: Sergio
**Metodología**: Spec Driven Development (compatible con OpenSpec)
**Fecha**: agosto 2026

---

## 1. Contexto y visión

Sergio (freelancer full-stack en Colombia) necesita reemplazar su hoja de Excel `Plan_Opnicron_2024` con una aplicación web personal que le ayude a alcanzar libertad financiera mediante:

1. **Registro estructurado** de ingresos, gastos, deudas y activos.
2. **Presupuesto zero-based** (cada peso tiene trabajo asignado antes de gastarse).
3. **Sistema anti-impulso** con cooldown por monto, tiempo y categoría.
4. **Métricas de libertad financiera** (patrimonio, tasa de ahorro, número FI).
5. **Base extensible para IA** que en el futuro analice mercado colombiano y sugiera decisiones.

**No-objetivo del MVP**: reemplazar contadores/asesores, hacer inversiones automáticas, o soportar múltiples usuarios.

## 2. Principios de diseño del sistema

- **Cada peso tiene un trabajo asignado antes de gastarse** (zero-based / envelope).
- **Toda compra no esencial pasa por fricción intencional** (cooldown, justificación).
- **La libertad financiera es un número medible**, no una sensación (gastos anuales × 25).
- **Todo se mide también en horas de trabajo**, no solo en pesos.
- **Los datos son del usuario**: exportables, portables, con backups.

## 3. Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript estricto |
| Base de datos | MySQL 8 |
| ORM | Prisma |
| Auth | Auth.js v5 (Credentials provider) |
| UI | Tailwind + design system propio (theme del usuario — a definir por la IA ejecutora al inicio de P0) |
| Formularios | React Hook Form + Zod |
| Estado servidor | Server Actions + React Server Components |
| Gráficas | Recharts |
| Manejo de dinero | `BIGINT` en centavos en DB + `Decimal.js` en app |
| Fechas | `date-fns` con timezone `America/Bogota` |
| CSV/OFX (P3) | `papaparse` + parser OFX propio |
| Tests | Vitest (unit) + Playwright (e2e básico) |

**Convenciones críticas**:
- Toda cantidad monetaria se almacena como `BigInt` en centavos de COP (evita bugs de `Float`).
- Todas las fechas se guardan en UTC pero se muestran en zona horaria Bogotá.
- IDs `cuid()` para todas las entidades.
- Toda mutación pasa por Server Action con validación Zod.

## 4. Arquitectura de deployment

**Plataforma**: Hostinger (Cloud Hosting o VPS con Node.js) + MySQL nativo de Hostinger + repositorio GitHub privado.

**Flujo de deploy**:
1. Push a rama `main` de GitHub → webhook a Hostinger (o Git deploy manual desde hPanel).
2. Hostinger ejecuta script post-deploy: `npm ci && npx prisma migrate deploy && npm run build && pm2 restart sfp`.
3. Next.js corre en modo standalone (`output: 'standalone'` en `next.config.js`) gestionado por PM2.
4. Nginx (gestionado por Hostinger) hace proxy a `localhost:3000`.

**Variables de entorno mínimas** (`.env.production` en Hostinger):
```
DATABASE_URL="mysql://user:pass@localhost:3306/sfp"
NEXTAUTH_SECRET="<generado>"
NEXTAUTH_URL="https://tudominio.com"
NODE_ENV="production"
TZ="America/Bogota"
```

**Requerimientos que la IA ejecutora debe verificar antes de arrancar P0**:
- Plan de Hostinger que soporte Node.js 20+ (Cloud Startup no basta, se necesita Cloud Professional / Business o VPS)
- MySQL 8 disponible o compatible
- Acceso SSH al servidor
- Dominio o subdominio asignado (ej: `finanzas.tudominio.com`)

## 5. Roadmap por fases

| Fase | Alcance | Estado |
|---|---|---|
| **P0** | Setup: repo, DB, auth, deploy pipeline, integración theme base | Planeada |
| **P1** | MVP Core: single-page con cuentas, transacciones, categorías, tags, dashboard básico | Planeada |
| **P2** | Presupuesto zero-based (sobres mensuales) + detección sobregasto | Roadmap |
| **P3** | Deudas y activos con seguimiento de saldos + transacciones recurrentes | Roadmap |
| **P4** | Metas de compra, fondo de emergencia, número FI | Roadmap |
| **P5** | Sistema anti-impulso: wishlist + cooldown + simulador costo-oportunidad | Roadmap |
| **P6** | Importación Excel/CSV/OFX (Bancolombia, Nequi, Davivienda, formato Opnicron) | Roadmap |
| **P7** | Reportes, insights, exportaciones, fundación IA (tabla eventos mercado + integración DANE) | Roadmap |
| **P8** | Agente IA con tool use (Claude API) | Futuro |

---

## 6. FASE P0 — Foundations

**Objetivo**: dejar el proyecto listo para desarrollo iterativo. Al terminar P0, hay un `hello world` autenticado corriendo en Hostinger.

### 6.1. Tareas ejecutables

**T-P0-01 — Inicializar repositorio Next.js 15**
- `npx create-next-app@latest sfp --typescript --tailwind --app --src-dir --import-alias "@/*"`
- Habilitar `strict: true` en `tsconfig.json`
- Configurar `output: 'standalone'` en `next.config.js`
- Configurar `.gitignore` con `.env*`, `node_modules`, `.next`, `prisma/*.db`
- Commit inicial en repo privado de GitHub

**T-P0-02 — Instalar dependencias base**
```
npm i @prisma/client next-auth@beta zod react-hook-form @hookform/resolvers
npm i decimal.js date-fns date-fns-tz
npm i -D prisma vitest @playwright/test
```

**T-P0-03 — Configurar Prisma con MySQL**
- `npx prisma init --datasource-provider mysql`
- Crear schema mínimo en `prisma/schema.prisma`:
  ```prisma
  generator client { provider = "prisma-client-js" }
  datasource db {
    provider = "mysql"
    url      = env("DATABASE_URL")
  }
  model User {
    id           String   @id @default(cuid())
    email        String   @unique
    passwordHash String
    name         String?
    createdAt    DateTime @default(now())
  }
  ```
- Ejecutar `npx prisma migrate dev --name init`
- Documentar en README cómo generar `DATABASE_URL` para dev local y producción

**T-P0-04 — Integrar design system existente**

*Input requerido del usuario antes de esta tarea*: entregar a la IA ejecutora los archivos/tokens del theme y componentes base (colores, tipografía, componentes ya construidos: Button, Input, Card, etc.).

- Copiar tokens del theme a `src/styles/tokens.css` y extender `tailwind.config.ts` para reflejarlos como CSS variables
- Copiar/portar componentes reutilizables a `src/components/ui/`
- Crear `src/app/layout.tsx` con providers globales (theme, auth session)
- Verificar que el theme aplica correctamente en modo dev

**T-P0-05 — Auth.js v5 con Credentials**
- Configurar `src/auth.ts` con provider Credentials
- Endpoints en `src/app/api/auth/[...nextauth]/route.ts`
- Middleware `src/middleware.ts` que protege todas las rutas excepto `/login` y `/api/auth/*`
- Página `/login` con form email+password (usar componentes del theme)
- Server Action `signUpUser(email, password)` para crear el único usuario (Sergio). Deshabilitar después de crearlo (variable `ALLOW_SIGNUP="false"` en producción)
- Hash de password con `bcryptjs` (12 rondas)

**T-P0-06 — Estructura de carpetas del proyecto**
```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (app)/page.tsx            # el single-page del MVP
│   ├── api/auth/[...nextauth]/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                        # theme base
│   └── domain/                    # componentes de dominio SFP
├── lib/
│   ├── db.ts                      # prisma client singleton
│   ├── money.ts                   # helpers Decimal <-> BigInt
│   ├── dates.ts                   # helpers timezone Bogotá
│   └── validators/                # esquemas Zod
├── actions/                       # Server Actions
├── auth.ts
└── middleware.ts
```

**T-P0-07 — Utilidades de dinero y fechas**
- `src/lib/money.ts`: funciones `toBigInt(decimal: string): bigint`, `toDecimal(cents: bigint): Decimal`, `formatCOP(cents: bigint): string` (retorna `"$ 1.234.567"`)
- `src/lib/dates.ts`: helpers para trabajar en zona `America/Bogota` (start of month, end of month, format es-CO)
- Tests unitarios básicos con Vitest para ambos módulos

**T-P0-08 — Setup PM2 y deploy en Hostinger**
- Crear `ecosystem.config.js` para PM2 con nombre `sfp`, script `node .next/standalone/server.js`
- Documentar en `DEPLOY.md` los pasos:
  1. Configurar Node.js 20 en Hostinger hPanel
  2. Configurar DB MySQL en hPanel, obtener credenciales
  3. Configurar deploy Git desde repo GitHub (SSH deploy key)
  4. Setear variables de entorno en hPanel
  5. Script `.hostinger/deploy.sh` con `npm ci --production=false && npx prisma migrate deploy && npm run build && pm2 restart sfp || pm2 start ecosystem.config.js`
- Crear GitHub Action opcional `.github/workflows/deploy.yml` que dispare el pull remoto vía SSH al hacer merge a `main`

**T-P0-09 — Smoke test en producción**
- Deploy inicial
- Verificar que `/login` renderiza con theme aplicado
- Crear usuario Sergio
- Login exitoso, redirige a `/` con placeholder "Hola, Sergio"

### 6.2. Criterios de aceptación P0

- [ ] Repo en GitHub inicializado con Next.js 15 + TypeScript estricto
- [ ] Prisma migrado en local y producción (MySQL en Hostinger)
- [ ] Theme del usuario integrado y visible en `/login`
- [ ] Auth funciona: registro (una vez), login, logout, protección de rutas
- [ ] Deploy automatizado desde `main` a Hostinger
- [ ] URL en producción accesible con HTTPS
- [ ] Utilidades de dinero y fechas con tests pasando
- [ ] `DEPLOY.md` completo y verificado por la IA ejecutora

### 6.3. Fuera de alcance de P0

- Cualquier feature funcional del sistema (transacciones, dashboard, etc.)
- Recovery de contraseña (Sergio es único usuario y accede localmente)
- 2FA
- Emails transaccionales

---

## 7. FASE P1 — MVP Core (single-page)

**Objetivo**: Sergio puede registrar cuentas, ingresos y gastos con categorías/tags, y ver un dashboard básico con su patrimonio actual y flujo del mes. Toda la interacción sucede en una sola página con secciones apiladas.

### 7.1. User stories del MVP

- **US-01**: Como usuario, quiero registrar mis cuentas (Nequi, Nubank TJ, Efectivo, etc.) con saldo inicial, para saber dónde tengo mi dinero.
- **US-02**: Como usuario, quiero registrar rápidamente una transacción (ingreso o gasto) con monto, cuenta, categoría, fecha y notas, para llevar mi día a día.
- **US-03**: Como usuario, quiero categorizar cada transacción con una taxonomía jerárquica y opcionalmente con tags cruzados (mis códigos CD/TJ/PT/MR/PPS/SAM), para analizar después.
- **US-04**: Como usuario, quiero ver mi patrimonio neto actual (suma de saldos) y cómo cambió este mes, para saber si voy bien.
- **US-05**: Como usuario, quiero ver una gráfica de ingresos vs gastos acumulados del mes, para detectar si voy a cerrar en positivo.
- **US-06**: Como usuario, quiero ver mis últimas 20 transacciones y poder editarlas o eliminarlas inline, porque cometo errores al registrar.
- **US-07**: Como usuario, quiero registrar transferencias entre mis cuentas (ej: Nequi → Nubank pagando la tarjeta) sin que se cuenten como gasto ni ingreso.

### 7.2. Wireframe del single-page

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (sticky)                                                │
│  ┌───────────────┬────────────────┬─────────────────┐           │
│  │ Patrimonio    │ Flujo mes      │ Días restantes  │  [Logout] │
│  │ $ XX.XXX.XXX  │ +$X / -$Y      │ XX días         │           │
│  └───────────────┴────────────────┴─────────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SECCIÓN 1 — REGISTRAR TRANSACCIÓN (quick-add)                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [Gasto|Ingreso|Transfer]                                │    │
│  │ Monto: [____________]  Cuenta: [▾]  Categoría: [▾]      │    │
│  │ Fecha: [hoy ▾]  Tags: [CD] [TJ] [+]  Notas: [_____]     │    │
│  │                                       [Guardar ← Enter] │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  SECCIÓN 2 — CUENTAS                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Nequi          $  1.234.500    [editar]                 │    │
│  │ Nubank TJ     -$  2.204.599    [editar]  (deuda)        │    │
│  │ Efectivo       $     85.000    [editar]                 │    │
│  │ [+ Agregar cuenta]                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  SECCIÓN 3 — CASH FLOW DEL MES (gráfica de líneas)              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [Ingresos acumulados vs Gastos acumulados — día a día] │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  SECCIÓN 4 — ÚLTIMAS 20 TRANSACCIONES                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Fecha  Concepto        Categoría   Cuenta  Monto  Tags  │    │
│  │ 28/08  Almuerzo Sáb    Restaur.    Nequi   -46.9k [MR]  │    │
│  │ 28/08  Fracttal hito1  Trabajo     Bcolo   +8.0M       │    │
│  │ ...                                          [editar|X] │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  SECCIÓN 5 — GESTIÓN DE CATEGORÍAS Y TAGS  [colapsable]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Notas de UX**:
- El quick-add en Sección 1 debe funcionar con teclado 100% (Tab entre campos, Enter para guardar, Esc para limpiar).
- Al guardar, la transacción aparece inmediatamente arriba de la tabla (optimistic UI opcional en P1, obligatorio en P2).
- Formato de dinero: separador de miles con punto, prefijo `$ `, sin decimales (COP no usa centavos en el día a día).
- Colores semánticos ya deben venir del theme (verde = ingreso/positivo, rojo = gasto/negativo, ámbar = advertencia).

### 7.3. Modelo de datos (Prisma schema para P1)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())

  accounts     Account[]
  categories   Category[]
  tags         Tag[]
  transactions Transaction[]
}

model Account {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name           String                     // "Nequi", "Nubank TJ", "Efectivo"
  type           AccountType                // CASH, BANK, CREDIT_CARD, SAVINGS, INVESTMENT
  initialBalance BigInt                     // en centavos COP; negativo si es tarjeta con deuda al abrir
  currency       String   @default("COP")
  archived       Boolean  @default(false)
  createdAt      DateTime @default(now())

  transactions   Transaction[]  @relation("TransactionAccount")
  transfersFrom  Transaction[]  @relation("TransferFromAccount")

  @@index([userId])
}

enum AccountType {
  CASH
  BANK
  CREDIT_CARD
  SAVINGS
  INVESTMENT
}

model Category {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name     String                          // "Restaurantes"
  parentId String?
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  kind     CategoryKind                    // EXPENSE, INCOME, TRANSFER
  color    String?                         // opcional, hex del theme
  icon     String?                         // opcional, nombre de icono
  archived Boolean  @default(false)

  transactions Transaction[]

  @@index([userId])
  @@index([parentId])
}

enum CategoryKind {
  EXPENSE
  INCOME
  TRANSFER
}

model Tag {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name     String                          // "CD", "TJ", "PT", "MR", "PPS", "SAM"
  color    String?

  transactions TransactionTag[]

  @@unique([userId, name])
}

model Transaction {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type             TransactionType

  accountId        String
  account          Account  @relation("TransactionAccount", fields: [accountId], references: [id])

  // Solo si type = TRANSFER
  transferFromId   String?
  transferFrom     Account? @relation("TransferFromAccount", fields: [transferFromId], references: [id])

  categoryId       String?                 // opcional en TRANSFER
  category         Category? @relation(fields: [categoryId], references: [id])

  amount           BigInt                  // en centavos COP, siempre positivo (el signo lo da el type)
  date             DateTime                // fecha del gasto/ingreso, timezone Bogotá al mostrar
  description      String?
  merchant         String?                 // "Rappi", "Éxito", "Fracttal"
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  tags             TransactionTag[]

  @@index([userId, date])
  @@index([accountId])
  @@index([categoryId])
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

model TransactionTag {
  transactionId String
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  tagId         String
  tag           Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([transactionId, tagId])
  @@index([tagId])
}
```

**Convenciones del modelo**:
- `amount` siempre positivo en `BigInt` centavos. El signo semántico lo da `type`.
- En `TRANSFER`: `accountId` es la cuenta destino, `transferFromId` es la cuenta origen. Se crea un solo registro (no dos).
- El patrimonio de una cuenta se calcula como: `initialBalance + Σ(INCOME.amount) - Σ(EXPENSE.amount) + Σ(TRANSFER.amount where account is dest) - Σ(TRANSFER.amount where account is source)`.

### 7.4. Server Actions requeridas

Ubicación: `src/actions/`

```ts
// accounts.ts
createAccount(data: { name, type, initialBalance }): Promise<Result<Account>>
updateAccount(id, data): Promise<Result<Account>>
archiveAccount(id): Promise<Result<void>>
listAccounts(): Promise<Account[]>  // solo activas por defecto

// categories.ts
createCategory(data: { name, parentId?, kind, color?, icon? }): Promise<Result<Category>>
updateCategory(id, data): Promise<Result<Category>>
archiveCategory(id): Promise<Result<void>>
listCategoriesTree(kind?): Promise<CategoryNode[]>

// tags.ts
createTag(data: { name, color? }): Promise<Result<Tag>>
listTags(): Promise<Tag[]>
deleteTag(id): Promise<Result<void>>

// transactions.ts
createTransaction(data: TransactionInput): Promise<Result<Transaction>>
updateTransaction(id, data): Promise<Result<Transaction>>
deleteTransaction(id): Promise<Result<void>>
listRecentTransactions(limit = 20): Promise<Transaction[]>
listTransactionsInRange(from, to): Promise<Transaction[]>

// dashboard.ts
getNetWorth(): Promise<{ current: bigint; monthDelta: bigint }>
getMonthCashFlow(year, month): Promise<{ day: number; income: bigint; expense: bigint }[]>
getMonthSummary(year, month): Promise<{ totalIncome, totalExpense, savingsRate }>
```

**Contrato común `Result<T>`**: `{ ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> }`

Toda Server Action:
1. Valida input con Zod
2. Verifica sesión (usa helper `requireUser()`)
3. Ejecuta operación en transacción de Prisma si toca múltiples tablas
4. Llama `revalidatePath('/')` al terminar mutación exitosa
5. Retorna `Result<T>` (nunca lanza excepciones no controladas)

### 7.5. Seed inicial (categorías + tags)

Script `prisma/seed.ts` que al ejecutarse crea, para el usuario dado, la taxonomía inicial derivada del Excel de Sergio.

**Tags**: `CD`, `TJ`, `PT`, `MR`, `PPS`, `SAM`

**Categorías** (kind = EXPENSE salvo indicado):

- **Vivienda**
  - Arriendo
  - Administración
  - Servicios — Agua
  - Servicios — Codensa
  - Servicios — Internet (Vanty)
- **Telecomunicaciones**
  - Movistar
  - Claro Celular
- **Suscripciones**
  - Spotify
  - Otros streaming
- **Educación**
  - Colegio (hija)
  - Cursos (inglés, UNAD)
- **Salud**
  - Odontología
  - Seguros (Bolívar, GNP)
  - Medicamentos
- **Deudas — Tarjetas**
  - Nubank TJ
  - Davivienda TJ
- **Deudas — Créditos**
  - Bancolombia CD
  - BancoCajaSocial CD
  - Lulo
  - RCI (vehículo)
  - Préstamo MAMA
- **Alimentación**
  - Mercado
  - Restaurantes
  - Domicilios
  - Snacks
- **Transporte**
  - Gasolina
  - Mantenimiento vehículo
  - SOAT / Tecnomecánica
  - Peajes
- **Recreación**
  - Salidas
  - Eventos familiares
  - Regalos
- **Trabajo/Profesional**
  - Hosting y dominios
  - Software y suscripciones
  - Herramientas y equipos
- **Familia**
  - Gastos hija (fuera de colegio)
- **Otros**
  - Imprevistos

**Categorías** (kind = INCOME):
- Trabajo — Fracttal
- Trabajo — JJmart
- Trabajo — Freelance otros
- Prima
- Transferencias recibidas — Nequi
- Transferencias recibidas — Avvillas
- Otros ingresos

El seed debe ser **idempotente** (usar `upsert`) para poder correrlo múltiples veces sin duplicar.

### 7.6. Tareas ejecutables

**T-P1-01** — Migración Prisma con el schema completo de P1 (`npx prisma migrate dev --name p1_mvp_core`)

**T-P1-02** — Implementar seed en `prisma/seed.ts` y agregar comando `npm run db:seed`

**T-P1-03** — Utilidades de dominio en `src/lib/`:
- `netWorth.ts` — cálculo de patrimonio por cuenta y total
- `cashFlow.ts` — agregación de ingresos/gastos por día para gráfica
- Cada uno con tests Vitest

**T-P1-04** — Server Actions listadas en 7.4, con validadores Zod correspondientes en `src/lib/validators/`

**T-P1-05** — Componentes de dominio en `src/components/domain/`:
- `<QuickAddTransaction />` — form del quick-add (Sección 1)
- `<AccountsList />` — lista editable de cuentas (Sección 2)
- `<CashFlowChart />` — gráfica Recharts (Sección 3)
- `<RecentTransactionsTable />` — tabla editable inline (Sección 4)
- `<CategoriesManager />` — colapsable de gestión (Sección 5)
- `<NetWorthHeader />` — header sticky con patrimonio y flujo
- Todos usan los primitivos del theme (`Button`, `Input`, `Select`, `Card`, etc.)

**T-P1-06** — Página `src/app/(app)/page.tsx` que compone todas las secciones. Es un Server Component que hace las queries iniciales; los componentes con interacción son Client Components (`'use client'`).

**T-P1-07** — Manejo de estados vacíos: si no hay cuentas, mostrar CTA "Agrega tu primera cuenta". Si no hay transacciones, mostrar CTA "Registra tu primera transacción".

**T-P1-08** — Tests e2e básicos con Playwright: flujo login → crear cuenta → crear transacción → ver reflejada en dashboard.

**T-P1-09** — Deploy P1 a producción y validación manual con el escenario `docs/smoke-p1.md` (a redactar por la IA ejecutora).

### 7.7. Criterios de aceptación P1

- [ ] Usuario logueado puede crear, editar, archivar cuentas
- [ ] Usuario puede crear transacciones tipo INCOME, EXPENSE y TRANSFER
- [ ] Al crear transacción, header (patrimonio, flujo) se actualiza sin recargar
- [ ] Categorías jerárquicas visibles en selector con búsqueda
- [ ] Tags asignables desde el quick-add (con opción "crear tag" inline)
- [ ] Gráfica de cash flow del mes actual renderiza con datos reales
- [ ] Tabla de últimas 20 transacciones permite editar y eliminar inline
- [ ] Seed inicial ejecutado en producción con las categorías y tags de Sergio
- [ ] Formato COP correcto en toda la UI (`$ 1.234.567`, sin decimales)
- [ ] Toda mutación protegida por auth y validada con Zod
- [ ] `smoke-p1.md` pasado en producción

### 7.8. Fuera de alcance de P1 (explícito para no colar features)

- Presupuesto zero-based / sobres (va en P2)
- Deudas con seguimiento de saldo/interés (va en P3)
- Metas y fondo emergencia (va en P4)
- Wishlist y cooldown (va en P5)
- Importación desde Excel/CSV (va en P6)
- Reportes históricos multi-mes (va en P7)
- IA (va en P8)
- Recovery de contraseña, invitados, roles

---

## 8. Roadmap post-MVP (fases resumidas)

### P2 — Presupuesto zero-based
- Modelo `MonthlyBudget` + `CategoryEnvelope` (categoría, monto asignado, gastado).
- Vista mensual de sobres con barras de progreso y alertas de sobregasto.
- Copia de plantilla de mes a mes.
- Vista termómetro 50/30/20 sobre las asignaciones actuales.

### P3 — Deudas y activos + recurrentes
- Modelo `Debt` (nombre, saldo original, saldo actual, tasa E.A., cuota mínima, día de corte, día de pago).
- Al pagar una deuda, transacción tipo `EXPENSE` con categoría "Deudas — …" reduce `currentBalance`.
- Modelo `Asset` (inversiones, CDTs, ahorros dedicados).
- Modelo `RecurringTransaction` (arriendo, Spotify, servicios): genera transacciones automáticamente al ejecutarse cron o al pasar la fecha en el login.

### P4 — Metas y libertad financiera
- Modelo `Goal` (nombre, monto objetivo, monto actual, fecha objetivo, tipo: PURCHASE / EMERGENCY_FUND / FI_NUMBER / OTHER).
- Fondo emergencia calculado como 3-6 meses de gastos promedio (Sergio configura factor).
- Número FI = gastos anuales × 25.
- Widget "días hasta libertad financiera" según tasa de ahorro actual.

### P5 — Anti-impulso
- Modelo `WishlistItem` (nombre, monto estimado, URL, categoría, fecha agregada, cooldownEndsAt, status: WAITING/APPROVED/REJECTED/PURCHASED).
- Reglas de cooldown (según tabla ya definida): tiempo por rango de monto, multiplicador × 1.5 en categorías de riesgo, categorías protegidas con cooldown 0.
- Estrangulador de frecuencia: máximo 3 aprobaciones no esenciales por semana.
- Contador "Dinero no gastado en impulsos": suma de items rechazados en el año.
- Simulador costo-oportunidad: "Si en vez de comprar esto invierto a X% E.A., en 10 años son $Y".

### P6 — Importación
- Importador Excel formato Opnicron (parseo de las hojas mensuales que Sergio ya tiene).
- Importador CSV/OFX para Bancolombia, Nequi, Davivienda, Daviplata.
- Wizard de mapeo de columnas → campos del sistema.
- Deduplicación por (fecha, monto, cuenta) con confirmación manual.

### P7 — Reportes y fundación IA
- Reporte mensual PDF/HTML con narrativa: cash flow, top categorías, comparación vs mes anterior, alertas.
- Modelo `MarketEvent` (fecha, tipo: TRM, BANREP_RATE, DANE_INFLATION_MONTHLY, DANE_INFLATION_CATEGORY).
- Job semanal que consulta APIs abiertas del BanRep y DANE y llena la tabla.
- Comparación inflación personal (categorías de Sergio) vs DANE.

### P8 — Agente IA
- Integración con Anthropic API (Claude Sonnet 4.6 o superior).
- Tool use: expone tools que leen la DB de Sergio (`getTransactions`, `getGoals`, `getWishlist`, `getDebts`, `getMarketEvents`).
- Casos de uso iniciales:
  - **Analista de wishlist**: revisa items en cooldown y sugiere aprobar/rechazar según contexto financiero + precio de mercado
  - **Optimizador de deuda**: sugiere estrategia snowball vs avalanche vs mixta
  - **Coach mensual**: análisis narrativo del mes con recomendaciones específicas
  - **Alertas macro**: cuando cambia tasa BanRep o inflación DANE, notifica implicaciones para Sergio

---

## 9. Anexo A — Mapeo Excel Opnicron → Sistema

Referencia para el importador de P6 y para migración inicial.

| Bloque Excel | Entidad sistema | Notas |
|---|---|---|
| TARJETAS > TJ, Presupuesto | `Account` type=CREDIT_CARD, `Debt` (cupo/límite = presupuesto) | Cada tarjeta es cuenta + deuda |
| TARJETAS > Total | `Debt.currentBalance` | Saldo actual |
| TARJETAS > Cuota Base | `Debt.minPayment` | |
| TARJETAS > Día de corte | `Debt.cutoffDay` | |
| CREDITOS > Presupuesto | `Debt.originalAmount` | Monto original del crédito |
| CREDITOS > Total | `Debt.currentBalance` | Saldo actual |
| CREDITOS > PAGO R (mes) | `Transaction` type=EXPENSE, category=Deudas—Créditos, date=mes | |
| GASTOS FIJOS MES > Presupuesto | `CategoryEnvelope.assignedAmount` (P2) | |
| GASTOS FIJOS MES > PAGO R | `Transaction` type=EXPENSE, category, date=mes | |
| GASTOS FIJOS MES > Fecha | `RecurringTransaction.nextDue` (P3) | |
| INGRESOS FIJOS MES > Fracttal/Nequi/etc. | `Transaction` type=INCOME, category=Trabajo—Fracttal (etc.) | |
| Gastos NOP (columna derecha) | `Transaction` type=EXPENSE + tag "NOP" | Los "no programados" de Sergio |
| Códigos CD/TJ/PT/MR/PPS/SAM | `Tag` | Se preservan como tags para queries |

## 10. Anexo B — Convenciones para la IA ejecutora

- No cambiar el schema Prisma sin actualizar este spec.
- Toda nueva Server Action se documenta en el `README.md` del proyecto.
- Commits siguen Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Cada fase termina con: (a) migración aplicada en prod, (b) smoke test manual documentado, (c) tag Git `p0`, `p1`, etc.
- Antes de arrancar cada fase: leer este spec, generar plan de tareas detallado y esperar OK de Sergio.

---

**Fin del spec v0.1**
