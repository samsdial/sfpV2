import { describe, expect, it } from 'vitest';
import { toMonthly } from './periodicity';

describe('toMonthly', () => {
  it('normalizes monthly amount', () => {
    expect(toMonthly(100_000n, 'MONTHLY')).toBe(100_000n);
  });

  it('normalizes annual to monthly', () => {
    expect(toMonthly(1_200_000n, 'ANNUAL')).toBe(100_000n);
  });

  it('normalizes weekly with 52/12 factor', () => {
    expect(toMonthly(120_000n, 'WEEKLY')).toBe(520_000n);
  });
});
