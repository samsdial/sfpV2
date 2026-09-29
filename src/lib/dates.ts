import { TZDate } from '@date-fns/tz';
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  lastDayOfMonth,
  parseISO,
  setDate,
  startOfMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';

const TZ = 'America/Bogota';

function tzDateFromYmd(ymd: string): TZDate {
  const [y, m, d] = ymd.split('-').map(Number);
  return new TZDate(y!, m! - 1, d!, TZ);
}

function toYmd(d: TZDate): string {
  return format(d, 'yyyy-MM-dd');
}

export function today(): string {
  return toYmd(new TZDate(Date.now(), TZ));
}

export function periodOf(date: string, startDay: number): string {
  const d = tzDateFromYmd(date);
  const day = d.getDate();
  if (startDay <= 1 || day >= startDay) {
    return format(d, 'yyyy-MM');
  }
  const prev = addMonths(d, -1);
  return format(prev, 'yyyy-MM');
}

export function periodRange(
  period: string,
  startDay: number,
): { from: string; to: string } {
  const [y, m] = period.split('-').map(Number);
  const base = new TZDate(y!, m! - 1, 1, TZ);

  if (startDay <= 1) {
    const from = startOfMonth(base);
    const to = lastDayOfMonth(base);
    return { from: toYmd(from as TZDate), to: toYmd(to as TZDate) };
  }

  const from = setDate(base, startDay) as TZDate;
  const nextMonth = addMonths(base, 1);
  const to = addDays(setDate(nextMonth, startDay) as TZDate, -1);
  return { from: toYmd(from), to: toYmd(to as TZDate) };
}

export function daysLeftInPeriod(period: string, startDay: number): number {
  const { to } = periodRange(period, startDay);
  const end = tzDateFromYmd(to);
  const now = tzDateFromYmd(today());
  return Math.max(0, differenceInCalendarDays(end, now));
}

export function shiftPeriod(period: string, delta: number): string {
  const [y, m] = period.split('-').map(Number);
  const d = addMonths(new TZDate(y!, m! - 1, 1, TZ), delta);
  return format(d, 'yyyy-MM');
}

export function formatDate(
  date: string,
  style: 'short' | 'long' | 'input',
): string {
  const d = tzDateFromYmd(date);
  if (style === 'input') return format(d, 'dd/MM/yyyy');
  if (style === 'long') return format(d, 'd MMM yyyy', { locale: es });
  return format(d, 'd MMM yyyy', { locale: es });
}

export function parseDateInput(input: string): string | null {
  const m = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  try {
    parseISO(iso);
    return iso;
  } catch {
    return null;
  }
}
