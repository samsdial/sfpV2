import { describe, expect, it } from 'vitest';
import { formatCOP, fromDecimal, parseCOP, toDecimal } from './money';
import Decimal from 'decimal.js';

describe('parseCOP', () => {
  it('parses plain and formatted COP', () => {
    expect(parseCOP('1234567')).toBe(123456700n);
    expect(parseCOP('1.234.567')).toBe(123456700n);
    expect(parseCOP('$1.234.567')).toBe(123456700n);
  });

  it('parses k/M suffixes', () => {
    expect(parseCOP('46,9k')).toBe(4690000n);
    expect(parseCOP('8M')).toBe(800000000n);
  });

  it('returns null for invalid input', () => {
    expect(parseCOP('')).toBeNull();
    expect(parseCOP('abc')).toBeNull();
  });
});

describe('formatCOP', () => {
  it('formats positives and negatives', () => {
    expect(formatCOP(123456700n)).toBe('$ 1.234.567');
    expect(formatCOP(-50000n)).toContain('−');
  });

  it('formats zero', () => {
    expect(formatCOP(0n)).toBe('$ 0');
  });
});

describe('decimal roundtrip', () => {
  it('rounds half up to cents', () => {
    expect(fromDecimal(new Decimal('10.005'))).toBe(1001n);
    expect(toDecimal(1001n).toFixed(2)).toBe('10.01');
  });
});
