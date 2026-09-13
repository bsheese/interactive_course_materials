import type { PlotPoint } from '@kit/components/ScatterPlot';

/** Consistent categorical colouring across every chart in this module — the
 *  same species/sex/etc. always gets the same colour, and it's drawn from
 *  the kit's own tone vocabulary (`ScatterPlot`'s five `PlotPoint` tones)
 *  rather than a second, competing palette. */
export const CATEGORY_TONES: NonNullable<PlotPoint['tone']>[] = ['default', 'accent', 'good', 'bad', 'muted'];
export const CATEGORY_HEX = ['#1A1A1A', '#E67E22', '#27AE60', '#C0392B', '#B9B3A9'] as const;

export function hexForIndex(i: number): string {
  return CATEGORY_HEX[i % CATEGORY_HEX.length];
}

export function toneForIndex(i: number): NonNullable<PlotPoint['tone']> {
  return CATEGORY_TONES[i % CATEGORY_TONES.length];
}

/** Diverging colour for a Pearson's r in [-1, 1]: blue (negative) through
 *  white (zero) to orange-red (positive) — a coolwarm stand-in. */
export function hexForCorrelation(r: number): string {
  const clamped = Math.max(-1, Math.min(1, r));
  if (clamped >= 0) {
    const t = clamped;
    return mix('#F5F2ED', '#C0392B', t);
  }
  const t = -clamped;
  return mix('#F5F2ED', '#2980B9', t);
}

function mix(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
