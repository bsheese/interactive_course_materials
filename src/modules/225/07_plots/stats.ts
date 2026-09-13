import {
  calculateMean,
  calculateStandardDeviation,
  calculatePearsonsR as pearsonsROfPoints,
  calculateOLS as olsOfPoints,
} from '@kit/stats';
import type { OLSFit } from '@kit/stats';
import type { Point } from '@kit/types';

/**
 * 07_plots' domain adapter over the kit statistics. The kit works in neutral
 * `{x, y}` points; this module reasons over plain data-frame-shaped rows
 * (penguins, Ames housing), so the translation lives here.
 */

export type Row = Record<string, string | number>;

export function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const k = key(row);
    const bucket = groups.get(k);
    if (bucket) bucket.push(row);
    else groups.set(k, [row]);
  }
  return groups;
}

export function numericValues(rows: Row[], key: string): number[] {
  return rows.map((r) => Number(r[key])).filter((v) => Number.isFinite(v));
}

/** Distinct string values of a column, in first-seen order. */
export function uniqueValues(rows: Row[], key: string): string[] {
  const seen = new Set<string>();
  const values: string[] = [];
  for (const row of rows) {
    const v = String(row[key]);
    if (!seen.has(v)) {
      seen.add(v);
      values.push(v);
    }
  }
  return values;
}

export function quantile(sortedValues: number[], q: number): number {
  if (sortedValues.length === 0) return NaN;
  const pos = (sortedValues.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sortedValues[lo];
  return sortedValues[lo] + (sortedValues[hi] - sortedValues[lo]) * (pos - lo);
}

export interface FiveNumberSummary {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
  mean: number;
}

/** Tukey's rule: whiskers reach the most extreme point within 1.5*IQR of the
 *  box; anything past that is drawn as an individual outlier, same as
 *  seaborn's default boxplot. */
export function fiveNumberSummary(values: number[]): FiveNumberSummary {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowBound = q1 - 1.5 * iqr;
  const highBound = q3 + 1.5 * iqr;
  const inliers = sorted.filter((v) => v >= lowBound && v <= highBound);
  const outliers = sorted.filter((v) => v < lowBound || v > highBound);
  return {
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1],
    whiskerLow: inliers.length ? inliers[0] : sorted[0],
    whiskerHigh: inliers.length ? inliers[inliers.length - 1] : sorted[sorted.length - 1],
    outliers,
    mean: calculateMean(sorted),
  };
}

export interface CiEstimate {
  mean: number;
  ciLow: number;
  ciHigh: number;
  sd: number;
  n: number;
}

/** Normal-approximation 95% CI around the mean. Seaborn's barplot bootstraps
 *  its interval; this is deterministic and close enough for teaching. */
export function meanWithCI(values: number[]): CiEstimate {
  const mean = calculateMean(values);
  const sd = calculateStandardDeviation(values, true);
  const n = values.length;
  const se = n > 1 ? sd / Math.sqrt(n) : 0;
  return { mean, ciLow: mean - 1.96 * se, ciHigh: mean + 1.96 * se, sd, n };
}

/** Gaussian KDE over a fixed grid, Silverman's rule-of-thumb bandwidth. */
export function kde(values: number[], bwAdjust = 1, gridSize = 48): { x: number; y: number }[] {
  const n = values.length;
  if (n === 0) return [];
  const sd = calculateStandardDeviation(values, true) || 1;
  const bandwidth = (1.06 * sd * Math.pow(n, -1 / 5) || 1) * bwAdjust;
  const min = Math.min(...values) - bandwidth * 2.5;
  const max = Math.max(...values) + bandwidth * 2.5;
  const step = (max - min) / (gridSize - 1);
  const grid: { x: number; y: number }[] = [];
  for (let i = 0; i < gridSize; i++) {
    const x = min + i * step;
    let sum = 0;
    for (const v of values) {
      const u = (x - v) / bandwidth;
      sum += Math.exp(-0.5 * u * u);
    }
    grid.push({ x, y: sum / (n * bandwidth * Math.sqrt(2 * Math.PI)) });
  }
  return grid;
}

/** Pearson's r between every pair of the given numeric columns. */
export function correlationMatrix(rows: Row[], columns: string[]): number[][] {
  return columns.map((colA) =>
    columns.map((colB) => {
      const points: Point[] = rows.map((r) => ({ x: Number(r[colA]), y: Number(r[colB]) }));
      return pearsonsROfPoints(points);
    })
  );
}

export const calculateOLS = olsOfPoints;
export type { OLSFit };
