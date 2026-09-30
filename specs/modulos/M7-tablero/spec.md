# M7 — Tablero ("Mis Finanzas")

**Estado**: listo para revisión  
**Depende de**: M0; lectura de M1–M6 (según fases v1/v2)  
**Lo usan**: — (capa de presentación)  
**Tag al cerrar**: `m7` (v1 tras M3; v2 completo tras M5+M6)

---

## 1. Objetivo

Ofrecer en **`/`** la vista consolidada **"Mis Finanzas"** (equivalente a la hoja Excel homónima): métricas del mes en curso (esperado vs real), alertas de todos los módulos, distribución de gasto, ingresos fijo/variable, resúmenes de metas, deudas y patrimonio, y visión anual. Es **solo lectura** excepto el acceso al quick-add de M1. El tablero **degrada con gracia** si módulos aún no están implementados (placeholders por sección).

## 2. Alcance

**Incluye**
- Orquestación `getDashboardSummary(userId)` agregando servicios públicos de M1–M6.
- KPIs fila principal: ingresos esperados, gastos esperados, disponible (plan) vs real del periodo actual.
- Alertas consolidadas (meta de ahorro, déficit plan, cupo TC, metas vs disponible, gastos > ingresos).
- Distribución gasto por categoría padre (movimientos del periodo o mensualizado plan — definir fuente en §5).
- Desglose ingresos fijos vs variables (M2).
- Bloques resumen: últimos movimientos (M1), metas activas (M5), deudas (M4), patrimonio neto (M6).
- Resumen anual: 12 columnas ingreso/gasto/disponible (plan o real según disponibilidad M3).
- Mensajes estilo plantilla (sin emojis obligatorios; usar `StatusMessage`).

**No incluye**
- Edición de presupuesto, metas o movimientos inline (navegar a módulo dueño).
- Export PDF/Excel (backlog M10).
- Widgets configurables por el usuario.

## 3. Dependencias

- **M0**: `getSettings`, `today`, `periodOf`, mensaje ahorro.
- **M1**: `listRecentTransactions`, `listAccounts`.
- **M2**: `getBudgetOverview`.
- **M3**: `getPeriodPlanVsReal`, estado periodo (v1 mínimo).
- **M4–M6**: resúmenes públicos cuando existan tags correspondientes.

Orden de entrega (README §5): **M7 v1** tras M3 (plan vs real); **M7 v2** tras M5+M6.

## 4. Historias de usuario

- **US-M7-01**: Como Sergio, al entrar a la app quiero ver de un vistazo si el mes va bien.
- **US-M7-02**: Como Sergio, quiero alertas claras cuando gastos superan ingresos o no alcanzo la meta de ahorro.
- **US-M7-03**: Como Sergio, quiero ver cómo se reparte mi gasto por categoría este mes.
- **US-M7-04**: Como Sergio, quiero accesos rápidos a registrar un movimiento o abrir el mes actual.
- **US-M7-05**: Como Sergio, quiero ver metas, deudas y patrimonio resumidos sin abrir cada módulo.

## 5. Reglas de negocio y fórmulas

### 5.1 Periodo de referencia

```
settings = getSettings(userId)
period = periodOf(today(), settings.periodStartDay)
```

Todos los KPIs "del mes" usan ese `period` y su `periodRange`.

### 5.2 KPIs principales (plantilla §3.2.1)

| Métrica | Fuente v1 |
|---|---|
| Ingresos esperados | `budget.totalIncomeCents` |
| Gastos esperados | `budget.totalExpenseMonthlyCents` |
| Disponible esperado | `budget.surplusCents` |
| Ingresos reales | `comparison.realIncomeCents` |
| Gastos reales | `comparison.realExpenseCents` |
| Disponible real | `comparison.availableReal` |

### 5.3 Alertas (prioridad descendente)

1. `realExpenseCents > realIncomeCents` → danger (gastos superan ingresos).
2. `surplusCents < savingsTargetCents` (plan) → warn meta ahorro.
3. `availableReal < totalRequiredMonthly` metas (M5) → warn metas.
4. Tarjeta con `usedPercent > 0.8` (M4) → warn cupo.
5. Mensaje positivo si plan cierra y real va ≤ plan gasto (good).

### 5.4 Distribución por categoría

Agregar movimientos `EXPENSE` del periodo agrupados por categoría raíz (resolver padre vía árbol M1). Mostrar top N + "Otros".

### 5.5 Ingresos fijo / variable

```
fixed = Σ income where incomeType === FIXED
variable = totalIncomeCents − fixed
```

### 5.6 Resumen anual

Para `period` en enero–diciembre del año calendario del periodo actual (o año fiscal Sergio): preferir datos reales si periodo M3 cerrado, si no plan M2 o guiones.

## 6. Modelo de datos

M7 **no posee tablas** (`dashboard` sin `*.prisma`). Solo lectura vía APIs de otros módulos. Cache en memoria/request; sin Redis en v1.

## 7. API pública y Server Actions

### `src/modules/dashboard/index.ts`

```ts
export { getDashboardSummary } from './services/dashboard.service';
export { dashboardCopy } from './copy';
```

Sin Server Actions de escritura (salvo re-exportar quick-add M1 en layout, fuera del módulo).

`getDashboardSummary` retorna objeto estable documentado:

```ts
{
  period, settings,
  budget,           // M2 overview
  comparison?,      // M3 plan vs real
  transactions,     // últimos 10 M1
  accounts, goals, debts, netWorth
}
```

Campos opcionales `null` si módulo no desplegado.

## 8. Rutas y UI

**`/` (Tablero)**

Layout sugerido (desktop):

```
┌─────────────────────────────────────────────────────────┐
│ KPI: Ingresos | Gastos | Disponible (plan / real)       │
│ StatusMessage alerta principal                          │
├──────────────────────┬──────────────────────────────────┤
│ Gráfico gastos cat.  │ Fijo vs variable + termómetro    │
├──────────────────────┴──────────────────────────────────┤
│ Últimos movimientos          │ Metas (top 3)            │
├──────────────────────────────┼──────────────────────────┤
│ Deudas resumen               │ Patrimonio neto          │
├─────────────────────────────────────────────────────────┤
│ Tabla resumen anual (12 meses)                          │
└─────────────────────────────────────────────────────────┘
```

Enlaces: "Ver presupuesto", "Mes actual", "Registrar" (quick-add M1). Mobile: KPIs apilados, gráficos simplificados.

## 9. Tareas ejecutables

**T-M7-01 — dashboard.service v1**  
M0+M1+M2+M3; tests de agregación con mocks.

**T-M7-02 — UI `/` v1**  
KPIs + alertas + enlace mes.

**T-M7-03 — Distribución categorías + chart**  
Usar token de colores categoría M1.

**T-M7-04 — Integrar M4+M5+M6 (v2)**  
Ampliar summary y bloques UI.

**T-M7-05 — Resumen anual**

**T-M7-06 — Smoke `docs/smoke/m7.md`**  
v1 y v2 checklist.

## 10. Criterios de aceptación

- [ ] `/` carga sin error con solo M0–M3 (secciones M4–6 ocultas o placeholder).
- [ ] Alertas §5.3 coinciden con datos semilla de prueba.
- [ ] No importa repositorios internos de otros módulos (solo `index.ts`).
- [ ] Quick-add sigue funcionando desde tablero.
- [ ] Tag `m7` (v1 y/o v2 documentado en release notes).
- [ ] Performance: una sola ronda de `Promise.all` razonable (< ~15 queries).

## 11. Fuera de alcance

- Personalización de widgets.
- Notificaciones push/email.
- Modo presentación / TV.

## 12. Preguntas abiertas

- **Q-M7-01**: ¿Gráfico de categorías usa gasto real, plan o ambos toggle?
- **Q-M7-02**: ¿Resumen anual año calendario vs año fiscal desde `periodStartDay`?
- **Q-M7-03**: ¿Unificar copy de alertas con Excel literal o tono SFP simplificado?
