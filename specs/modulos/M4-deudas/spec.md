# M4 — Deudas

**Estado**: listo para revisión  
**Depende de**: M0, M1  
**Lo usan**: M6, M7  
**Tag al cerrar**: `m4`

---

## 1. Objetivo

Modelar **tarjetas de crédito** (sobre cuentas M1) y **créditos amortizables** (préstamos), estimar uso de cupo e intereses, registrar pagos enlazados a movimientos del libro, y ofrecer un **simulador de amortización** con las funciones de M0 (`loanPayment`, `amortizationSchedule`). No implementa estrategias avalancha/bola de nieve (backlog).

## 2. Alcance

**Incluye**
- Perfil `CreditCardProfile` 1:1 con cuenta tipo `CREDIT_CARD`.
- Campos: cupo, día corte, día pago, tasa E.A., forma de pago habitual (texto/enum UI).
- Uso de cupo = saldo deudor derivado del libro vs `creditLimitCents`; alertas umbral (p. ej. >80 %).
- Interés estimado del periodo (aproximación desde saldo × tasa mensual `eaToMonthly`).
- Créditos `Loan`: monto inicial, saldo actual, cuota mensual, tasa E.A., % pagado.
- Pagos `LoanPayment` opcionalmente vinculados a `Transaction`.
- Simulador: capital, tasa E.A., plazo → cuota y tabla de amortización (export/visualización UI).
- Listado unificado en `/deudas`.

**No incluye**
- Pago automático de factura de tarjeta desde M3 (manual vía M1).
- Integración Open Finance / extractos.
- Estrategias de prepago optimizadas multi-deuda.

## 3. Dependencias

- **M0**: `financeMath.eaToMonthly`, `loanPayment`, `amortizationSchedule` (D-08).
- **M1**: cuentas `CREDIT_CARD`, saldos, movimientos para cupo y pagos.

## 4. Historias de usuario

- **US-M4-01**: Como Sergio, quiero configurar cada tarjeta con cupo, corte y tasa para ver cuánto cupo me queda.
- **US-M4-02**: Como Sergio, quiero registrar mis créditos (CD, vehículo) con saldo y cuota.
- **US-M4-03**: Como Sergio, quiero registrar un abono a un crédito y que quede ligado al movimiento en mi cuenta.
- **US-M4-04**: Como Sergio, quiero simular cuánto pagaría con otra tasa o plazo antes de tomar un crédito.
- **US-M4-05**: Como Sergio, quiero alertas cuando me acerco al tope del cupo.

## 5. Reglas de negocio y fórmulas

### 5.1 Saldo de tarjeta (desde M1)

```
debtCents(cardAccount) = max(0, −balance(cardAccount))
// balance negativo en cuenta tarjeta = deuda
usedPercent = debtCents / creditLimitCents
```

Gastos con tarjeta en M1 deben reflejarse en el saldo (convención M1 §5.2).

### 5.2 Interés estimado (informative)

```
im = eaToMonthly(annualRateEa)
estimatedInterestCents ≈ round(debtCents × im)   // no sustituye extracto bancario
```

### 5.3 Crédito amortizable

```
percentComplete = 100 × (initialCents − balanceCents) / initialCents   // clamp 0..100
```

Actualización de `balanceCents`: manual al registrar pago o ajuste; v1 no recalcula tabla automática en cada pago parcial (documentar).

### 5.4 Pago de crédito

Al registrar pago con movimiento:

1. Crear `Transaction` (típicamente `EXPENSE` o `TRANSFER` desde banco — decisión UI).
2. Crear `LoanPayment` con `transactionId`, reducir `balanceCents` en el mismo `withTransaction`.

### 5.5 Simulador

Entrada: `principal`, `annualRateEa`, `termMonths`, `extraPayment` opcional.  
Salida: cuota mensual + filas `{ k, payment, interest, capital, balance }` (M0).

## 6. Modelo de datos

`prisma/schema/debts.prisma`:

```prisma
model CreditCardProfile {
  id               String           @id @default(cuid())
  accountId        String           @unique
  account          FinancialAccount @relation(...)
  creditLimitCents BigInt
  cutDay           Int              // 1..31
  paymentDay       Int
  annualRateEa     Decimal          @db.Decimal(9, 6)
  usualPayment     String?
}

model Loan {
  id                  String   @id @default(cuid())
  userId              String
  name                String
  initialCents        BigInt
  balanceCents        BigInt
  monthlyPaymentCents BigInt
  annualRateEa        Decimal  @db.Decimal(9, 6)
  payments            LoanPayment[]
}

model LoanPayment {
  id            String       @id @default(cuid())
  loanId        String
  transactionId String?
  amountCents   BigInt
  paidAt        DateTime     @db.Date
}
```

Migración: `m4_debts`. Crear perfil solo si `account.type === CREDIT_CARD`.

## 7. API pública y Server Actions

### `src/modules/debts/index.ts`

```ts
export { getDebtsSummary } from './services/debts.service';
export { upsertLoanAction, upsertCreditCardAction } from './actions/debts-actions';
// simulateLoanAction (simulador, sin persistir)
```

`getDebtsSummary` → `{ loans, cards, totalLoanBalanceCents }` (tarjetas vía saldos M1 + préstamos).

### Server Actions

| Action | Entrada | Efecto |
|---|---|---|
| `upsertCreditCardAction` | accountId, cupo, días, tasa, … | Crea/actualiza perfil |
| `upsertLoanAction` | id?, name, balances, cuota, tasa | Crea/actualiza crédito |
| `registerLoanPaymentAction` | loanId, amount, date, accountId | M1 + LoanPayment + balance |
| `simulateAmortizationAction` | principal, ea, n, extra? | Retorna tabla (sin BD) |

## 8. Rutas y UI

**`/deudas`**

- Pestañas o secciones: **Tarjetas** | **Créditos** | **Simulador**.
- Tarjetas: lista con cupo usado (barra), próximos corte/pago, enlace a cuenta M1.
- Créditos: tabla con % completado, saldo, cuota; formulario pago.
- Simulador: formulario + tabla amortización + cuota destacada.

Copy y alertas en `debtsCopy` (es-CO).

## 9. Tareas ejecutables

**T-M4-01 — Migración debts**  
FK a `FinancialAccount` y `Transaction`.

**T-M4-02 — Repositorio y upserts**  
Validar tipo cuenta tarjeta.

**T-M4-03 — getDebtsSummary + alertas cupo**  
Tests con saldos simulados.

**T-M4-04 — registerLoanPayment**  
Transacción con M1.

**T-M4-05 — Simulador UI + tests finance-math**  
Caso conocido § M0.

**T-M4-06 — Smoke `docs/smoke/m4.md`**

## 10. Criterios de aceptación

- [ ] No se puede crear perfil TC en cuenta no `CREDIT_CARD`.
- [ ] Cupo usado coincide con saldo del libro en escenario de prueba.
- [ ] Simulador coincide con tests M0 de amortización.
- [ ] Pagos de crédito enlazan `transactionId` y reducen saldo.
- [ ] Tag `m4`.

## 11. Fuera de alcance

- Avalancha / bola de nieve (M8+ backlog).
- Calculadora de pago mínimo vs total TC según extracto.
- Múltiples monedas.

## 12. Preguntas abiertas

- **Q-M4-01**: ¿Pagos TC se modelan solo en M1 (transferencia a tarjeta) sin entidad extra?
- **Q-M4-02**: ¿Días corte/pago 29–31 se clampan al último día del mes?
- **Q-M4-03**: ¿Sincronizar `balanceCents` del Loan con tabla amortización automática en cada pago?
