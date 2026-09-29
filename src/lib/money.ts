import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export function parseCOP(input: string): bigint | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const compact = trimmed.match(/^([\d.,]+)\s*([kKmM])?$/);
  if (compact) {
    const num = compact[1]?.replace(/\./g, '').replace(',', '.');
    if (!num) return null;
    let d = new Decimal(num);
    const suffix = compact[2]?.toLowerCase();
    if (suffix === 'k') d = d.mul(1000);
    if (suffix === 'm') d = d.mul(1_000_000);
    return fromDecimal(d);
  }

  const cleaned = trimmed.replace(/^\$?\s*/, '').replace(/\./g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return fromDecimal(new Decimal(cleaned));
}

export function formatCOP(
  cents: bigint,
  opts?: { sign?: 'auto' | 'always' | 'never'; compact?: boolean },
): string {
  const signOpt = opts?.sign ?? 'auto';
  const pesos = toDecimal(cents);
  const isNeg = pesos.isNegative();
  const abs = pesos.abs();

  let body: string;
  if (opts?.compact && abs.gte(1_000_000)) {
    body = `${abs.div(1_000_000).toFixed(1, Decimal.ROUND_HALF_UP)}M`;
  } else if (opts?.compact && abs.gte(1000)) {
    body = `${abs.div(1000).toFixed(1, Decimal.ROUND_HALF_UP)}k`;
  } else {
    body = abs.toFixed(0, Decimal.ROUND_HALF_UP).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  const prefix =
    signOpt === 'never' ? '' : signOpt === 'always' || isNeg ? '−' : '';
  return `${prefix}$ ${body}`;
}

export function toDecimal(cents: bigint): Decimal {
  return new Decimal(cents.toString()).div(100);
}

export function fromDecimal(pesos: Decimal): bigint {
  return BigInt(pesos.mul(100).toFixed(0, Decimal.ROUND_HALF_UP));
}

export function sumCents(values: bigint[]): bigint {
  return values.reduce((a, b) => a + b, 0n);
}

export function ratio(part: bigint, total: bigint): Decimal {
  if (total === 0n) return new Decimal(0);
  return toDecimal(part).div(toDecimal(total));
}
