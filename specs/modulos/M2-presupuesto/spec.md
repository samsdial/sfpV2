# M2 — Presupuesto

**Estado**: listo para revisión  
**Depende de**: M0, M1  
**Lo usan**: M3, M7  
**Tag al cerrar**: `m2`

---

## 1. Objetivo

Definir el **plan financiero estable** de Sergio: ingresos esperados e ítems de gasto por categoría, con periodicidad y banderas de comportamiento. El presupuesto es plantilla (no cambia mes a mes salvo que Sergio lo edite); M3 congela una copia al abrir cada periodo. M2 muestra totales mensualizados, meta de ahorro (% del ingreso desde ajustes), gasto hormiga y mensajes de estado al estilo Excel.

## 2. Alcance

**Incluye**
- Ítems de ingreso (`BudgetIncome`): etiqueta, tipo fijo/variable, monto mensual en centavos.
- Ítems de gasto (`BudgetExpense`): categoría M1, etiqueta, monto en la periodicidad capturada, banderas `isFixed`, `paidByCard`, `isAntExpense`.
- Normalización a **monto mensual** con `toMonthly` (M0, factores D-07).
- Totales: ingresos, gastos mensualizados, superávit/déficit planeado.
- Meta de ahorro: `savingsTargetRate` de `UserSettings` × ingresos totales → ahorro objetivo mensual.
- Bloque gastos hormiga: tope mensual y **tope diario** derivado (÷ días del periodo actual o 30).
- "Recorte necesario" cuando gastos + ahorro objetivo > ingresos.
- Mensaje motivacional de ahorro (`savings-message.ts` de M0).

**No incluye**
- Comparación plan vs real (M3).
- Líneas congeladas por mes (M3 `PeriodLine`).

## 3. Dependencias

- **M0**: `toMonthly`, `Periodicity`, `getSettings`, mensaje de ahorro.
- **M1**: árbol de categorías (`listCategoriesTree`); solo categorías `EXPENSE` en gastos.

## 4. Historias de usuario

- **US-M2-01**: Como Sergio, quiero listar mis ingresos esperados (salario, extras) para ver el total mensual.
- **US-M2-02**: Como Sergio, quiero presupuestar cada gasto con su periodicidad real (semanal, anual, etc.) y ver el equivalente mensual.
- **US-M2-03**: Como Sergio, quiero marcar gastos fijos, con tarjeta y "hormiga" para que M3 los use.
- **US-M2-04**: Como Sergio, quiero ver si mi plan cierra (ingresos − gastos − meta de ahorro) y cuánto debería recortar.
- **US-M2-05**: Como Sergio, quiero un tope diario de gasto hormiga derivado de mi presupuesto.

## 5. Reglas de negocio y fórmulas

### 5.1 Normalización mensual

Para cada `BudgetExpense`:

```
monthlyCents = toMonthly(amountCents, periodicity)
```

Periodicidades: enum `Periodicity` de M0 (`DAILY` … `ANNUAL`).

### 5.2 Totales del plan

```
totalIncomeCents     = Σ BudgetIncome.amountCents
totalExpenseMonthly  = Σ toMonthly(expense.amountCents, expense.periodicity)
surplusCents         = totalIncomeCents − totalExpenseMonthly
savingsTargetCents   = round(totalIncomeCents × savingsTargetRate)
requiredCutCents     = max(0, totalExpenseMonthly + savingsTargetCents − totalIncomeCents)
```

### 5.3 Gastos hormiga

```
antBudgetMonthly = Σ toMonthly(e.amountCents, e.periodicity) where e.isAntExpense
antDailyCap      = antBudgetMonthly / daysInCurrentPeriod   // daysInCurrentPeriod desde dates.periodRange
```

### 5.4 Estados UI (similar plantilla)

| Condición | Nivel | Mensaje orientativo |
|---|---|---|
| `surplusCents ≥ savingsTargetCents` | good | El plan deja margen para la meta de ahorro. |
| `0 < surplusCents < savingsTargetCents` | warn | El plan cierra pero no alcanza la meta de ahorro configurada. |
| `surplusCents ≤ 0` | danger | Gastos planeados superan ingresos; revisa recorte necesario. |

### 5.5 Ingresos fijo vs variable

`incomeType`: `FIXED` | `VARIABLE` (string en schema). Totales por tipo para M7.

## 6. Modelo de datos

`prisma/schema/budget.prisma`:

```prisma
model BudgetIncome {
  id          String   @id @default(cuid())
  userId      String
  label       String
  incomeType  String   @default("FIXED")  // FIXED | VARIABLE
  amountCents BigInt
  ...
}

model BudgetExpense {
  id           String   @id @default(cuid())
  userId       String
  categoryId   String
  category     Category @relation(...)
  label        String
  amountCents  BigInt
  periodicity  String   @default("MONTHLY")  // Periodicity
  isFixed      Boolean  @default(true)
  paidByCard   Boolean  @default(false)
  isAntExpense Boolean  @default(false)
  ...
}
```

Migración: `m2_budget`.

## 7. API pública y Server Actions

### `src/modules/budget/index.ts`

```ts
export { getBudgetOverview } from './services/budget.service';
export { upsertBudgetIncomeAction, upsertBudgetExpenseAction, deleteBudgetItemAction } from './actions/...';
```

`getBudgetOverview(userId)` → `{ incomes, expenses, totalIncomeCents, totalExpenseMonthlyCents, surplusCents }` (+ campos derivados en servicio o selector UI).

### Server Actions

| Action | Entrada | Efecto |
|---|---|---|
| `upsertBudgetIncomeAction` | id?, label, incomeType, amountCents | Crea/actualiza ingreso |
| `upsertBudgetExpenseAction` | id?, categoryId, label, amount, periodicity, flags | Crea/actualiza gasto |
| `deleteBudgetItemAction` | id, kind: `income` \| `expense` | Elimina ítem |

Revalidar `/presupuesto`, `/`, `/mes/*` si aplica.

## 8. Rutas y UI

**`/presupuesto`**

- Sección **Ingresos**: tabla editable, tipo fijo/variable, total.
- Sección **Gastos**: agrupados por categoría padre (solo lectura del árbol M1); columnas periodicidad, mensualizado, flags (checkboxes).
- Panel resumen: ingresos, gastos mensualizados, superávit, meta de ahorro (% desde ajustes), recorte necesario, mensaje `savings-message`.
- Tarjeta **Gasto hormiga**: presupuesto mensual + tope diario.

UX: montos con `MoneyInput`; periodicidad con select de `PERIODICITIES`.

## 9. Tareas ejecutables

**T-M2-01 — Migración budget**  
Tablas e índices; FK a `Category`.

**T-M2-02 — Repository + servicio**  
`getBudgetOverview`, upserts, deletes.

**T-M2-03 — Cálculos derivados**  
Tests Vitest: normalización, recorte, hormiga diario.

**T-M2-04 — Actions y validación Zod**  
Montos bigint, categoryId válida.

**T-M2-05 — UI `/presupuesto`**  
Layout según `ui-design-system.md`; estados vacíos.

**T-M2-06 — Integración M3**  
Documentar contrato: M3 lee `getBudgetOverview` al abrir periodo.

**T-M2-07 — Smoke `docs/smoke/m2.md`**  
Crear ingreso + gasto semanal → total mensual correcto.

## 10. Criterios de aceptación

- [ ] Totales mensualizados coinciden con tests de `toMonthly`.
- [ ] Meta de ahorro refleja `UserSettings.savingsTargetRate`.
- [ ] Flags `isFixed` alimentan copia en M3 (solo fijos en v1 actual).
- [ ] No se puede enlazar categoría de otro usuario o kind incorrecto.
- [ ] Tag `m2`.

## 11. Fuera de alcance

- Escenarios "what-if" múltiples presupuestos.
- Inflación automática anual.
- Presupuesto por periodo histórico editable (solo plantilla viva).

## 12. Preguntas abiertas

- **Q-M2-01**: ¿Ingresos variables se prorratean igual que gastos o siempre son monto mensual explícito? (v1: monto mensual explícito en `amountCents`.)
- **Q-M2-02**: ¿Mostrar columnas "paga con tarjeta" en totales de flujo de caja o solo informativo hasta M3?
- **Q-M2-03**: ¿Seed de presupuesto inicial desde Excel o solo categorías en M1?
