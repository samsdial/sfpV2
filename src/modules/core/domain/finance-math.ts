import Decimal from 'decimal.js';

export type AmortRow = {
  k: number;
  payment: Decimal;
  interest: Decimal;
  capital: Decimal;
  balance: Decimal;
};

export function eaToMonthly(ea: Decimal): Decimal {
  return ea.plus(1).pow(new Decimal(1).div(12)).minus(1);
}

export function monthlyToEa(im: Decimal): Decimal {
  return im.plus(1).pow(12).minus(1);
}

export function futureValue(
  pv: Decimal,
  pmt: Decimal,
  im: Decimal,
  n: number,
): Decimal {
  if (n <= 0) return pv;
  if (im.isZero()) return pv.plus(pmt.mul(n));
  const factor = im.plus(1).pow(n);
  return pv.mul(factor).plus(pmt.mul(factor.minus(1).div(im)));
}

export function requiredMonthlyContribution(
  fv: Decimal,
  pv: Decimal,
  im: Decimal,
  n: number,
): Decimal {
  if (n <= 0) throw new Error('n must be positive');
  if (im.isZero()) {
    const raw = fv.minus(pv).div(n);
    return Decimal.max(raw, 0);
  }
  const factor = im.plus(1).pow(n);
  const pmt = fv.minus(pv.mul(factor)).mul(im).div(factor.minus(1));
  return Decimal.max(pmt, 0);
}

export function loanPayment(principal: Decimal, im: Decimal, n: number): Decimal {
  if (n <= 0) throw new Error('n must be positive');
  if (im.isZero()) return principal.div(n);
  const denom = new Decimal(1).minus(im.plus(1).pow(-n));
  return principal.mul(im).div(denom);
}

export function amortizationSchedule(
  principal: Decimal,
  im: Decimal,
  n: number,
  extra: Decimal = new Decimal(0),
): AmortRow[] {
  const rows: AmortRow[] = [];
  let balance = principal;
  const payment =
    im.isZero() ? principal.div(n) : loanPayment(principal, im, n);

  for (let k = 1; k <= n && balance.gt(0); k++) {
    const interest = im.isZero() ? new Decimal(0) : balance.mul(im);
    let capital = payment.minus(interest).plus(extra);
    if (capital.gt(balance)) capital = balance;
    const actualPayment = interest.plus(capital);
    balance = balance.minus(capital);
    if (k === n && balance.abs().lt(new Decimal('0.01'))) balance = new Decimal(0);
    rows.push({ k, payment: actualPayment, interest, capital, balance });
  }
  return rows;
}
