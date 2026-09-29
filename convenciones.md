# Convenciones — SFP v2

## 1. Idioma

- **Código en inglés**: nombres de variables, funciones, modelos, archivos y commits.
- **Interfaz en español de Colombia**: todos los textos visibles, mensajes de error y toasts.
- **Specs y documentación en español.**
- Los textos de UI se centralizan por módulo en `modules/<m>/copy.ts`. No se escriben strings sueltos repetidos en los componentes.

## 2. Nombres

- Archivos: `kebab-case.ts` / `kebab-case.tsx`. Componentes React: `PascalCase`.
- Server Actions: sufijo `Action` (`createTransactionAction`).
- Queries públicas: prefijo `get` o `list` (`getAccountBalances`, `listCategoriesTree`).
- Enums de Prisma en `UPPER_SNAKE_CASE`.
- Rutas en español y minúsculas (`/movimientos`, `/presupuesto`).

## 3. Dinero

- **Almacenamiento**: `BigInt` en centavos de COP (`@db.BigInt` en Prisma). `$ 1.234.567` se guarda como `123456700n`.
- **Cálculo**: `decimal.js` a través de `@/lib/money`. Prohibido operar dinero con `number`.
- **Montos de movimientos**: siempre positivos; el signo semántico lo da el tipo (ingreso, gasto, transferencia).
- **Redondeo**: a peso entero (múltiplo de 100 centavos) con `ROUND_HALF_UP` cuando un cálculo produce fracciones (normalización mensual, intereses, cuotas).
- **Formato en UI**: `$ 1.234.567`, con punto de miles y sin decimales. Los negativos llevan signo menos real: `−$ 1.234.567`. En tablas y métricas se usan cifras tabulares (`tabular-nums`).
- **Entrada del usuario**: acepta `1234567`, `1.234.567`, `$1.234.567` y abreviaturas `46,9k` / `8M`. Se parsea con `parseCOP()`.
- **Fronteras de serialización**: de Server Component a Client Component se puede pasar `bigint`. En JSON (Route Handlers) el dinero viaja como `string` de centavos.

API mínima de `@/lib/money` (se implementa en M0):

```ts
parseCOP(input: string): bigint | null          // "1.234.567" → 123456700n
formatCOP(cents: bigint, opts?: { sign?: 'auto' | 'always' | 'never'; compact?: boolean }): string
toDecimal(cents: bigint): Decimal               // en pesos
fromDecimal(pesos: Decimal): bigint             // redondea a peso entero, devuelve centavos
sumCents(values: bigint[]): bigint
ratio(part: bigint, total: bigint): Decimal     // 0 si total = 0
```

## 4. Porcentajes y tasas

- Se guardan como **fracción** en `Decimal @db.Decimal(9,6)`: 15% → `0.150000`; tasa 28,5% E.A. → `0.285000`.
- Las tasas de interés siempre se almacenan en **E.A.** La tasa mensual se deriva: `im = (1 + EA)^(1/12) − 1`.
- En UI: `15 %` y `28,50 % E.A.`, con coma decimal.

## 5. Fechas

- Zona de negocio: `America/Bogota` (Colombia no tiene horario de verano).
- **Timestamps** (`createdAt`, `updatedAt`): `DateTime` en UTC.
- **Fechas contables** (fecha de un movimiento, de un pago): `DateTime @db.Date`, que representa el día calendario de Bogotá, sin hora.
- **Periodos**: `String @db.Char(7)` con formato `YYYY-MM`.
- Todo cálculo de "hoy", "inicio de mes" o "días restantes" pasa por `@/lib/dates` (usa `TZDate` de `@date-fns/tz`). Prohibido `new Date()` para lógica de negocio fuera de ese archivo.
- Formato en UI: `28 sep 2026` en listas y `28/09/2026` en inputs, con locale `es` de date-fns.

## 6. IDs

- `String @id @default(cuid())` en todos los modelos propios.
- Los modelos de Better Auth usan el formato de ID que genera su CLI.

## 7. Contrato `Result<T>` y Server Actions

```ts
// src/lib/result.ts
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = (error: string, fieldErrors?: Record<string, string>): Result<never> =>
  ({ ok: false, error, fieldErrors });
```

Toda Server Action se construye con `createAction` (`src/lib/action.ts`), que garantiza este orden:

1. `requireUser()`: si no hay sesión, devuelve `fail('Sesión expirada')`.
2. Valida la entrada con el esquema Zod. Si falla, devuelve `fail` con `fieldErrors` en español.
3. Ejecuta el handler (llama services y usa transacción si toca varias tablas).
4. Hace `revalidatePath` de las rutas afectadas, declaradas en la action.
5. Devuelve `Result<T>`. **Nunca lanza** hacia el cliente. Los errores de Prisma se traducen a mensajes humanos: `P2002` → "Ya existe un registro con ese nombre"; `P2025` → "El registro no existe".

## 8. Formularios

- React Hook Form + `zodResolver` con **el mismo esquema** que valida la Server Action (en `validators/`).
- Componentes `Field` de shadcn para label, descripción y error.
- Teclado primero: Tab entre campos, Enter guarda, Esc cierra o limpia.
- Tras guardar: toast (sonner) y foco de vuelta al primer campo en los formularios de captura rápida.

## 9. Git

- Rama `main`: siempre desplegable. Cada push a `main` despliega en Hostinger.
- Ramas de trabajo: `feat/m1-libro`, `fix/m1-saldo-transferencias`, etc. Se integran con Pull Request (aunque el autor sea la IA) cuando CI está en verde.
- Commits con Conventional Commits y el módulo como scope: `feat(ledger): quick-add con teclado`, `fix(core): redondeo en formatCOP`.
- Al cerrar un módulo: tag `m0`, `m1`, …

## 10. Tests

- **Unitarios (Vitest)**: toda función de `domain/` y de `lib/money`, `lib/dates` y matemática financiera. Casos borde obligatorios: cero, negativos, división por cero, fin de mes, redondeo.
- **E2E (Playwright)**: un flujo feliz por módulo en `tests/e2e/<modulo>.spec.ts`, contra la base local con datos de seed.
- **Base de datos de test**: base separada `sfp_test` en el mismo contenedor Docker.
- CI (GitHub Actions) corre lint, typecheck y unitarios en cada PR. Los e2e se corren en local antes de cerrar un módulo.

## 11. Definition of Done (por módulo)

Un módulo está terminado cuando:

- [ ] Todos sus criterios de aceptación están marcados.
- [ ] Lint, typecheck, unitarios y e2e están en verde.
- [ ] La migración está aplicada en local y en producción.
- [ ] Su seed (si tiene) es idempotente y se ejecutó en producción.
- [ ] `docs/smoke/<modulo>.md` está escrito y pasado en producción.
- [ ] Sus acciones y queries públicas están documentadas en su spec (sección 7).
- [ ] La tabla de estado del `specs/README.md` está actualizada y existe el tag Git.
