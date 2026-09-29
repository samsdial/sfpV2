# SFP v2 — Especificaciones (Spec Driven Development)

**Proyecto**: Sistema Financiero Personal v2 (`sfp-v2`)
**Autor / dueño**: Sergio
**Versión del set de specs**: 2.0.0-draft
**Fecha**: septiembre 2026
**Destinatario**: IA ejecutora (agente de código) + Sergio como revisor

Esta carpeta es la **fuente de verdad** del proyecto. El código implementa lo que dicen estos archivos; si el código necesita algo distinto, primero se actualiza el spec.

---

## 1. Qué es SFP v2

Aplicación web personal (un solo usuario) para gestionar las finanzas de Sergio en COP. Reemplaza sus hojas de Excel y toma como referencia funcional la plantilla "Presupuesto Personal 2026" (ver `referencias/plantilla-presupuesto-2026.md`).

La idea central de v2 es separar dos mundos que conviven mes a mes:

- **El plan**: un presupuesto-plantilla estable (ingresos esperados, gastos con periodicidad, meta de ahorro).
- **La realidad**: los movimientos que ocurren cada mes.

Cada mes se abre un periodo con una copia congelada del plan, y el sistema compara plan contra real. Deudas, metas y patrimonio se alimentan del mismo libro de movimientos. El tablero reúne todo en una sola lectura.

---

## 2. Cómo usar estos specs (instrucciones para la IA ejecutora)

1. Lee **siempre** este README y toda la carpeta `00-fundamentos/` antes de tocar cualquier módulo.
2. Lee el `spec.md` del módulo que vas a construir y los de los módulos de los que depende.
3. Genera un **plan de tareas** detallado del módulo y espera el OK de Sergio antes de escribir código.
4. Implementa por bloques pequeños. Al terminar cada bloque, reporta y espera "ok".
5. Al cerrar un módulo: marca los criterios de aceptación, actualiza la tabla de estado (sección 6) y crea el tag Git correspondiente (`m0`, `m1`, …).
6. Si algo del spec es ambiguo o contradictorio, **pregunta**; no inventes. Si una decisión técnica del spec quedó obsoleta (versión de librería, API cambiada), propón el cambio al spec antes de implementar.
7. Nunca implementes funcionalidades listadas como "Fuera de alcance" de un módulo.

---

## 3. Estructura de esta carpeta

```
specs/
├── README.md                      ← este archivo (índice, alcances, decisiones)
├── 00-fundamentos/
│   ├── stack.md                   ← versiones y librerías, con justificación
│   ├── arquitectura.md            ← monolito modular, carpetas, reglas de dependencia, dueños de tablas
│   ├── convenciones.md            ← dinero, fechas, Result, Server Actions, naming, commits, tests, DoD
│   ├── ui-design-system.md        ← shadcn/ui + 21st.dev, tokens, principios visuales, componentes base
│   └── deploy-hostinger.md        ← local (Docker) y producción (Hostinger Node.js Web Apps + MySQL)
├── modulos/
│   ├── M0-nucleo/spec.md
│   ├── M1-libro/spec.md
│   ├── M2-presupuesto/spec.md
│   ├── M3-ciclo-mensual/spec.md
│   ├── M4-deudas/spec.md
│   ├── M5-metas/spec.md
│   ├── M6-patrimonio/spec.md
│   └── M7-tablero/spec.md
├── backlog/                       ← módulos futuros (M8+), solo resumen
└── referencias/
    ├── plantilla-presupuesto-2026.md   ← análisis de la plantilla Excel de referencia (llegó truncado en §3.8.7)
    └── spec-sfp-v0.1.md                ← spec original v0.1 (histórico, no normativo)
```

Cada `spec.md` de módulo sigue la misma plantilla:

1. Objetivo
2. Alcance (incluye / no incluye)
3. Dependencias
4. Historias de usuario
5. Reglas de negocio y fórmulas
6. Modelo de datos (fragmento Prisma del módulo)
7. API pública del módulo (`index.ts`) y Server Actions
8. Rutas y UI
9. Tareas ejecutables (`T-Mx-NN`)
10. Criterios de aceptación
11. Fuera de alcance
12. Preguntas abiertas

---

## 4. Mapa de módulos y alcances

| Módulo | Nombre | Depende de | Ruta principal |
|---|---|---|---|
| M0 | Núcleo | — | `/login`, `/ajustes` |
| M1 | Libro (cuentas y movimientos) | M0 | `/movimientos`, `/cuentas` |
| M2 | Presupuesto (plantilla) | M0, M1 | `/presupuesto` |
| M3 | Ciclo mensual (plan vs real) | M1, M2 | `/mes/[periodo]` |
| M4 | Deudas (tarjetas y créditos) | M1 | `/deudas` |
| M5 | Metas de ahorro | M1, M3 | `/metas` |
| M6 | Patrimonio | M1, M4 | `/patrimonio` |
| M7 | Tablero ("Mis Finanzas") | Lee de M1–M6 | `/` |

```
                ┌──────────────┐
                │  M0 Núcleo   │  auth · ajustes · dinero/fechas · UI · deploy
                └──────┬───────┘
                       │
                ┌──────▼───────┐
      ┌─────────┤  M1 Libro    ├──────────┬───────────┐
      │         └──────┬───────┘          │           │
┌─────▼──────┐  ┌──────▼───────┐   ┌──────▼─────┐     │
│ M2 Presup. ├──► M3 Ciclo mes ├───► M5 Metas   │     │
└────────────┘  └──────┬───────┘   └──────┬─────┘     │
                       │           ┌──────▼─────┐ ┌───▼────────┐
                       │           │M6 Patrimon.◄─┤ M4 Deudas  │
                       │           └──────┬─────┘ └───┬────────┘
                       │                  │           │
                ┌──────▼──────────────────▼───────────▼──┐
                │        M7 Tablero (solo lectura)        │
                └─────────────────────────────────────────┘
```

### M0 — Núcleo
**Incluye**: inicialización del proyecto, tooling (lint, formato, tests, CI), MySQL local con Docker, Prisma 7 con adaptador MariaDB, autenticación de un solo usuario (Better Auth), ajustes del usuario, librerías compartidas (dinero, fechas, periodicidad, matemática financiera), design system (shadcn/ui) y shell de la aplicación con navegación, esqueleto de carpetas de todos los módulos, pipeline de deploy a Hostinger y ruta de salud.
**No incluye**: ninguna funcionalidad financiera.

### M1 — Libro
**Incluye**: cuentas financieras (efectivo, banco, ahorro, inversión, tarjeta de crédito, billetera digital), categorías jerárquicas de ingreso y gasto, tags cruzados (CD, TJ, PT, MR, PPS, SAM, NOP), movimientos de tipo ingreso, gasto y transferencia, registro rápido (quick-add) desde cualquier pantalla, listado filtrable con edición y eliminación, saldos por cuenta, y seed inicial con la taxonomía de Sergio. El "método de pago" (transferencia, tarjeta, efectivo) se deriva del tipo de cuenta, no se captura aparte.
**No incluye**: presupuesto, recurrentes, importación de extractos.

### M2 — Presupuesto
**Incluye**: plantilla de ingresos esperados (fijo o variable), ítems de gasto por categoría con periodicidad (diaria a anual) y banderas (gasto fijo, se paga con tarjeta, gasto hormiga), normalización a monto mensual, totales por categoría y por tipo, meta de ahorro como % del ingreso, presupuesto de gastos hormiga y tope diario, "recorte necesario" y mensajes de estado.
**No incluye**: comparación contra lo real (eso es M3).

### M3 — Ciclo mensual
**Incluye**: periodos mensuales, apertura de periodo con copia congelada del presupuesto, plan vs real por categoría y por tipo, lista de pagos fijos del mes (marcar pagado genera el movimiento en M1), gasto por método de pago y por tarjeta, termómetro del mes, disponible esperado vs real, cierre de periodo con resumen, y vista anual de 12 meses.
**No incluye**: generación automática de movimientos sin intervención del usuario.

### M4 — Deudas
**Incluye**: perfil de tarjeta de crédito sobre una cuenta de M1 (cupo, día de corte, día de pago, tasa E.A., forma de pago habitual), uso del cupo con alertas, intereses estimados, créditos (monto inicial, saldo actual, cuota, tasa, % completado), pagos vinculados a movimientos de M1, y simulador de amortización.
**No incluye**: estrategias de pago automáticas (avalancha y bola de nieve quedan en backlog).

### M5 — Metas de ahorro
**Incluye**: metas sin límite de cantidad (compra, viaje, vehículo, fondo de emergencia, otra), aporte mensual requerido con rendimiento opcional, aportes registrados (vinculados a transferencias de M1 o manuales), progreso y comparación con el disponible del mes.
**No incluye**: número FI ni simulaciones de inversión (backlog).

### M6 — Patrimonio
**Incluye**: activos no líquidos (inmuebles, vehículos, acciones, otros), patrimonio neto calculado (saldos de M1 + activos − créditos de M4, sin doble conteo de tarjetas), snapshots mensuales (automático al cerrar periodo o manual) y evolución en el tiempo.
**No incluye**: valoración automática de activos.

### M7 — Tablero
**Incluye**: la vista "Mis Finanzas": métricas esperadas vs reales del mes en curso, alertas consolidadas de todos los módulos, distribución de gasto por categoría, ingresos fijo/variable, resumen de metas, deudas y patrimonio, y resumen anual. Es solo lectura y crece a medida que se terminan los módulos.
**No incluye**: escritura de datos (salvo el acceso al quick-add global de M1).

### Backlog (M8+)
M8 anti-impulso (wishlist + cooldown), M9 importación CSV/OFX/Excel (Bancolombia, Nequi, Davivienda, formato Opnicron), M10 reportes y datos de mercado (BanRep, DANE), M11 agente IA con tool use. Ver `backlog/`.

---

## 5. Orden de construcción

```
M0 → M1 → M2 → M3 → M7 (v1: plan vs real) → M4 → M5 → M6 → M7 (v2: completo)
```

Cada módulo se entrega funcionando en local, con tests, y desplegado en Hostinger antes de empezar el siguiente.

---

## 6. Estado

| Módulo | Spec | Implementación | Tag |
|---|---|---|---|
| 00-fundamentos | Listo para revisión | En repo | — |
| M0 Núcleo | Listo para revisión | Implementado (local) | `m0` |
| M1 Libro | Pendiente de redactar | Implementado (local) | `m1` |
| M2 Presupuesto | Pendiente de redactar | Implementado (local) | `m2` |
| M3 Ciclo mensual | Pendiente de redactar | Implementado (local) | `m3` |
| M4 Deudas | Pendiente de redactar | Implementado (local) | `m4` |
| M5 Metas | Pendiente de redactar | Implementado (local) | `m5` |
| M6 Patrimonio | Pendiente de redactar | Implementado (local) | `m6` |
| M7 Tablero | Pendiente de redactar | Implementado (local) | `m7` |

---

## 7. Registro de decisiones

| ID | Decisión | Motivo |
|---|---|---|
| D-01 | Base de datos MySQL en Hostinger (motor MySQL 8 o MariaDB, según el plan) | Infraestructura ya contratada; la IA ejecutora verifica el motor y la versión real en M0 |
| D-02 | Autenticación con **Better Auth** en lugar de Auth.js v5 | Auth.js pasó a ser mantenido por el equipo de Better Auth; para un proyecto nuevo se usa directamente Better Auth |
| D-03 | **Prisma 7** (estable) con `@prisma/adapter-mariadb` | Prisma 8 está en Release Candidate y sus paquetes iniciales no cubren MySQL |
| D-04 | **shadcn/ui** como base de UI; **21st.dev** solo como fuente opcional de componentes puntuales | 21st.dev es freemium (2 copias gratis al día, requiere API key) y sus componentes están en formato de registro shadcn |
| D-05 | Monolito modular dentro de Next.js (el backend vive en el mismo proyecto) | Un solo deploy en Hostinger, límites claros entre módulos |
| D-06 | Dinero en `BIGINT` (centavos COP) + `decimal.js` | Evita errores de punto flotante |
| D-07 | Normalización semanal = 52/12 y diaria = 365/12 (no ×4 y ×30 como el Excel) | Precisión: el Excel subestima ~8% los gastos semanales |
| D-08 | Tasas en E.A.; la mensual se calcula como `(1+EA)^(1/12) − 1` | Convención colombiana (no `EA/12`) |
| D-09 | Inicio del periodo mensual | **Pendiente** — ver pregunta abierta en M3. Por defecto: mes calendario (`periodStartDay = 1`) |
