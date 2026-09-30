# M1 — Libro

**Estado**: listo para revisión  
**Depende de**: M0  
**Lo usan**: M2, M3, M4, M5, M6, M7  
**Tag al cerrar**: `m1`

---

## 1. Objetivo

Ser la **fuente de verdad operativa** de las finanzas de Sergio: cuentas, categorías, etiquetas y movimientos (ingreso, gasto, transferencia). Al cerrar M1 debe poder registrar cualquier operación del día a día, ver saldos actualizados, filtrar el historial y usar el **quick-add global** desde cualquier pantalla. El método de pago (efectivo, transferencia, tarjeta) se infiere del **tipo de cuenta**, no de un campo aparte.

## 2. Alcance

**Incluye**
- CRUD de cuentas (`FinancialAccount`) con tipos: efectivo, banco, ahorro, inversión, tarjeta de crédito, billetera digital.
- Categorías jerárquicas de ingreso, gasto y transferencia; archivado sin borrado físico.
- Tags cruzados: CD, TJ, PT, MR, PPS, SAM, NOP (seed inicial).
- Movimientos con monto en centavos, fecha, descripción, comercio opcional, categoría y tags.
- Transferencias entre dos cuentas (origen + destino) en una sola operación atómica.
- Listado con filtros (fecha, tipo, cuenta, categoría) y edición/eliminación.
- Saldos por cuenta = saldo inicial + suma de movimientos (reglas §5.2).
- Quick-add (`N` o botón "+ Registrar") habilitado en el shell.
- Seed idempotente con taxonomía de categorías de Sergio (`prisma/seed/ledger.seed.ts`).

**No incluye**
- Presupuesto, periodos mensuales, deudas estructuradas (M4), importación de extractos, movimientos recurrentes automáticos.

## 3. Dependencias

- **M0**: auth, `createAction`, `withTransaction`, `money`, `dates`, design system, shell.
- Fundamentos: `convenciones.md` (dinero, actions), `arquitectura.md` (dueño `ledger.prisma`).

## 4. Historias de usuario

- **US-M1-01**: Como Sergio, quiero crear y archivar cuentas para reflejar dónde tengo el dinero (Nequi, Davivienda, tarjetas, efectivo).
- **US-M1-02**: Como Sergio, quiero registrar un gasto o ingreso en pocos segundos desde cualquier página.
- **US-M1-03**: Como Sergio, quiero transferir entre cuentas sin duplicar el monto ni perder trazabilidad.
- **US-M1-04**: Como Sergio, quiero filtrar movimientos por mes y categoría para revisar en qué se fue el dinero.
- **US-M1-05**: Como Sergio, quiero etiquetar movimientos (p. ej. TJ, CD) para cruzar con deudas y reportes futuros.
- **US-M1-06**: Como Sergio, quiero ver el saldo actual de cada cuenta al abrir `/cuentas`.

## 5. Reglas de negocio y fórmulas

### 5.1 Tipos de movimiento

| Tipo | Categoría | Efecto en cuenta principal |
|---|---|---|
| `INCOME` | Obligatoria (`INCOME`) | `+amount` |
| `EXPENSE` | Obligatoria (`EXPENSE`) | `−amount` |
| `TRANSFER` | Opcional (`TRANSFER` o ninguna) | `+amount` en destino; `−amount` en `transferFromId` |

Montos siempre **positivos** en BD; el signo lo aplica el tipo.

### 5.2 Saldo de cuenta

```
balance(account) = initialBalance
  + Σ INCOME en account
  − Σ EXPENSE en account
  + Σ TRANSFER donde account es destino
  − Σ TRANSFER donde account es origen (transferFromId)
```

Tarjetas de crédito usan la misma fórmula: un gasto con tarjeta **reduce** el saldo (típicamente negativo = deuda). M4 y M6 interpretan ese signo.

### 5.3 Validaciones

- No operar sobre cuentas archivadas.
- `categoryId` debe pertenecer al usuario y coincidir con el `kind` esperado del tipo (salvo transferencia).
- Tags: solo IDs existentes del usuario; máximo razonable en UI (p. ej. 8).
- Fechas: `YYYY-MM-DD`, no futuras más allá de `today()` + 1 día (tolerancia zona horaria Bogotá).

### 5.4 Método de pago

No hay campo `paymentMethod`. La UI muestra el tipo de cuenta (p. ej. "Tarjeta de crédito") como proxy del método.

## 6. Modelo de datos

Dueño: `prisma/schema/ledger.prisma` (ver modelos completos en repo).

Fragmentos clave:

```prisma
enum AccountType { CASH BANK CREDIT_CARD SAVINGS INVESTMENT DIGITAL_WALLET }
enum CategoryKind { EXPENSE INCOME TRANSFER }
enum TransactionType { INCOME EXPENSE TRANSFER }
```

Relaciones cruzadas: `Category` enlaza con `BudgetExpense` (M2) y `PeriodLine` (M3); `Transaction` con `LoanPayment` (M4) y `GoalContribution` (M5).

Migración sugerida: `m1_ledger` (junto o después de tablas dependientes según orden de deploy).

## 7. API pública y Server Actions

### `src/modules/ledger/index.ts`

Exportar solo lo necesario a otros módulos:

```ts
// Tipos: AccountSummary, CategoryNode, TransactionListItem, RecordTransactionInput
export { listAccounts, createAccount, updateAccount } from './services/account.service';
export { createTransaction, listRecentTransactions, recordTransaction } from './services/transaction.service';
export { listCategoriesTree, listTags } from './services/category.service';
// Actions para páginas del módulo
export { createTransactionAction, updateTransactionAction, deleteTransactionAction, ... };
```

`recordTransaction(userId, input, tx?)` debe aceptar `DbClient` opcional para composición en M3/M5.

### Server Actions (Zod + `createAction`)

| Action | Entrada resumida | Efecto | Revalida |
|---|---|---|---|
| `createAccountAction` | nombre, tipo, saldo inicial | Crea cuenta | `/cuentas` |
| `updateAccountAction` | id, nombre?, archived? | Actualiza | `/cuentas` |
| `createTransactionAction` | tipo, cuentas, monto, fecha, cat., tags | Crea movimiento | `/movimientos`, `/cuentas`, `/` |
| `updateTransactionAction` | id + campos editables | Actualiza | idem |
| `deleteTransactionAction` | id | Borra (hard delete) | idem |

## 8. Rutas y UI

| Ruta | Contenido |
|---|---|
| `/movimientos` | Tabla filtrable, fila expandible, acciones editar/borrar |
| `/cuentas` | Lista de cuentas con saldo, formulario crear/editar, archivar |
| Quick-add (global) | Sheet/dialog: tipo → cuenta(s) → monto → categoría → tags → guardar |

Componentes compartidos: `MoneyInput`, `DatePicker`, `CategoryCombobox`, `AccountSelect`, `TagMultiSelect`, `EmptyState` si no hay cuentas.

**Flujo quick-add**: atajo `N`; foco en monto; Enter guarda si el formulario es válido; toast de éxito/error vía `Result`.

## 9. Tareas ejecutables

**T-M1-01 — Esquema y migración**  
Modelos `ledger.prisma`, migración, `prisma generate`, índices `[userId, date]`.

**T-M1-02 — Repositorios y saldos**  
`account.repository`, `transaction.repository`, `balance.service` + tests unitarios de §5.2.

**T-M1-03 — Servicios y validadores Zod**  
`account.service`, `transaction.service`, `category.service`.

**T-M1-04 — Server Actions**  
Todas las actions de §7 con `revalidate` correcto.

**T-M1-05 — Seed ledger**  
Registrar seed en orquestador; tags y árbol de categorías idempotente.

**T-M1-06 — UI `/cuentas` y `/movimientos`**  
Listados responsive; estados vacíos con CTA.

**T-M1-07 — Quick-add global**  
Habilitar botón del shell; integrar con `createTransactionAction`.

**T-M1-08 — Tests e integración**  
Vitest: saldos, transferencia, archivado; smoke `docs/smoke/m1.md`.

## 10. Criterios de aceptación

- [ ] CRUD de cuentas y saldos coherentes con movimientos de prueba.
- [ ] Quick-add funciona desde `/` y `/movimientos` con atajo `N`.
- [ ] Filtros de listado por rango de fechas y tipo.
- [ ] Seed crea tags CD…NOP y categorías de Sergio sin duplicar en re-ejecución.
- [ ] Otros módulos pueden llamar `recordTransaction` dentro de `withTransaction`.
- [ ] Lint de dependencias: solo `core` importado desde `ledger` internals vía reglas ESLint.
- [ ] Tag `m1` y smoke documentado.

## 11. Fuera de alcance

- Importación CSV/OFX (M9 backlog).
- Conciliación bancaria automática.
- Multi-moneda distinta de COP.
- Adjuntos (recibos/fotos).

## 12. Preguntas abiertas

- **Q-M1-01**: ¿Hard delete de movimientos o soft delete con auditoría? (v1: hard delete como en implementación actual.)
- **Q-M1-02**: ¿Permitir categorías de gasto en transferencias internas (p. ej. "Pago tarjeta") sin confundir con M4?
- **Q-M1-03**: ¿Límite de profundidad del árbol de categorías (2 vs 3 niveles)?
