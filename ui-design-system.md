# UI y design system — SFP v2

## 1. Base: shadcn/ui

- Inicializar con `npx shadcn@latest init` (CLI v4) sobre Tailwind v4, con primitivas **Radix**.
- Los componentes se generan en `src/components/ui/` y son código del proyecto: se editan para ajustarlos a los tokens.
- Antes de añadir un componente, revisar con `--dry-run` o `--diff` qué archivos toca.
- Instalar el skill o MCP de shadcn en el entorno de la IA ejecutora si está disponible, para evitar alucinaciones de API.

**Primitivas a instalar en M0**: `button`, `input`, `label`, `field`, `select`, `native-select`, `combobox`, `command`, `popover`, `dialog`, `sheet`, `dropdown-menu`, `tabs`, `table`, `badge`, `progress`, `separator`, `skeleton`, `tooltip`, `sonner`, `sidebar`, `empty`, `kbd`, `alert`, `card`, `calendar`, `switch`, `checkbox`, `chart`.

Cada módulo instala después lo que necesite y lo declara en su spec.

## 2. Complemento opcional: 21st.dev

21st.dev es un catálogo comunitario en formato de registro shadcn. **No es gratis de forma ilimitada**: permite explorar todo, pero la cuenta gratuita da 2 copias de componentes al día, y la instalación por CLI exige una API key (`API_KEY_21ST`).

Reglas de uso:

1. Solo para piezas que shadcn no cubre y que aportan valor real: un selector de periodo vistoso, el termómetro del mes, un input numérico animado para montos.
2. Solo componentes con **licencia MIT** declarada. Si dice "unknown", no se usa.
3. Todo componente importado se adapta a los tokens del proyecto: sin colores hardcodeados y sin animaciones que violen la §4.
4. La API key nunca se commitea. Va en `.env.local` y solo se usa en la máquina de desarrollo.
5. Cada componente traído de 21st.dev se registra en la tabla de la §6 con autor, URL y licencia.

## 3. Tokens (Tailwind v4, `globals.css`)

Se definen como variables CSS en `:root` y `.dark`, y se exponen con `@theme inline`. Además de los tokens estándar de shadcn (`background`, `foreground`, `primary`, `muted`, `border`, `ring`…), SFP agrega **tokens semánticos financieros**:

| Token | Uso |
|---|---|
| `--positive` / `--positive-foreground` | Ingresos, saldo a favor, metas cumplidas |
| `--negative` / `--negative-foreground` | Gastos, sobregasto, deuda |
| `--warning` / `--warning-foreground` | Alertas de "cuidado" (80–100% del presupuesto, uso de cupo 30–50%) |
| `--info` | Mensajes neutrales |
| `--chart-1` … `--chart-8` | Series de gráficas, armonizadas con la paleta |

Los colores semánticos son **calmados**: verde y rojo desaturados, legibles en claro y oscuro, con contraste AA. Nada de rojo alarma ni verde neón.

**Tipografía**: se propone Geist Sans para texto y Geist Mono para cifras (ambas vienen con Next.js). Todo número monetario usa `tabular-nums`. La IA ejecutora puede proponer otra familia en el plan de M0 si justifica mejor legibilidad de cifras.

## 4. Principios visuales

- **Tipografía primero.** La jerarquía se logra con tamaño, peso y espacio, no con cajas. Las cifras importantes se leen de un vistazo.
- **Sin patrón genérico de SaaS.** Nada de grillas de tarjetas idénticas con icono + número + % en verde. Las métricas se agrupan en franjas y tablas limpias.
- **Anti-referencias explícitas**:
  - paleta crema + terracota (cliché de IA),
  - estética Nubank, Fintonic o Monarch,
  - animaciones de entrada al hacer scroll,
  - etiquetas en MAYÚSCULAS SOSTENIDAS.
- **Estados con iconos, no con emojis.** Los mensajes de la plantilla Excel (👏 ⚠️ ⛔) se traducen a `<StatusMessage level="good | warn | bad">` con iconos de lucide y color semántico.
- **Movimiento mínimo.** Solo transiciones funcionales (abrir, cerrar, feedback de guardado) y siempre respetando `prefers-reduced-motion`.
- **Claro y oscuro** desde el día uno (next-themes). El predeterminado es el del sistema.
- **Responsive.** El registro rápido de movimientos debe ser cómodo en el celular: es el uso más frecuente.

## 5. Componentes compartidos (`src/components/shared/`, se crean en M0)

| Componente | Responsabilidad |
|---|---|
| `<Money cents tone?>` | Formatea con `formatCOP`, cifras tabulares, color por signo o por `tone` (`positive`, `negative`, `neutral`, `auto`) |
| `<Percent value>` | Fracción → `15 %` |
| `<StatusMessage level title?>` | Mensaje de estado good/warn/bad con icono |
| `<Thermometer value thresholds>` | Barra de consumo con umbrales (por defecto 80% y 100%) |
| `<PageHeader title description actions>` | Encabezado de página consistente |
| `<EmptyState title description action>` | Estado vacío con llamada a la acción |
| `<PeriodPicker value onChange>` | Selector `YYYY-MM` con flechas anterior/siguiente |
| `<MoneyInput>` | Input que acepta formatos COP y abreviaturas, y entrega `bigint` |
| `<Kpi label value delta?>` | Cifra destacada tipográfica (no tarjeta genérica) |

## 6. Registro de componentes externos

| Componente | Fuente | Autor | URL | Licencia | Adaptado en |
|---|---|---|---|---|---|
| — | — | — | — | — | — |
