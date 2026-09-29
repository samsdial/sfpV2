import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import {
  amortizationSchedule,
  eaToMonthly,
  loanPayment,
  monthlyToEa,
  requiredMonthlyContribution,
} from './finance-math';

describe('finance-math', () => {
  it('handles zero rate FV and PMT', () => {
    expect(requiredMonthlyContribution(new Decimal(1000), new Decimal(0), new Decimal(0), 10).toNumber()).toBe(
      100,
    );
  });

  it('roundtrips ea and monthly rate', () => {
    const ea = new Decimal('0.24');
    const im = eaToMonthly(ea);
    const back = monthlyToEa(im);
    expect(back.minus(ea).abs().toNumber()).toBeLessThan(1e-10);
  });

  it('computes loan payment for 24% EA over 36 months', () => {
    const im = eaToMonthly(new Decimal('0.24'));
    const pmt = loanPayment(new Decimal(10_000_000), im, 36);
    expect(pmt.toFixed(0)).toBe('380381');
  });

  it('amortization ends at zero balance', () => {
    const im = eaToMonthly(new Decimal('0.24'));
    const pmt = loanPayment(new Decimal(10_000_000), im, 36);
    const rows = amortizationSchedule(new Decimal(10_000_000), im, 36);
    expect(rows.at(-1)?.balance.toNumber()).toBe(0);
    expect(rows[0]?.payment.toFixed(0)).toBe(pmt.toFixed(0));
  });
});
