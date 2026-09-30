# M5 — Metas de ahorro

**Estado**: listo para revisión  
**Depende de**: M0, M1, M3  
**Lo usan**: M7  
**Tag al cerrar**: `m5`

---

## 1. Objetivo

Permitir a Sergio definir **metas de ahorro ilimitadas** (compra, viaje, vehículo, fondo de emergencia, otra), calcular el **aporte mensual requerido** con rendimiento anual opcional, registrar aportes (vinculados a movimientos M1 o manuales), mostrar progreso y contrastar con el **disponible del mes** (M3). No incluye número FI ni simulaciones de inversión avanzadas (backlog).

## 2. Alcance

**Incluye**
- CRUD `SavingsGoal`: nombre, tipo, monto objetivo, monto acumulado, fecha meta opcional, tasa de rendimiento E.A. opcional.
- Cálculo `monthlyRequiredCents` con `requiredMonthlyContribution` (M0) cuando hay fecha y tasa.
- Registro `GoalContribution` con monto, fecha, nota, enlace opcional a `Transaction`.
- Aporte vía transferencia/gasto desde cuenta M1 (flujo atómico en servicio).
- Barra de progreso `% = currentCents / targetCents`.
- Comparación UI: suma de aportes requeridos vs `availableReal` del periodo actual (M3).

**No incluye**
- Independencia financiera (FI) ni retiro.
- Carteras de inversión / precios de mercado en vivo.
- Metas compartidas o multiusuario.

## 3. Dependencias

- **M0**: `financeMath.requiredMonthlyContribution`, `eaToMonthly`, fechas.
- **M1**: `recordTransaction` para aportes desde cuenta.
- **M3**: `getPeriodPlanVsReal` o `availableReal` del mes en curso.

## 4. Historias de usuario

- **US-M5-01**: Como Sergio, quiero crear una meta con monto objetivo y fecha para saber cuánto ahorrar al mes.
- **US-M5-02**: Como Sergio, quiero registrar un aporte y ver avanzar la barra de progreso.
- **US-M5-03**: Como Sergio, quiero opcionalmente indicar rendimiento esperado (CDT, fondo) en el cálculo.
- **US-M5-04**: Como Sergio, quiero saber si el disponible real del mes alcanza para cubrir todas mis metas.
- **US-M5-05**: Como Sergio, quiero varias metas activas sin límite artificial.

## 5. Reglas de negocio y fórmulas

### 5.1 Aporte mensual requerido

Si hay `targetDate` en el futuro y opcionalmente `annualReturnRate`:

```
monthsLeft = meses completos entre today() y targetDate   // definir en dates helper
im = annualReturnRate ? eaToMonthly(annualReturnRate) : 0
monthlyRequired = requiredMonthlyContribution(
  fv = targetCents,
  pv = currentCents,
  im,
  n = monthsLeft
)
```

Si no hay fecha: `monthlyRequiredCents` queda null y la UI pide aporte manual sugerido.

### 5.2 Progreso

```
progress = min(1, currentCents / targetCents)
completed = currentCents >= targetCents
```

### 5.3 Registrar aporte (con movimiento)

En una transacción DB:

1. `recordTransaction`: tipo `EXPENSE` desde `accountId` (dinero apartado — convención Sergio; alternativa `TRANSFER` a cuenta ahorro: Q-M5-01).
2. Crear `GoalContribution` con `transactionId`.
3. Incrementar `currentCents` de la meta en `amountCents`.

Aporte manual (sin movimiento): solo pasos 2–3 con `transactionId = null`.

### 5.4 Comparación con el mes

```
totalRequiredMonthly = Σ (monthlyRequiredCents ?? 0) over active goals
gap = availableReal − totalRequiredMonthly   // from M3 current period
```

## 6. Modelo de datos

`prisma/schema/goals.prisma`:

```prisma
model SavingsGoal {
  id                   String    @id @default(cuid())
  userId               String
  name                 String
  goalType             String    @default("OTHER")  // PURCHASE, TRAVEL, VEHICLE, EMERGENCY, OTHER
  targetCents          BigInt
  currentCents         BigInt    @default(0)
  monthlyRequiredCents BigInt?
  annualReturnRate     Decimal?  @db.Decimal(9, 6)
  targetDate           DateTime? @db.Date
  contributions        GoalContribution[]
}

model GoalContribution {
  id            String       @id @default(cuid())
  goalId        String
  transactionId String?
  amountCents   BigInt
  contributedAt DateTime     @db.Date
  note          String?
}
```

Migración: `m5_goals`.

## 7. API pública y Server Actions

### `src/modules/goals/index.ts`

```ts
export { listSavingsGoals } from './services/goals.service';
export { upsertGoalAction, addContributionAction } from './actions/goals-actions';
// export computeGoalPlan(goal) helper si se necesita en M7
```

### Server Actions

| Action | Entrada | Efecto |
|---|---|---|
| `upsertGoalAction` | id?, name, goalType, targetCents, targetDate?, rate? | Recalcula monthlyRequired |
| `addContributionAction` | goalId, amount, date, accountId?, note? | Aporte ± movimiento M1 |
| `deleteGoalAction` | id | Soft/archivar o delete (definir) |

Revalidar `/metas`, `/`.

## 8. Rutas y UI

**`/metas`**

- Grid de tarjetas: nombre, tipo, progreso, meta, aporte mensual sugerido, fecha.
- Formulario crear/editar meta; selector tipo; `MoneyInput`; fecha meta; tasa opcional.
- Dialog aporte rápido: monto, cuenta origen, fecha.
- Banner resumen: "Este mes necesitas X; disponible real Y" (enlace a `/mes/...`).

## 9. Tareas ejecutables

**T-M5-01 — Migración goals**

**T-M5-02 — Servicio upsert + cálculo monthlyRequired**  
Tests con tasa 0 y tasa > 0.

**T-M5-03 — registerContribution + M1**

**T-M5-04 — Integración M3**  
Helper `compareGoalsToAvailable(userId, period)`.

**T-M5-05 — UI `/metas`**

**T-M5-06 — Smoke `docs/smoke/m5.md`**

## 10. Criterios de aceptación

- [ ] Cálculo de aporte mensual coincide con tests M0 para caso fv/pv/n conocido.
- [ ] Aporte incrementa `currentCents` y crea movimiento cuando se elige cuenta.
- [ ] Lista sin límite de metas; rendimiento UI estable en móvil.
- [ ] Tag `m5`.

## 11. Fuera de alcance

- FI / número mágico de retiro.
- Rebalanceo automático entre metas.
- Integración con broker.

## 12. Preguntas abiertas

- **Q-M5-01**: ¿Aporte contabiliza como `EXPENSE` genérico o `TRANSFER` a cuenta `SAVINGS` dedicada?
- **Q-M5-02**: ¿Permitir meta cumplida archivada automáticamente?
- **Q-M5-03**: ¿Recalcular `monthlyRequired` cada día o solo al guardar meta?
