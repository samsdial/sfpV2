import { describe, expect, it } from 'vitest';
import { periodOf, periodRange, shiftPeriod } from './dates';

describe('periodOf', () => {
  it('uses calendar month when startDay is 1', () => {
    expect(periodOf('2026-09-15', 1)).toBe('2026-09');
  });

  it('assigns late-month dates to next period when startDay is 15', () => {
    expect(periodOf('2026-09-10', 15)).toBe('2026-08');
    expect(periodOf('2026-09-20', 15)).toBe('2026-09');
  });
});

describe('periodRange', () => {
  it('covers full calendar month', () => {
    expect(periodRange('2026-09', 1)).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });

  it('spans into next month for custom start day', () => {
    const r = periodRange('2026-09', 15);
    expect(r.from).toBe('2026-09-15');
    expect(r.to).toBe('2026-10-14');
  });

  it('handles february', () => {
    expect(periodRange('2026-02', 1).to).toBe('2026-02-28');
  });
});

describe('shiftPeriod', () => {
  it('shifts across year boundary', () => {
    expect(shiftPeriod('2026-01', -1)).toBe('2025-12');
    expect(shiftPeriod('2026-12', 1)).toBe('2027-01');
  });
});
