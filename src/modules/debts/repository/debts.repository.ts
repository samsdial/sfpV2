import { db } from '@/lib/db';
import type { DbClient } from '@/modules/core';

function client(tx?: DbClient) {
  return tx ?? db;
}

export async function listLoans(userId: string, tx?: DbClient) {
  return client(tx).loan.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export async function upsertLoan(
  userId: string,
  data: {
    id?: string;
    name: string;
    initialCents: bigint;
    balanceCents: bigint;
    monthlyPaymentCents: bigint;
    annualRateEa: number;
  },
  tx?: DbClient,
) {
  const payload = {
    name: data.name,
    initialCents: data.initialCents,
    balanceCents: data.balanceCents,
    monthlyPaymentCents: data.monthlyPaymentCents,
    annualRateEa: data.annualRateEa,
  };
  if (data.id) {
    return client(tx).loan.update({ where: { id: data.id, userId }, data: payload });
  }
  return client(tx).loan.create({ data: { userId, ...payload } });
}

export async function listCreditCards(userId: string, tx?: DbClient) {
  return client(tx).creditCardProfile.findMany({
    where: { account: { userId } },
    include: { account: { select: { name: true, type: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function upsertCreditCard(
  data: {
    id?: string;
    accountId: string;
    creditLimitCents: bigint;
    cutDay: number;
    paymentDay: number;
    annualRateEa: number;
    usualPayment?: string;
  },
  tx?: DbClient,
) {
  const payload = {
    creditLimitCents: data.creditLimitCents,
    cutDay: data.cutDay,
    paymentDay: data.paymentDay,
    annualRateEa: data.annualRateEa,
    usualPayment: data.usualPayment ?? null,
  };
  if (data.id) {
    return client(tx).creditCardProfile.update({ where: { id: data.id }, data: payload });
  }
  return client(tx).creditCardProfile.create({
    data: { accountId: data.accountId, ...payload },
  });
}
