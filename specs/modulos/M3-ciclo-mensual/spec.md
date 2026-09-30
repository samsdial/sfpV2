# M3 — Ciclo mensual

**Estado**: listo para revisión  
**Depende de**: M0, M1, M2  
**Lo usan**: M5, M7  
**Tag al cerrar**: `m3`

---

## 1. Objetivo

Gestionar el **mes en curso** como un periodo acotado (`YYYY-MM` según `periodStartDay`): abrir periodo con copia congelada del plan, comparar **plan vs real**, marcar pagos fijos (generando movimiento en M1), visualizar avance del mes (termómetro, disponible) y cerrar con resumen. Incluye vista anual de 12 periodos. No genera movimientos sin acción explícita de Sergio.

## 2. Alcance

**Incluye**
- Entidad `Period` por usuario y etiqueta `period` (única).
- Apertura: copia de gastos **fijos** del presupuesto a `PeriodLine` (`FIXED_EXPENSE`).
- Marcar línea pagada → crea `EXPENSE` en M1 y enlaza `transactionId`.
- Agregados plan vs real: ingresos/gastos planeados (desde M2) vs suma de movimientos M1 en el rango del periodo.
- Lista de pagos fijos del mes con estado pagado/pendiente.
- Gasto por método de pago (tipo de cuenta) y desglose tarjetas (cuentas `CREDIT_CARD`).
- Termómetro del mes (`spendRatio` = real gasto / plan gasto).
- Disponible esperado vs real (ingresos − gastos, plan y real).
- Cierre de periodo: `status = CLOSED`, `closedAt`; opcional snapshot patrimonio (M6).
- Vista `/mes/[periodo]` y rejilla anual `/mes` o selector de 12 meses.

**No incluye**
- Auto-cargo de recurrentes no marcados por el usuario.
- Reabrir periodo cerrado (v1: fuera de alcance salvo decisión explícita).

## 3. Dependencias

- **M0**: `periodOf`, `periodRange`, `daysLeftInPeriod`, `shiftPeriod`, `getSettings`.
- **M1**: `listRecentTransactions`, `recordTransaction`.
- **M2**: `getBudgetOverview` al abrir periodo.

## 4. Historias de usuario

- **US-M3-01**: Como Sergio, quiero abrir el mes y ver qué pagos fijos debo hacer según mi presupuesto.
- **US-M3-02**: Como Sergio, al marcar un pago fijo quiero que se registre el gasto en mi cuenta elegida.
- **US-M3-03**: Como Sergio, quiero ver si voy gastando más rápido de lo planeado (termómetro).
- **US-M3-04**: Como Sergio, quiero comparar ingresos y gastos reales contra el plan del mes.
- **US-M3-05**: Como Sergio, quiero cerrar el mes y pasar al siguiente con resumen.
- **US-M3-06**: Como Sergio, quiero una vista de los 12 meses del año para ver tendencia.

## 5. Reglas de negocio y fórmulas

### 5.1 Identificación del periodo

```
periodKey = periodOf(date, settings.periodStartDay)   // "YYYY-MM"
{ from, to } = periodRange(periodKey, settings.periodStartDay)  // inclusive, ISO date
```

El periodo se nombra por el mes en que **empieza** el rango (D-09 / M0).

### 5.2 Apertura (`openPeriod`)

1. Si ya existe `Period` para `(userId, periodKey)`, retornar existente (idempotente).
2. Crear `Period` con `status = OPEN`.
3. Para cada `BudgetExpense` con `isFixed = true`, crear `PeriodLine`:
   - `lineType = FIXED_EXPENSE`
   - `plannedCents = amountCents` del ítem (monto en periodicidad capturada, no re-normalizado en la línea v1)
   - `categoryId`, `label` copiados
   - `paid = false`

### 5.3 Marcar pagado

Transacción atómica (`withTransaction`):

1. Validar línea pertenece al usuario, periodo abierto, `paid = false`.
2. `recordTransaction` tipo `EXPENSE` con monto `plannedCents`, cuenta elegida, categoría de la línea.
3. Actualizar línea: `paid = true`, `transactionId`.

### 5.4 Plan vs real

```
plannedIncomeCents  = getBudgetOverview().totalIncomeCents
plannedExpenseCents = getBudgetOverview().totalExpenseMonthlyCents
realIncomeCents     = Σ tx.amount where type=INCOME and date in [from, to]
realExpenseCents    = Σ tx.amount where type=EXPENSE and date in [from, to]
spendRatio          = plannedExpenseCents > 0 ? realExpenseCents / plannedExpenseCents : 0
availablePlan       = plannedIncomeCents − plannedExpenseCents
availableReal       = realIncomeCents − realExpenseCents
```

Transferencias no cuentan como ingreso/gasto en estos totales.

### 5.5 Cierre

- Solo si `status = OPEN`.
- Set `CLOSED`, `closedAt = now()`.
- Hook opcional: llamar `computeNetWorth(userId, periodKey)` (M6).

## 6. Modelo de datos

`prisma/schema/monthly.prisma`:

```prisma
model Period {
  id        String   @id @default(cuid())
  userId    String
  period    String   @db.Char(7)   // YYYY-MM
  status    String   @default("OPEN")  // OPEN | CLOSED
  closedAt  DateTime?
  lines     PeriodLine[]
  @@unique([userId, period])
}

model PeriodLine {
  id            String   @id @default(cuid())
  periodId      String
  categoryId    String?
  label         String
  lineType      String   // FIXED_EXPENSE, (futuro: INCOME_PLANNED, ...)
  plannedCents  BigInt
  paid          Boolean  @default(false)
  transactionId String?
}
```

Migración: `m3_monthly`.

## 7. API pública y Server Actions

### `src/modules/monthly/index.ts`

```ts
export { getPeriodDetail, openPeriod, markPeriodLinePaid } from './services/period.service';
export { getPeriodPlanVsReal } from './services/comparison.service';
export { openPeriodAction, markLinePaidAction } from './actions/period-actions';
// closePeriodAction (a implementar si falta)
```

### Server Actions

| Action | Entrada | Efecto |
|---|---|---|
| `openPeriodAction` | `period: YYYY-MM` | Abre y copia fijos |
| `markLinePaidAction` | `lineId`, `accountId`, `date` | Pago + movimiento M1 |
| `closePeriodAction` | `period` | Cierra periodo |

## 8. Rutas y UI

| Ruta | UI |
|---|---|
| `/mes/[periodo]` | Header con rango de fechas; KPIs plan/real; termómetro; tabla pagos fijos; botón cerrar mes |
| Sidebar "Mes actual" | Link a `periodOf(today(), periodStartDay)` |
| Vista anual | 12 celdas con estado (no abierto / abierto / cerrado) y `spendRatio` color |

Componentes: `Progress` termómetro, `StatusMessage` según ratio, confirmación al cerrar.

## 9. Tareas ejecutables

**T-M3-01 — Migración monthly**  
`Period`, `PeriodLine`.

**T-M3-02 — openPeriod + repositorio**  
Copia de fijos; tests idempotencia.

**T-M3-03 — markPeriodLinePaid**  
Integración M1 en transacción.

**T-M3-04 — comparison.service**  
Tests rango de fechas con `startDay ≠ 1`.

**T-M3-05 — closePeriod + hook M6**  
Documentar orden con snapshot.

**T-M3-06 — UI `/mes/[periodo]`**  
Navegación prev/next con `shiftPeriod`.

**T-M3-07 — Vista anual y smoke `docs/smoke/m3.md`**

## 10. Criterios de aceptación

- [ ] Abrir periodo crea líneas solo una vez.
- [ ] Marcar pagado crea exactamente un movimiento enlazado.
- [ ] Plan vs real respeta `periodRange` y timezone Bogotá.
- [ ] Periodo cerrado no permite marcar pagos (error claro).
- [ ] Tag `m3`.

## 11. Fuera de alcance

- Generación automática de nómina u otros ingresos.
- Edición masiva de líneas congeladas (cambiar plan → solo afecta nuevas aperturas).
- Presupuesto variable copiado línea a línea (solo fijos en v1).

## 12. Preguntas abiertas

- **Q-M3-01**: ¿`plannedCents` en línea debe ser monto mensualizado o monto bruto del ítem? (Alinear con Excel y revisar con Sergio.)
- **Q-M3-02**: ¿Al cambiar `periodStartDay` en ajustes, periodos históricos permanecen con la clave antigua?
- **Q-M3-03**: ¿Reapertura de mes cerrado para correcciones?
