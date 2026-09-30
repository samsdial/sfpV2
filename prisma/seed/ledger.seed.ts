import type { CategoryKind, PrismaClient } from '../../src/generated/prisma/client';

const TAGS = ['CD', 'TJ', 'PT', 'MR', 'PPS', 'SAM', 'NOP'] as const;

type CatSeed = { name: string; kind?: CategoryKind; children?: CatSeed[] };

const EXPENSE_TREE: CatSeed[] = [
  {
    name: 'Vivienda',
    children: [
      { name: 'Arriendo' },
      { name: 'Administración' },
      { name: 'Servicios — Agua' },
      { name: 'Servicios — Codensa' },
      { name: 'Servicios — Internet (Vanty)' },
    ],
  },
  {
    name: 'Telecomunicaciones',
    children: [{ name: 'Movistar' }, { name: 'Claro Celular' }],
  },
  {
    name: 'Suscripciones',
    children: [{ name: 'Spotify' }, { name: 'Otros streaming' }],
  },
  {
    name: 'Educación',
    children: [{ name: 'Colegio (hija)' }, { name: 'Cursos (inglés, UNAD)' }],
  },
  {
    name: 'Salud',
    children: [
      { name: 'Odontología' },
      { name: 'Seguros (Bolívar, GNP)' },
      { name: 'Medicamentos' },
    ],
  },
  {
    name: 'Deudas — Tarjetas',
    children: [{ name: 'Nubank TJ' }, { name: 'Davivienda TJ' }],
  },
  {
    name: 'Deudas — Créditos',
    children: [
      { name: 'Bancolombia CD' },
      { name: 'BancoCajaSocial CD' },
      { name: 'Lulo' },
      { name: 'RCI (vehículo)' },
      { name: 'Préstamo MAMA' },
    ],
  },
  {
    name: 'Alimentación',
    children: [
      { name: 'Mercado' },
      { name: 'Restaurantes' },
      { name: 'Domicilios' },
      { name: 'Snacks' },
    ],
  },
  {
    name: 'Transporte',
    children: [
      { name: 'Gasolina' },
      { name: 'Mantenimiento vehículo' },
      { name: 'SOAT / Tecnomecánica' },
      { name: 'Peajes' },
    ],
  },
  {
    name: 'Recreación',
    children: [{ name: 'Salidas' }, { name: 'Eventos familiares' }, { name: 'Regalos' }],
  },
  {
    name: 'Trabajo/Profesional',
    children: [
      { name: 'Hosting y dominios' },
      { name: 'Software y suscripciones' },
      { name: 'Herramientas y equipos' },
    ],
  },
  { name: 'Familia', children: [{ name: 'Gastos hija (fuera de colegio)' }] },
  { name: 'Otros', children: [{ name: 'Imprevistos' }] },
];

const INCOME_TREE: CatSeed[] = [
  {
    name: 'Ingresos',
    kind: 'INCOME',
    children: [
      { name: 'Trabajo — Fracttal', kind: 'INCOME' },
      { name: 'Trabajo — JJmart', kind: 'INCOME' },
      { name: 'Trabajo — Freelance otros', kind: 'INCOME' },
      { name: 'Prima', kind: 'INCOME' },
      { name: 'Transferencias recibidas — Nequi', kind: 'INCOME' },
      { name: 'Transferencias recibidas — Avvillas', kind: 'INCOME' },
      { name: 'Otros ingresos', kind: 'INCOME' },
    ],
  },
];

async function upsertCategory(
  db: PrismaClient,
  userId: string,
  node: CatSeed,
  parentId: string | null,
) {
  const kind = node.kind ?? 'EXPENSE';
  const existing = await db.category.findFirst({
    where: { userId, name: node.name, parentId },
  });
  const category =
    existing ??
    (await db.category.create({
      data: { userId, name: node.name, kind, parentId },
    }));

  if (node.children) {
    for (const child of node.children) {
      await upsertCategory(db, userId, child, category.id);
    }
  }
}

export async function seedLedgerForUser(db: PrismaClient, userId: string) {
  for (const tag of TAGS) {
    await db.tag.upsert({
      where: { userId_name: { userId, name: tag } },
      create: { userId, name: tag },
      update: {},
    });
  }

  for (const root of EXPENSE_TREE) {
    await upsertCategory(db, userId, root, null);
  }
  for (const root of INCOME_TREE) {
    await upsertCategory(db, userId, root, null);
  }
}
