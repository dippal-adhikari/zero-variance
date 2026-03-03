import type { Denomination, DenominationKey, TillRowValues } from './denominations';

export function parseNonNegativeInt(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function parseMoney(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const n = Number.parseFloat(trimmed);
  if (!Number.isFinite(n)) return 0;
  return n;
}

export function formatCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `$${safe.toFixed(2)}`;
}

export function getRowTotal(denom: Denomination, row: TillRowValues): number {
  const count = parseNonNegativeInt(row.count);
  const rolls = parseNonNegativeInt(row.rolls);

  if (denom.type === 'coin') {
    const perRoll = denom.coinsPerRoll ?? 0;
    const coins = rolls * perRoll + count;
    return coins * denom.value;
  }

  return count * denom.value;
}

export function sumTotals(
  denominations: Denomination[],
  rows: Record<DenominationKey, TillRowValues>,
): number {
  return denominations.reduce((acc, d) => acc + getRowTotal(d, rows[d.key]), 0);
}

