# Stack técnico — SFP v2

Versiones verificadas a finales de septiembre de 2026. La IA ejecutora debe instalar **la última versión estable (patch) de cada línea** indicada y registrar las versiones exactas en el README del repo al terminar M0.

## 1. Tabla de stack

| Capa | Tecnología | Versión objetivo | Notas |
|---|---|---|---|
| Runtime | Node.js | 22 LTS (o la LTS más alta que ofrezca Hostinger) | Fijar en `.nvmrc` y `engines` |
| Framework | Next.js (App Router) | **16.3.x**, mínimo **16.3.7** | Hay parches de seguridad frecuentes; ver §3 |
| UI runtime | React / React DOM | 19.3.x | La que exija Next 16.3 |
| Lenguaje | TypeScript | La que instale `create-next-app` | `strict: true` + `noUncheckedIndexedAccess: true` |
| Estilos | Tailwind CSS | 4.x | Configuración CSS-first (`@theme` en `globals.css`), sin `tailwind.config.ts` |
| Componentes | shadcn/ui (CLI v4) | `npx shadcn@latest` | Primitivas Radix. Ver `ui-design-system.md` |
| Componentes extra | 21st.dev (opcional) | — | Freemium, formato de registro shadcn. Ver `ui-design-system.md` |
| Iconos | lucide-react | última | El que usa shadcn |
| Base de datos | MySQL 8 / MariaDB (Hostinger) | La del plan | Local con Docker, misma familia y versión |
| ORM | Prisma ORM | **7.x** | Generador `prisma-client`, `prisma.config.ts`, esquema multiarchivo |
| Driver | `@prisma/adapter-mariadb` + `mariadb` | la compatible con Prisma 7 | Sirve para MySQL y MariaDB |
| Auth | Better Auth | última 1.x | Email + contraseña, un solo usuario |
| Validación | Zod | 4.x | Esquemas compartidos cliente/servidor |
| Formularios | React Hook Form + `@hookform/resolvers` | última | Integrado con el componente `Field` de shadcn |
| Tablas | TanStack Table | 8.x | Vía el patrón Data Table de shadcn |
| Gráficas | Recharts (vía `chart` de shadcn) | la que traiga shadcn | |
| Dinero | decimal.js | 10.x | Cálculo; almacenamiento en BIGINT centavos |
| Fechas | date-fns 4 + `@date-fns/tz` | 4.x | Zona `America/Bogota`. **No** usar `date-fns-tz` |
| Toasts | sonner | la de shadcn | |
| Tema claro/oscuro | next-themes | última | |
| Tests unitarios | Vitest | última | Dominio puro y utilidades |
| Tests e2e | Playwright | última | Flujo feliz por módulo |
| Lint / formato | ESLint (flat config de Next) + Prettier + `prettier-plugin-tailwindcss` | última | |
| Gestor de paquetes | npm | el del runtime | Hostinger ejecuta npm |
| Hosting | Hostinger Node.js Web Apps + base de datos MySQL de Hostinger | — | Ver `deploy-hostinger.md` |

## 2. Decisiones y justificación

**Next.js 16.3 y no 15.** Es la línea activa (Active LTS). Cambios que afectan este proyecto:

- `middleware.ts` pasa a llamarse `proxy.ts`, exporta la función `proxy` y corre en runtime Node.js.
- `cookies()`, `headers()`, `params` y `searchParams` son asíncronos (llevan `await`).
- Turbopack es el bundler por defecto.
- No se activan Cache Components en v2.0. Las páginas autenticadas son dinámicas y las mutaciones invalidan con `revalidatePath`.

**Better Auth y no Auth.js v5.** Auth.js quedó bajo el equipo de Better Auth. Better Auth trae de fábrica:

- email + contraseña con hash scrypt,
- rate limiting,
- adaptador Prisma con proveedor `mysql`,
- integración con Server Actions mediante el plugin `nextCookies()`.

El registro se deshabilita después de crear el único usuario.

**Prisma 7 y no Prisma 8.** Prisma 8 está en Release Candidate y su familia inicial de paquetes no incluye MySQL. Prisma 7 es estable y exige tres cosas:

- adaptador de driver (`@prisma/adapter-mariadb`),
- generador `prisma-client` con `output` explícito,
- `prisma.config.ts` para la URL de conexión y el seed.

Se usa **esquema multiarchivo** (`prisma/schema/*.prisma`) para que cada módulo sea dueño de su archivo.

**MySQL o MariaDB.** Los planes de hosting de Hostinger pueden entregar MariaDB aunque el panel diga "MySQL". En la tarea T-M0-03 la IA ejecutora ejecuta `SELECT VERSION();` en phpMyAdmin de producción y usa **la misma familia y versión** en Docker local. El proveedor de Prisma es `mysql` en ambos casos. Se prohíben funciones SQL específicas de un solo motor.

**shadcn/ui como base.** Es gratuito y de código abierto, y los componentes quedan copiados en el repo (sin dependencia bloqueante). 21st.dev no reemplaza a shadcn: es un catálogo comunitario sobre el mismo formato de registro. Su plan gratuito permite 2 copias diarias y la instalación por CLI requiere API key. Se usa solo para piezas puntuales que aporten valor y que tengan licencia MIT.

## 3. Política de versiones y seguridad

- Next.js publica parches de seguridad programados (el próximo, 16.3.7, está anunciado para el 30 de septiembre de 2026). Antes de cada deploy de módulo se actualiza al último patch de 16.3.
- Hostinger escanea vulnerabilidades de dependencias después de cada deploy. Los hallazgos críticos se corrigen antes de continuar con el siguiente módulo.
- Las dependencias se fijan con `package-lock.json` (commiteado). No se usan rangos `*` ni `latest` en `package.json`.
