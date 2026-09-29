import Decimal from 'decimal.js';
import { fromDecimal, toDecimal } from '@/lib/money';

export const PERIODICITIES = [
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'BIMONTHLY',
  'QUARTERLY',
  'FOUR_MONTHLY',
  'SEMIANNUAL',
  'ANNUAL',
] as const;

export type Periodicity = (typeof PERIODICITIES)[number];

const FACTORS: Record<Periodicity, Decimal> = {
  DAILY: new Decimal(365).div(12),
  WEEKLY: new Decimal(52).div(12),
  BIWEEKLY: new Decimal(2),
  MONTHLY: new Decimal(1),
  BIMONTHLY: new Decimal(1).div(2),
  QUARTERLY: new Decimal(1).div(3),
  FOUR_MONTHLY: new Decimal(1).div(4),
  SEMIANNUAL: new Decimal(1).div(6),
  ANNUAL: new Decimal(1).div(12),
};

export function toMonthly(amountCents: bigint, p: Periodicity): bigint {
  const pesos = toDecimal(amountCents).mul(FACTORS[p]);
  return fromDecimal(pesos);
}
