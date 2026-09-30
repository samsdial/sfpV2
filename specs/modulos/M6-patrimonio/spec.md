# M6 — Patrimonio

**Estado**: listo para revisión  
**Depende de**: M0, M1, M4  
**Lo usan**: M7  
**Tag al cerrar**: `m6`

---

## 1. Objetivo

Registrar **activos no líquidos** (inmuebles, vehículos, acciones, otros), calcular **patrimonio neto** consolidando saldos líquidos (M1), activos y pasivos (créditos M4 + deuda de tarjetas desde saldos M1), evitar **doble conteo** de tarjetas, persistir **snapshots mensuales** y mostrar evolución en el tiempo. Snapshots automáticos al cerrar periodo (M3) o manuales desde UI.

## 2. Alcance

**Incluye**
- CRUD `Asset`: nombre, tipo, valor en centavos, notas.
- Función `computeNetWorth(userId, period)` con desglose:
  - `liquidCents`: suma saldos cuentas no archivadas excepto `CREDIT_CARD`.
  - `assetsCents`: Σ `Asset.valueCents`.
  - `loansCents`: Σ `Loan.balanceCents` + deuda tarjetas desde saldos negativos.
  - `netWorthCents = liquidCents + assetsCents − loansCents`.
- Upsert `NetWorthSnapshot` por `(userId, period)` único.
- Gráfico o tabla de evolución (últimos 12 periodos).
- Botón "Actualizar snapshot hoy".

**No incluye**
- Valoración automática (APIs inmobiliarias, bolsa).
- Depreciación contable formal.
- Activos líquidos duplicados (los líquidos vienen solo de M1).

## 3. Dependencias

- **M0**: fechas / clave periodo.
- **M1**: `listAccounts`, saldos.
- **M4**: `getDebtsSummary` (préstamos); tarjetas vía saldos M1.

## 4. Historias de usuario

- **US-M6-01**: Como Sergio, quiero registrar el valor estimado de mi apto, carro e inversiones illíquidas.
- **US-M6-02**: Como Sergio, quiero ver patrimonio neto en un solo número con desglose.
- **US-M6-03**: Como Sergio, quiero guardar una foto mensual del patrimonio para ver evolución.
- **US-M6-04**: Como Sergio, quiero que al cerrar el mes (M3) se guarde el snapshot sin pasos extra.
- **US-M6-05**: Como Sergio, quiero entender que las tarjetas no se suman dos veces (cupo vs deuda).

## 5. Reglas de negocio y fórmulas

### 5.1 Líquidos

```
liquidCents = Σ balance(a) for a in accounts where !archived and type != CREDIT_CARD
```

### 5.2 Deuda tarjetas (sin doble conteo)

```
creditCardDebt = Σ max(0, −balance(a)) for a where type == CREDIT_CARD
loansCents = totalLoanBalanceCents from M4 + creditCardDebt
```

Los perfiles M4 no suman saldo aparte: la deuda vive en el libro.

### 5.3 Patrimonio neto

```
netWorthCents = liquidCents + assetsCents − loansCents
```

### 5.4 Snapshot

- Clave `period` = `YYYY-MM` del periodo contable (misma convención M3).
- `upsert` sobre `(userId, period)`: última ejecución gana (manual o cierre).
- Campos inmutables de auditoría opcional fuera de v1.

### 5.5 Tipos de activo (UI)

`INMUEBLE`, `VEHICULO`, `ACCIONES`, `OTRO` (string `assetType` en schema).

## 6. Modelo de datos

`prisma/schema/networth.prisma`:

```prisma
model Asset {
  id         String   @id @default(cuid())
  userId     String
  name       String
  assetType  String
  valueCents BigInt
  notes      String?
}

model NetWorthSnapshot {
  id            String   @id @default(cuid())
  userId        String
  period        String   @db.Char(7)
  liquidCents   BigInt
  assetsCents   BigInt
  loansCents    BigInt
  netWorthCents BigInt
  createdAt     DateTime @default(now())
  @@unique([userId, period])
}
```

Migración: `m6_networth`.

## 7. API pública y Server Actions

### `src/modules/networth/index.ts`

```ts
export { listAssets, computeNetWorth } from './services/networth.service';
export { upsertAssetAction, computeNetWorthAction } from './actions/networth-actions';
export { listSnapshots } from './repository/...';  // para gráfico M6/M7
```

`computeNetWorth` persiste snapshot y retorna desglose completo para UI.

### Server Actions

| Action | Entrada | Efecto |
|---|---|---|
| `upsertAssetAction` | id?, name, type, valueCents, notes? | CRUD activo |
| `deleteAssetAction` | id | Elimina activo |
| `computeNetWorthAction` | period? (default periodo actual) | Recalcula y upsert snapshot |

## 8. Rutas y UI

**`/patrimonio`**

- KPI grande: patrimonio neto + variación vs snapshot anterior (si existe).
- Tres filas: líquidos (enlace `/cuentas`), activos (tabla editable), pasivos (enlace `/deudas`).
- Lista de activos con formulario modal.
- Gráfico línea o barras: `netWorthCents` por periodo (12 puntos).
- CTA "Recalcular ahora".

## 9. Tareas ejecutables

**T-M6-01 — Migración networth**

**T-M6-02 — computeNetWorth + tests**  
Escenario: banco + TC + loan + activo; verificar no doble conteo.

**T-M6-03 — Hook cierre M3**  
Llamada desde `closePeriod`.

**T-M6-04 — listSnapshots + chart component**

**T-M6-05 — UI `/patrimonio`**

**T-M6-06 — Smoke `docs/smoke/m6.md`**

## 10. Criterios de aceptación

- [ ] Fórmula §5.3 coincide con test fixture documentado.
- [ ] Snapshot único por periodo; segundo compute sobrescribe.
- [ ] Cierre M3 genera snapshot sin error si M6 desplegado.
- [ ] Tag `m6`.

## 11. Fuera de alcance

- Cotizaciones en tiempo real.
- Impuestos patrimoniales.
- Activos en moneda extranjera.

## 12. Preguntas abiertas

- **Q-M6-01**: ¿Incluir cuentas `INVESTMENT` en líquidos o solo en activos manuales?
- **Q-M6-02**: ¿Historial de snapshots borrado al recalcular o versionado?
- **Q-M6-03**: ¿Mostrar patrimonio bruto vs neto en M7?
