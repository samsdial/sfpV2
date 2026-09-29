# Especificación Técnica Completa: Presupuesto Personal SFP 2026

## 1. Resumen Ejecutivo

**Nombre del archivo:** `Presupuesto Personal Digitt 2026.xlsx`
**Propósito:** Plantilla de finanzas personales para usuarios mexicanos, diseñada para Google Sheets, que permite gestionar presupuesto mensual, metas de ahorro, deudas, patrimonio, simulador de créditos y seguimiento mensual real vs. presupuestado durante 12 meses.

**Moneda:** Pesos Mexicanos (MXN)
**Idioma:** Español (México)
**Año fiscal:** 2026

---

## 2. Estructura General de Hojas (23 hojas)

| #   | Nombre de Hoja          | Índice | Propósito                                 |
| --- | ----------------------- | ------ | ----------------------------------------- |
| 1   | `Inicio`                | 1      | Pantalla de bienvenida e instrucciones    |
| 2   | `Mis Finanzas`          | 2      | Dashboard/resumen general                 |
| 3   | `Presupuesto`           | 3      | Entrada de ingresos y gastos mensuales    |
| 4   | `Tarjetas de Crédito`   | 4      | Gestión de tarjetas de crédito            |
| 5   | `Créditos`              | 5      | Registro de créditos/préstamos            |
| 6   | `Metas de Ahorro`       | 6      | Definición y simulación de metas          |
| 7   | `Patrimonio`            | 7      | Activos y patrimonio neto                 |
| 8   | `01` a `12`             | 8-19   | Seguimiento mensual (Enero-Diciembre)     |
| 20  | `Simulador de Créditos` | 20     | Simulador de amortización                 |
| 21  | `No borrar-charts`      | 21     | Datos para gráficos (no editar)           |
| 22  | `No borrar`             | 22     | Datos maestros (bancos, tasas, catálogos) |
| 23  | `Créditos-No usar`      | 23     | Hoja legacy/obsoleta                      |

---

## 3. Detalle por Hoja

### 3.1 Hoja `Inicio` (Index 1)

**Propósito:** Pantalla de bienvenida con instrucciones de uso.

**Contenido clave:**

- Título: "Presupuesto Personal 2026"
- Instrucciones: Solo editar celdas verdes claras en texto azul o casillas de opciones
- Advertencia: No eliminar alertas ni alterar campos
- Secciones explicadas:
  1. PRESUPUESTO
  2. METAS DE AHORRO
  3. DEUDAS
  4. PATRIMONIO
  5. SIMULADOR DE CRÉDITO
- Enlaces a versiones básica y Excel

**Celdas con hipervínculos:**

- `B16`: `=HYPERLINK('No borrar'!Z8,'No borrar'!Z7)`

---

### 3.2 Hoja `Mis Finanzas` (Index 2) — DASHBOARD PRINCIPAL

**Propósito:** Resumen consolidado de toda la situación financiera del usuario.

#### 3.2.1 Métricas Principales (Fila 7)

| Celda | Etiqueta                                 | Fórmula            | Descripción                             |
| ----- | ---------------------------------------- | ------------------ | --------------------------------------- |
| C7    | Ingresos Totales Esperados al Mes        | `=Presupuesto!H23` | Suma de todos los ingresos mensuales    |
| H7    | Total de Gastos Esperados al Mes         | `=P32`             | Suma de todos los gastos presupuestados |
| M7    | Disponible Esperado al Final de cada Mes | `=C7-H7`           | Diferencia ingresos - gastos            |

**Alerta dinámica (M9):**

```
=IF('Mis Finanzas'!M7>Presupuesto!X22,
   "👏¡Felicidades! Lo disponible al final del mes es suficiente para lograr tus metas de ahorro.",
   IF(AND('Mis Finanzas'!M7<Presupuesto!X22,'Mis Finanzas'!M7>0),
      "⚠️Cuidado. Lo que te queda a fin de mes no es suficiente para llegar a tu meta de ahorro mensual.",
      "⛔¡Tus gastos son mayores a tus ingresos! Es momento de evaluar qué gastos hay que evitar."))
```

#### 3.2.2 Desglose de Ingresos y Gastos (Fila 10)

| Celda | Descripción        | Fórmula                                                        |
| ----- | ------------------ | -------------------------------------------------------------- |
| C10   | Ingresos fijos     | `=SUMIF(Presupuesto!$D$8:$D$22,"Fijo",Presupuesto!$H$8:$H$22)` |
| E10   | Ingresos variables | `=C7-C10`                                                      |
| H10   | Gastos fijos       | SUMPRODUCT complejo (18 bloques de gastos)                     |
| J10   | Gastos variables   | `=H7-H10`                                                      |

**Fórmula completa de Gastos Fijos (H10):**

```
=SUMPRODUCT(Presupuesto!D29:D41,Presupuesto!I29:I41)
+SUMPRODUCT(Presupuesto!L29:L41,Presupuesto!Q29:Q41)
+SUMPRODUCT(Presupuesto!T29:T41,Presupuesto!Y29:Y41)
+SUMPRODUCT(Presupuesto!D45:D57,Presupuesto!I45:I57)
+SUMPRODUCT(Presupuesto!L45:L57,Presupuesto!Q45:Q57)
+SUMPRODUCT(Presupuesto!T45:T57,Presupuesto!Y45:Y57)
+SUMPRODUCT(Presupuesto!D61:D73,Presupuesto!I61:I73)
+SUMPRODUCT(Presupuesto!L61:L73,Presupuesto!Q61:Q73)
+SUMPRODUCT(Presupuesto!T61:T73,Presupuesto!Y61:Y73)
+SUMPRODUCT(Presupuesto!D77:D89,Presupuesto!I77:I89)
+SUMPRODUCT(Presupuesto!L77:L89,Presupuesto!Q77:Q89)
+SUMPRODUCT(Presupuesto!T77:T89,Presupuesto!Y77:Y89)
+SUMPRODUCT(Presupuesto!D93:D105,Presupuesto!I93:I105)
+SUMPRODUCT(Presupuesto!L93:L105,Presupuesto!Q93:Q105)
+SUMPRODUCT(Presupuesto!T93:T105,Presupuesto!Y93:Y105)
+SUMPRODUCT(Presupuesto!D109:D121,Presupuesto!I109:I121)
+SUMPRODUCT(Presupuesto!L109:L121,Presupuesto!Q109:Q121)
+SUMPRODUCT(Presupuesto!T109:T121,Presupuesto!Y109:Y121)
```

#### 3.2.3 Resumen Mensual de Ingresos (Filas 13-27)

Columnas:

- C: Concepto (desde `Presupuesto!C8:C21`)
- D: Tipo (desde `Presupuesto!D8:D21`)
- F: Monto (desde `Presupuesto!H8:H21`)

**Total (F28):** `=SUM(F13:F27)`
**Ingresos anuales estimados (F29):** `=F28*12`

#### 3.2.4 Ingresos Mensuales por Tipo (Filas 32-33)

| C        | D                       | E                                                            | F   |
| -------- | ----------------------- | ------------------------------------------------------------ | --- |
| Fijo     | `=F32/SUM($F$32:$F$33)` | `=SUMIF(Presupuesto!$D$8:$D$22,$C32,Presupuesto!$H$8:$H$22)` |     |
| variable | `=F33/SUM($F$32:$F$33)` | `=SUMIF(Presupuesto!$D$8:$D$22,$C33,Presupuesto!$H$8:$H$22)` |     |

#### 3.2.5 Resumen de Metas de Ahorro (Filas 28-32)

| Celda | Descripción                         | Fórmula                  |
| ----- | ----------------------------------- | ------------------------ |
| C28   | Total de objetivos de ahorro al mes | `='Metas de Ahorro'!C12` |
| G28   | Objetivo mensual                    | `='Metas de Ahorro'!C21` |
| C29   |                                     | `='Metas de Ahorro'!G12` |
| G29   |                                     | `='Metas de Ahorro'!G21` |
| C30   |                                     | `='Metas de Ahorro'!K12` |
| G30   |                                     | `='Metas de Ahorro'!K21` |
| C31   |                                     | `='Metas de Ahorro'!O12` |
| G31   |                                     | `='Metas de Ahorro'!O21` |
| K32   | Total de objetivos de ahorro al mes | `=sum(K28:K32)`          |

#### 3.2.6 Presupuesto Mensual Promedio (Columna P, Filas 13-31)

| Celda | Fuente              |
| ----- | ------------------- |
| P13   | `=Presupuesto!C28`  |
| P14   | `=Presupuesto!K28`  |
| P15   | `=Presupuesto!S28`  |
| P16   | `=Presupuesto!C44`  |
| P17   | `=Presupuesto!K44`  |
| P18   | `=Presupuesto!S44`  |
| P19   | `=Presupuesto!C60`  |
| P20   | `=Presupuesto!K60`  |
| P21   | `=Presupuesto!S60`  |
| P22   | `=Presupuesto!C76`  |
| P23   | `=Presupuesto!K76`  |
| P24   | `=Presupuesto!S76`  |
| P25   | `=Presupuesto!C92`  |
| P26   | `=Presupuesto!K92`  |
| P27   | `=Presupuesto!S92`  |
| P28   | `=Presupuesto!C108` |
| P29   | `=Presupuesto!K108` |
| P30   | `=Presupuesto!S108` |
| P31   | `=Presupuesto!C124` |
| P32   | `=SUM(P13:P31)`     |

#### 3.2.7 Porcentaje y Monto (Columnas O y Q)

| Celda   | Fórmula                 |
| ------- | ----------------------- |
| O13:O31 | `=IFERROR(P13/$P$32,0)` |
| Q13     | `=Presupuesto!I42`      |
| Q14     | `=Presupuesto!Q42`      |
| Q15     | `=Presupuesto!Y42`      |
| Q16     | `=Presupuesto!I58`      |
| Q17     | `=Presupuesto!Q58`      |
| Q18     | `=Presupuesto!Y58`      |
| Q19     | `=Presupuesto!I74`      |
| Q20     | `=Presupuesto!Q74`      |
| Q21     | `=Presupuesto!Y74`      |
| Q22     | `=Presupuesto!I90`      |
| Q23     | `=Presupuesto!Q90`      |
| Q24     | `=Presupuesto!Y90`      |
| Q25     | `=Presupuesto!I106`     |
| Q26     | `=Presupuesto!Q106`     |
| Q27     | `=Presupuesto!Y106`     |
| Q28     | `=Presupuesto!I122`     |
| Q29     | `=Presupuesto!Q122`     |
| Q30     | `=Presupuesto!Y122`     |
| Q31     | `=Presupuesto!I138`     |

#### 3.2.8 Resumen Anual (Filas 83-87)

| Celda | Descripción                       | Fórmula                                                               |
| ----- | --------------------------------- | --------------------------------------------------------------------- |
| C83   | Ingresos Totales Esperados al Año | `=Presupuesto!H24`                                                    |
| H83   | Total de Gastos Esperados al Año  | `=H7*12`                                                              |
| M83   | Disponible al Final del Año       | `=C83-H83`                                                            |
| C86   | Ingresos fijos anuales            | `=SUMIF(Presupuesto!$D$8:$D$22,"Fijo",Presupuesto!$H$8:$H$22)*12`     |
| E86   | Ingresos variables anuales        | `=SUMIF(Presupuesto!$D$8:$D$22,"Variable",Presupuesto!$H$8:$H$22)*12` |
| H86   | Gastos fijos anuales              | `=(fórmula compleja de H10)*12`                                       |
| J86   | Gastos variables anuales          | `=H83-H86`                                                            |

**Alerta anual (M85):**

```
=IF('Mis Finanzas'!M83>0,
   "👏¡Felicidades! Ten mucha disciplina para lograr este excedente.",
   IF('Mis Finanzas'!M83<0,
      "⛔¡Tus gastos serán mayores a tus ingresos! Es momento de evaluar qué gastos hay que evitar."))
```

---

### 3.3 Hoja `Presupuesto` (Index 3) — ENTRADA DE DATOS PRINCIPAL

**Propósito:** Captura de ingresos y gastos mensuales presupuestados.

#### 3.3.1 Ingresos Promedio Mensuales (Filas 8-22)

| Columna | Campo    | Tipo de dato                            |
| ------- | -------- | --------------------------------------- |
| C       | Concepto | Texto (ej: "Salario mensual neto Ella") |
| D       | Tipo     | Lista: "Fijo" / "Variable" / "-"        |
| H       | Monto    | Número (MXN)                            |

**Datos de ejemplo:**

- Fila 8: Salario mensual neto Ella | Fijo | 35000
- Fila 9: Salario mensual neto El | Fijo | 27500
- Fila 10: Bono mensual | Variable | 2100
- Fila 11: Dinerito extra | Variable | 6500
- Filas 12-22: "-" | "-" | 0

**Total (H23):** `=SUM(H8:H22)`
**Ingresos anuales estimados (H24):** `=H23*12`

#### 3.3.2 Meta de Ahorro (X21-X22)

| Celda | Descripción                             | Valor/Fórmula            |
| ----- | --------------------------------------- | ------------------------ |
| X21   | ¿Qué % de tus ingresos quieres ahorrar? | 0.15 (15%)               |
| X22   | Meta de ahorro mensual                  | `='Mis Finanzas'!C7*X21` |

**Mensaje motivacional (X23):**

```
=IF(X21<=5%,"Podrías ahorrar más, evalúa tus gastos y mejora tus finanzas. ¡Tú puedes! 💪",
IF(AND(X21>5%,X21<=10%),"Este es un porcentaje aceptable. ¡Ten disciplina para lograrlo! ✏️",
IF(AND(X21>10%,X21<=15%),"¡Buena meta de ahorro! Tu yo del futuro te lo agradecerá 💰",
IF(AND(X21>15%,X21<=25%),"¡Muy bien, este es un ahorro ideal! 🎯",
IF(X21>25%,"¡Genial! Ahora toca hacerlo crecer. Revisa las mejores oportunidades de inversión 📈")))))
```

#### 3.3.3 Gastos Hormiga (X9-X11)

| Celda | Descripción                                 | Fórmula                                                     |
| ----- | ------------------------------------------- | ----------------------------------------------------------- |
| X9    | Presupuesto al mes para gastos hormiga      | SUMPRODUCT complejo (18 bloques)                            |
| X10   | Puedes gastar máximo al día                 | `=X9/30`                                                    |
| X11   | Para lograr tu meta de ahorro, recorta esto | `=IF('Mis Finanzas'!M7-X22>=0,"N/A",'Mis Finanzas'!M7-X22)` |

**Mensaje (X17):**

```
=IF(X11>0,"👏¡Bien! Puedes lograr tus metas de ahorro y hasta darte un gustito 🐜",
"⚠️Considera recortar gastos para lograr tus metas de ahorro (tip: comienza con tus gastos hormiga).")
```

#### 3.3.4 Estructura de Categorías de Gastos

La hoja tiene **8 bloques de categorías** (filas 29-41, 45-57, 61-73, 77-89, 93-105, 109-121, etc.), cada uno con 3 sub-columnas (3 categorías por bloque):

**Bloque 1 (Filas 29-41):**
| Columna | Categoría |
|---------|-----------|
| B-H | 🏡Casa |
| J-P | 🥑Comida |
| R-X | ❤️Familia |

**Bloque 2 (Filas 45-57):**
| Columna | Categoría |
|---------|-----------|
| B-H | 🚓Transporte |
| J-P | ✈️Viajes |
| R-X | 🏦Deudas |

**Bloque 3 (Filas 61-73):**
| Columna | Categoría |
|---------|-----------|
| B-H | 🚑Salud |
| J-P | 📺Suscripciones |
| R-X | 💅Cuidado personal |

**Bloque 4 (Filas 77-89):**
| Columna | Categoría |
|---------|-----------|
| B-H | 📽️Entretenimiento |
| J-P | 🛸Otros |
| R-X | Mi Categoría 1 |

**Bloque 5 (Filas 93-105):**
| Columna | Categoría |
|---------|-----------|
| B-H | Mi Categoría 2 |
| J-P | Mi Categoría 3 |
| R-X | Mi Categoría 4 |

**Bloque 6 (Filas 109-121):**
| Columna | Categoría |
|---------|-----------|
| B-H | Mi Categoría 5 |
| J-P | Mi Categoría 6 |
| R-X | Mi Categoría 7 |

**Columnas por categoría:**
| Columna | Campo | Valores |
|---------|-------|---------|
| Concepto | Nombre del gasto | Texto |
| ¿Gasto Fijo? | Booleano | TRUE/FALSE |
| ¿Pago con tarjeta? | Booleano | TRUE/FALSE |
| Gasto hormiga 🐜 | Booleano | TRUE/FALSE |
| Periodicidad | Lista | Diario/Semanal/Quincenal/Mensual/Bimestral/Trimestral/Cuatrimestral/Semestral/Anual |
| Monto del Gasto | Número | MXN |
| Gasto Mensual | Fórmula | Normaliza a mensual |

**Fórmula de normalización (ejemplo I29):**

```
=IF(G29="Diario",H29*30,
IF(G29="Semanal",H29*4,
IF(G29="Quincenal",H29*2,
IF(G29="Mensual",H29,
IF(G29="Bimestral",H29/2,
IF(G29="Trimestral",H29/3,
IF(G29="Cuatrimestral",H29/4,
IF(G29="Semestral",H29/6,
IF(G29="Anual",H29/12,
0)))))))))
```

**Totales por bloque:**

- `I42` = `=SUM(I29:I41)`
- `Q42` = `=SUM(Q29:Q41)`
- `Y42` = `=SUM(Y29:Y41)`

**Totales de los 6 bloques (filas 42, 58, 74, 90, 106, 122):**

- `I42`, `Q42`, `Y42` (bloque 1)
- `I58`, `Q58`, `Y58` (bloque 2)
- `I74`, `Q74`, `Y74` (bloque 3)
- `I90`, `Q90`, `Y90` (bloque 4)
- `I106`, `Q106`, `Y106` (bloque 5)
- `I122`, `Q122`, `Y122` (bloque 6)

**Totales generales (fila 124):**

- `I124` = `=SUM(I42,I58,I74,I90,I106,I122)`
- `Q124` = `=SUM(Q42,Q58,Q74,Q90,Q106,Q122)`
- `Y124` = `=SUM(Y42,Y58,Y74,Y90,Y106,Y122)`

---

### 3.4 Hoja `Tarjetas de Crédito` (Index 4)

**Propósito:** Gestión de tarjetas de crédito del usuario.

#### 3.4.1 Estructura (Filas 8-22)

| Columna | Campo                                        | Tipo                                                    |
| ------- | -------------------------------------------- | ------------------------------------------------------- |
| B       | Banco                                        | Texto (lista de bancos)                                 |
| C       | Tarjeta                                      | Texto (lista de tarjetas)                               |
| D       | Tasa promedio\*                              | Fórmula (busca en 'No borrar')                          |
| E       | Saldo Actual                                 | Número                                                  |
| F       | Línea de crédito                             | Número                                                  |
| H       | Fecha de Corte (Día)                         | Número (1-31)                                           |
| I       | Fecha de Pago (Día)                          | Número (1-31)                                           |
| J       | ¿Cómo pagas tu tarjeta?                      | Lista: Pago Mínimo / Pago todo el saldo / Dejé de Pagar |
| K       | Intereses a pagar si no cubres todo el saldo | Fórmula                                                 |
| L       | Meses que tardarías en liquidar              | Fórmula condicional                                     |

**Fórmula de tasa (D8):**

```
=IF(C8="Otro",67%,IFERROR(AVERAGEIFS('No borrar'!$K$2:$K$190,'No borrar'!$I$2:$I$190,C8,'No borrar'!$J$2:$J$190,D8),0))
```

**Fórmula de intereses (K8):**

```
=IF(OR(K8="",K8="Pago todo el saldo"),0,
IF(K8="Pago Mínimo",F8*(1-0.05)*(E8/12),F8*(E8/12)))
```

**Mensaje de estado (L8):**

```
=IF(K8="","-",
IF(K8="Pago Mínimo","⚠️ Considera refinanciar tu tarjeta.",
IF(K8="Pago todo el saldo","👏¡Bien! Esa es la mejor manera de usar tus tarjetas.",
IF(K8="Dejé de Pagar","⛔ ¡Cuidado! Te cobrarán intereses moratorios."))))
```

#### 3.4.2 Totales (Fila 23)

| Celda | Fórmula        |
| ----- | -------------- |
| F23   | `=sum(F8:F22)` |
| G23   | `=sum(G8:G22)` |
| L23   | `=sum(L8:L22)` |

#### 3.4.3 Gasto Promedio con Tarjetas (Fila 24)

**Celda G24 (fórmula compleja):**

```
=SUMPRODUCT(Presupuesto!E29:E41,Presupuesto!I29:I41)
+SUMPRODUCT(Presupuesto!M29:M41,Presupuesto!Q29:Q41)
+SUMPRODUCT(Presupuesto!U29:U41,Presupuesto!Y29:Y41)
+SUMPRODUCT(Presupuesto!E45:E57,Presupuesto!I45:I57)
+SUMPRODUCT(Presupuesto!M45:M57,Presupuesto!Q45:Q57)
+SUMPRODUCT(Presupuesto!U45:U57,Presupuesto!Y45:Y57)
+SUMPRODUCT(Presupuesto!E61:E73,Presupuesto!I61:I73)
+SUMPRODUCT(Presupuesto!M61:M73,Presupuesto!Q61:Q73)
+SUMPRODUCT(Presupuesto!U61:U73,Presupuesto!Y61:Y73)
+SUMPRODUCT(Presupuesto!E77:E89,Presupuesto!I77:I89)
+SUMPRODUCT(Presupuesto!M77:M89,Presupuesto!Q77:Q89)
+SUMPRODUCT(Presupuesto!U77:U89,Presupuesto!Y77:Y89)
+SUMPRODUCT(Presupuesto!E93:E105,Presupuesto!I93:I105)
+SUMPRODUCT(Presupuesto!M93:M105,Presupuesto!Q93:Q105)
+SUMPRODUCT(Presupuesto!U93:U105,Presupuesto!Y93:Y105)
+SUMPRODUCT(Presupuesto!E109:E121,Presupuesto!I109:I121)
+SUMPRODUCT(Presupuesto!M109:M121,Presupuesto!Q109:Q121)
+SUMPRODUCT(Presupuesto!U109:U121,Presupuesto!Y109:Y121)
```

#### 3.4.4 Uso de Línea de Crédito (Fila 25)

| Celda | Fórmula                        |
| ----- | ------------------------------ |
| C25   | `% de uso de línea de crédito` |
| G25   | `=G24/sum(G8:G22)`             |

**Alerta (B26):**

```
=IF(G25<0.3,"👏¡Buen nivel de uso de tus tarjetas!",
IF(AND(G25<0.5,G25>=0.3),"⚠️ Cuidado con el uso de tus tarjetas. Puede ser buena idea que adelantes pagos de tus mensualidades.",
"⛔ Usas demasiado tus trajetas, considera disminuir tus gastos."))
```

---

### 3.5 Hoja `Créditos` (Index 5)

**Propósito:** Registro de créditos/préstamos del usuario.

#### 3.5.1 Estructura (Filas 9-25)

| Columna | Campo                      | Tipo                                                                                                                                                                                                                             |
| ------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C       | Tipo de crédito            | Lista: 🏡Hipoteca / 👪Familiar / 💙Crédito Digitt / 🎓Educación / 🏡Hipoteca / 💵Negocio / 👤Préstamo familiar / 🪙Crédito Personal / 💼Crédito de Nómina / 🔴Crédito Infonavit / 📈Micropréstamo / 🟡Crédito Fovissste / 🎲Otro |
| D       | ¿Dónde sacaste tu crédito? | Texto                                                                                                                                                                                                                            |
| E       | Deuda inicial              | Número                                                                                                                                                                                                                           |
| F       | Deuda actual               | Número                                                                                                                                                                                                                           |
| G       | Mensualidad                | Número                                                                                                                                                                                                                           |
| H       | % Completado               | `=IFERROR(1-F9/E9,"-")`                                                                                                                                                                                                          |

#### 3.5.2 Totales (Fila 26)

| Celda | Fórmula        |
| ----- | -------------- |
| F26   | `=sum(F9:F25)` |
| G26   | `=sum(G9:G25)` |

---

### 3.6 Hoja `Metas de Ahorro` (Index 6)

**Propósito:** Definición y simulación de metas de ahorro.

#### 3.6.1 Resumen General (Filas 6-9)

| Celda | Descripción                         | Fórmula                          |
| ----- | ----------------------------------- | -------------------------------- |
| C6    | Disponible al final del mes         | `='Mis Finanzas'!M7`             |
| C8    | Total de objetivos de ahorro al mes | `=C21+G21+K21+O21`               |
| C9    | % de tus ingresos                   | `=IFERROR(C8/Presupuesto!H23,0)` |

**Alerta (J9):**

```
=IF('Mis Finanzas'!M7<0,"⛔ ¡Tus gastos son mayores a tus ingresos! Recorta gastos para retomar tus metas de ahorro.",
IF(E6>C8,"👏 ¡Felicidades! Tienes suficiente al final de mes para lograr tus metas de ahorro.",
"⚠️ Parece que lo disponible del mes no es suficiente para lograr tus metas de ahorro."))
```

#### 3.6.2 Cuatro Metas (Columnas C, G, K, O)

| Meta                | Columna | Campos                                                         |
| ------------------- | ------- | -------------------------------------------------------------- |
| 💰Compra importante | C       | Ahorro actual (C15), Meses (C16), Tasa (C17), Meta total (C18) |
| 🏖️Vacaciones        | G       | Ahorro actual (G15), Meses (G16), Tasa (G17), Meta total (G18) |
| 🚗Auto              | K       | Ahorro actual (K15), Meses (K16), Tasa (K17), Meta total (K18) |
| 🎲Otros             | O       | Ahorro actual (O15), Meses (O16), Tasa (O17), Meta total (O18) |

**Fórmula de ahorro mensual necesario (C21):**

```
=IFERROR(IF(((E18-E15*(1+E17/12)^E16)*(E17)/12)/((1+E17/12)^E16-1)<0,0,
((E18-E15*(1+E17/12)^E16)*(E17)/12)/((1+E17/12)^E16-1)),0)
```

**Fórmula equivalente para G21, K21, O21** (con sus respectivas columnas).

---

### 3.7 Hoja `Patrimonio` (Index 7)

**Propósito:** Cálculo del patrimonio neto.

#### 3.7.1 Activos y Bienes Inmuebles (Filas 9-23)

| Columna | Campo                                                                 |
| ------- | --------------------------------------------------------------------- |
| B       | Activo (lista: 🏡Casa/Departamento / 📈Acciones / 🌳Terreno / 🎲Otro) |
| D       | Nombre                                                                |
| G       | Valor actual                                                          |

#### 3.7.2 Dinero en Cuentas (Filas 9-23)

| Columna | Campo                                                                 |
| ------- | --------------------------------------------------------------------- |
| I       | Activo (lista: 💰Cuentas de Ahorro / 💵Cuentas de Inversión / 🎲Otro) |
| K       | Nombre                                                                |
| M       | Valor actual                                                          |

#### 3.7.3 Totales

| Celda | Descripción                              | Fórmula                                             |
| ----- | ---------------------------------------- | --------------------------------------------------- |
| G24   | Valor total de tus Activos               | `=sum(G9:G23)`                                      |
| M24   | Dinero Total en tus Cuentas              | `=sum(M9:M23)`                                      |
| M26   | Valor de tu Patrimonio Total (Net Worth) | `=G24+M24-'Tarjetas de Crédito'!F23-'Créditos'!F26` |

---

### 3.8 Hojas `01` a `12` (Index 8-19) — SEGUIMIENTO MENSUAL

**Propósito:** Registro de transacciones reales mes a mes.

**Estructura idéntica para cada mes (Enero-Diciembre):**

#### 3.8.1 Encabezado (Filas 2-5)

| Celda | Descripción                 | Fórmula                                                                                            |
| ----- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| J5    | Ingresos Esperados          | `=Presupuesto!H23`                                                                                 |
| K5    | Ingresos Reales             | `=SUMIF($C$9:$C$253,"Ingreso Fijo",$E$9:$E$253)+SUMIF($C$9:$C$253,"Ingreso Variable",$E$9:$E$253)` |
| M5    | Gastos Esperados            | `='Mis Finanzas'!H7`                                                                               |
| N5    | Gastos Reales               | `=SUMIF($C$9:$C$253,"Gasto",$E$9:$E$253)`                                                          |
| P5    | Disponible al Final del Mes | `=J5-M5`                                                                                           |

#### 3.8.2 Tabla de Movimientos (Filas 9-253)

| Columna | Campo             | Tipo                                                 |
| ------- | ----------------- | ---------------------------------------------------- |
| B       | Descripción       | Texto                                                |
| C       | Tipo              | Lista: "Gasto" / "Ingreso Fijo" / "Ingreso Variable" |
| D       | Concepto de Gasto | Lista de categorías                                  |
| E       | Monto             | Número                                               |
| F       | Método de pago    | Lista: Transferencia / Tarjeta / Efectivo            |
| G       | Tarjeta           | Lista de tarjetas                                    |

#### 3.8.3 Resumen de Ingresos (J9-J11)

| Celda | Fórmula                                |
| ----- | -------------------------------------- |
| J9    | `=SUMIF($C$9:$C$253,$I9,$E$9:$E$253)`  |
| J10   | `=SUMIF($C$9:$C$253,$I10,$E$9:$E$253)` |
| J11   | `=sum(J9:J10)`                         |

#### 3.8.4 Resumen de Gastos por Categoría (L9-L26)

| Celda | Concepto          | Fórmula                                                    |
| ----- | ----------------- | ---------------------------------------------------------- |
| L9    | `='No borrar'!A2` | `=SUMIFS($E$9:$E$253,$C$9:$C$253,"Gasto",$D$9:$D$253,$L9)` |
| L10   | `='No borrar'!A3` | `=SUMIFS(...)`                                             |
| ...   | ...               | ...                                                        |
| L26   | Total de Gastos   | `=SUM(M9:M26)`                                             |

#### 3.8.5 Gastos por Método de Pago (I30-I32)

| Celda | Método        | Fórmula                                                     |
| ----- | ------------- | ----------------------------------------------------------- |
| I30   | Transferencia | `=SUMIFS($E$9:$E$253,$C$9:$C$253,"Gasto",$F$9:$F$253,$I30)` |
| I31   | Tarjeta       | `=SUMIFS(...)`                                              |
| I32   | Efectivo      | `=SUMIFS(...)`                                              |

#### 3.8.6 Gastos por Tarjeta (I46-I59)

| Celda | Tarjeta                      | Fórmula                                                     |
| ----- | ---------------------------- | ----------------------------------------------------------- |
| I46   | `='Tarjetas de Crédito'!D8`  | `=SUMIFS($E$9:$E$253,$C$9:$C$253,"Gasto",$G$9:$G$253,$I46)` |
| I47   | `='Tarjetas de Crédito'!D9`  | `=SUMIFS(...)`                                              |
| ...   | ...                          | ...                                                         |
| I59   | `='Tarjetas de Crédito'!D21` | `=SUMIFS(...)`                                              |

#### 3.8.7 Termómetro del Mes (O12)

```
=IF(O12<=0.8,"🟢⚪⚪<br><br>¡Todo bajo control con tus gastos mens
```
