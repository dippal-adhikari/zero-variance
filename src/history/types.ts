import type { DenominationKey, TillRowValues } from '../till/denominations';

export type TillEntry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  float: string;
  rows: Record<DenominationKey, TillRowValues>;
};

