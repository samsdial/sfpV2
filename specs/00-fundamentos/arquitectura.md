# Arquitectura — SFP v2

## 1. Estilo: monolito modular dentro de Next.js

Un solo proyecto Next.js contiene frontend y backend. El backend lo forman:

- **Server Actions**, para todas las mutaciones.
- **Funciones de consulta de cada módulo**, llamadas desde Server Components.
- **Route Handlers** (`/api/*`), solo cuando se necesita HTTP: auth, salud y, más adelante, exportaciones y el agente IA.

El código de negocio vive en `src/modules/<modulo>/` con límites estrictos. Los módulos convergen en un todo porque **comparten el libro de movimientos (M1)** y porque el **tablero (M7)** compone las lecturas de todos.

## 2. Estructura del repositorio

```
sfp-v2/
├── specs/                          # esta documentación (fuente de verdad)
├── docs/
│   ├── DEPLOY.md                   # procedimiento real, verificado
│   └── smoke/                      # un checklist manual por módulo: m0.md, m1.md…
├── prisma/
│   ├── schema/                     # esquema multiarchivo (un archivo por módulo)
│   │   ├── _base.prisma            # generator + datasource
│   │   ├── auth.prisma             # modelos de Better Auth (generados por su CLI)
│   │   ├── core.prisma             # M0
│   │   ├── ledger.prisma           # M1
│   │   ├── budget.prisma           # M2
│   │   ├── monthly.prisma          # M3
│   │   ├── debts.prisma            # M4
│   │   ├── goals.prisma            # M5
│   │   └── networth.prisma         # M6
│   ├── migrations/
│   └── seed/
│       ├── index.ts                # orquestador idempotente
│       └── <modulo>.seed.ts
├── prisma.config.ts
├── docker-compose.yml              # base de datos local
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/registro/page.tsx          # solo si ALLOW_SIGNUP=true
│   │   ├── (app)/layout.tsx                  # shell autenticado (sidebar + quick-add global)
│   │   ├── (app)/page.tsx                    # M7 Tablero
│   │   ├── (app)/movimientos/page.tsx        # M1
│   │   ├── (app)/cuentas/page.tsx            # M1
│   │   ├── (app)/presupuesto/page.tsx        # M2
│   │   ├── (app)/mes/[periodo]/page.tsx      # M3 (periodo = "YYYY-MM")
│   │   ├── (app)/deudas/page.tsx             # M4
│   │   ├── (app)/metas/page.tsx              # M5
│   │   ├── (app)/patrimonio/page.tsx         # M6
│   │   ├── (app)/ajustes/page.tsx            # M0
│   │   ├── api/auth/[...all]/route.ts        # Better Auth
│   │   ├── api/health/route.ts               # M0
│   │   ├── globals.css                       # Tailwind v4 + tokens
│   │   └── layout.tsx                        # raíz: fuentes, ThemeProvider, Toaster
│   ├── modules/
│   │   ├── core/          # M0
│   │   ├── ledger/        # M1
│   │   ├── budget/        # M2
│   │   ├── monthly/       # M3
│   │   ├── debts/         # M4
│   │   ├── goals/         # M5
│   │   ├── networth/      # M6
│   │   └── dashboard/     # M7
│   ├── components/
│   │   ├── ui/            # primitivas shadcn (generadas por el CLI; editables)
│   │   └── shared/        # componentes transversales: Money, Percent, StatusMessage, EmptyState, PageHeader…
│   ├── lib/
│   │   ├── db.ts          # singleton PrismaClient + adaptador
│   │   ├── auth.ts        # instancia Better Auth (servidor)
│   │   ├── auth-client.ts # cliente Better Auth (navegador)
│   │   ├── session.ts     # requireUser()
│   │   ├── action.ts      # createAction(): wrapper estándar de Server Actions
│   │   ├── result.ts      # Result<T>, ok(), fail()
│   │   ├── money.ts
│   │   ├── dates.ts
│   │   └── utils.ts       # cn() de shadcn
│   ├── generated/prisma/  # salida de Prisma (en .gitignore)
│   ├── env.ts             # validación de variables de entorno con Zod
│   └── proxy.ts           # redirección optimista a /login (Next 16)
└── tests/e2e/             # Playwright
```

## 3. Anatomía de un módulo

```
src/modules/<modulo>/
├── domain/        # funciones puras de TypeScript: cálculos y reglas. Sin I/O, sin Prisma. 100% testeables.
│   └── *.test.ts
├── repository/    # ÚNICO lugar que llama a Prisma para las tablas de este módulo
├── services/      # orquestación: usa su repository, su domain y la API pública de otros módulos
├── actions/       # 'use server' — createAction(schema, handler) → llama services → revalidatePath
├── validators/    # esquemas Zod (entrada de actions y formularios)
├── components/    # UI del módulo (Server y Client Components)
├── types.ts       # tipos/DTO públicos del módulo
└── index.ts       # API PÚBLICA: lo único que otros módulos y app/ pueden importar
```

`index.ts` exporta:

- **Queries**: funciones async de lectura, p. ej. `getAccountBalances(userId)`.
- **Tipos y DTO** públicos.
- **Componentes** que otras rutas necesiten montar.

`index.ts` empieza con `import 'server-only'` cuando exporta queries. Los componentes cliente se exportan desde `components/index.ts` sin `server-only`.

## 4. Reglas de dependencia (obligatorias)

1. Un módulo **solo importa de otro módulo por su `index.ts`**. Prohibido `@/modules/ledger/repository/...` desde fuera de `ledger`.
2. Solo `repository/` importa `@/lib/db`. Un módulo **nunca lee ni escribe tablas de otro módulo** directamente.
3. `domain/` no importa nada con efectos: ni Prisma, ni `next/*`, ni `fetch`.
4. `app/` (rutas) importa de `modules/*/index.ts`, `components/*` y `lib/*`. Nunca de `repository/` ni de `services/`.
5. Grafo permitido (sin ciclos):

| Módulo | Puede importar de |
|---|---|
| core | — |
| ledger | core |
| budget | core, ledger |
| monthly | core, ledger, budget |
| debts | core, ledger |
| goals | core, ledger, monthly |
| networth | core, ledger, debts |
| dashboard | todos (solo queries) |

6. Estas reglas se hacen cumplir con `eslint` (`no-restricted-imports` por patrones, o `eslint-plugin-boundaries`) en T-M0-10. Un lint roto bloquea el merge.

## 5. Operaciones que cruzan módulos

Ejemplo: "marcar pagado el arriendo" en M3 crea un movimiento en M1 y actualiza la línea del periodo en M3, en una sola transacción de base de datos.

- `core` expone `withTransaction(fn)`, que envuelve `prisma.$transaction`.
- Las funciones de servicio que escriben aceptan un parámetro opcional `tx?: DbClient`. El tipo `DbClient` (PrismaClient o TransactionClient) se exporta desde `core`.
- El módulo que inicia la operación abre la transacción y pasa `tx` a los servicios públicos del otro módulo.
- M1 expone en su `index.ts` los **comandos** que otros módulos necesitan (p. ej. `recordTransaction(input, tx?)`), además de las queries.

## 6. Dueños de tablas (modelos Prisma)

| Módulo | Archivo | Modelos |
|---|---|---|
| auth (M0) | `auth.prisma` | `User`, `Session`, `Account` (cuenta de auth, **no financiera**), `Verification` — nombres por defecto de Better Auth |
| core (M0) | `core.prisma` | `UserSettings` |
| ledger (M1) | `ledger.prisma` | `FinancialAccount`, `Category`, `Tag`, `Transaction`, `TransactionTag` |
| budget (M2) | `budget.prisma` | `BudgetIncome`, `BudgetExpense` |
| monthly (M3) | `monthly.prisma` | `Period`, `PeriodLine` |
| debts (M4) | `debts.prisma` | `CreditCardProfile`, `Loan`, `LoanPayment` |
| goals (M5) | `goals.prisma` | `SavingsGoal`, `GoalContribution` |
| networth (M6) | `networth.prisma` | `Asset`, `NetWorthSnapshot` |

Las cuentas de dinero se llaman **`FinancialAccount`** para no chocar con el modelo `Account` que Better Auth usa para credenciales. Los nombres de modelos de módulos futuros son orientativos; cada spec de módulo los define en detalle.

Las relaciones hacia `User` son la única dependencia de esquema permitida hacia `auth.prisma`. Las relaciones entre tablas de módulos distintos siguen el grafo de la §4 (p. ej. `CreditCardProfile.accountId → FinancialAccount.id`).

## 7. Flujo de datos típico

```
Server Component (page.tsx)
  └─ await requireUser()
  └─ await ledger.getRecentTransactions(user.id)        ← query pública
  └─ renderiza <TransactionsTable data={...} />          ← Client Component

Client Component (formulario)
  └─ llama createTransactionAction(formData)             ← Server Action
        └─ createAction: requireUser → Zod → service → revalidatePath → Result<T>
  └─ muestra toast / errores de campo según Result
```

## 8. Seguridad

- `proxy.ts` solo hace la **redirección optimista** (existe la cookie de sesión → deja pasar). **No** es la barrera de seguridad.
- Toda página del grupo `(app)` y **toda** Server Action verifican sesión con `requireUser()` en el servidor.
- Toda query filtra por `userId`, aunque haya un solo usuario, para que el código sea correcto si algún día hay más.
- Los secretos solo se leen en el servidor (`src/env.ts`). Ninguna variable sensible lleva prefijo `NEXT_PUBLIC_`.
