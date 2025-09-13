// Utility functions for the game

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function map(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = (v - inMin) / (inMax - inMin);
  return outMin + (outMax - outMin) * t;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function pickWeightedSnack(snackTable: Array<{ weight: number }>): number {
  let total = 0;
  for (const s of snackTable) total += s.weight;
  let r = Math.random() * total;
  for (let i = 0; i < snackTable.length; i++) {
    if (r < snackTable[i].weight) return i;
    r -= snackTable[i].weight;
  }
  return 0;
}

export function shortAddr(address?: string): string {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';
}
