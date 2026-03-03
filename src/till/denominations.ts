export type DenominationKey =
  | 'c5'
  | 'c10'
  | 'c20'
  | 'c50'
  | 'd1'
  | 'd2'
  | 'b5'
  | 'b10'
  | 'b20'
  | 'b50'
  | 'b100';

export type Denomination = {
  key: DenominationKey;
  label: string;
  value: number;
  type: 'coin' | 'bill';
  coinsPerRoll?: number;
};

export const DENOMINATIONS: Denomination[] = [
  { key: 'c5', label: '$0.05', value: 0.05, type: 'coin', coinsPerRoll: 40 },
  { key: 'c10', label: '$0.10', value: 0.1, type: 'coin', coinsPerRoll: 40 },
  { key: 'c20', label: '$0.20', value: 0.2, type: 'coin', coinsPerRoll: 20 },
  { key: 'c50', label: '$0.50', value: 0.5, type: 'coin', coinsPerRoll: 20 },
  { key: 'd1', label: '$1', value: 1, type: 'coin', coinsPerRoll: 20 },
  { key: 'd2', label: '$2', value: 2, type: 'coin', coinsPerRoll: 25 },
  { key: 'b5', label: '$5', value: 5, type: 'bill' },
  { key: 'b10', label: '$10', value: 10, type: 'bill' },
  { key: 'b20', label: '$20', value: 20, type: 'bill' },
  { key: 'b50', label: '$50', value: 50, type: 'bill' },
  { key: 'b100', label: '$100', value: 100, type: 'bill' },
];

export type TillRowValues = {
  rolls: string;
  count: string;
};

export function createEmptyTillRows(): Record<DenominationKey, TillRowValues> {
  return {
    c5: { rolls: '', count: '' },
    c10: { rolls: '', count: '' },
    c20: { rolls: '', count: '' },
    c50: { rolls: '', count: '' },
    d1: { rolls: '', count: '' },
    d2: { rolls: '', count: '' },
    b5: { rolls: '', count: '' },
    b10: { rolls: '', count: '' },
    b20: { rolls: '', count: '' },
    b50: { rolls: '', count: '' },
    b100: { rolls: '', count: '' },
  };
}

