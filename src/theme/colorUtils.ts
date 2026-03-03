export function darkenHex(hex: string, amount: number): string {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
  if (full.length !== 6) return hex;

  const num = Number.parseInt(full, 16);
  if (!Number.isFinite(num)) return hex;

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const factor = Math.max(0, Math.min(1, 1 - amount));
  const nr = Math.round(r * factor);
  const ng = Math.round(g * factor);
  const nb = Math.round(b * factor);

  const out = (nr << 16) + (ng << 8) + nb;
  return `#${out.toString(16).padStart(6, '0')}`;
}

