import {
  calculateCovariance as covOfPoints,
  calculateOLS as olsOfPoints,
  calculatePearsonsR as rOfPoints,
  calculateResiduals as residualsOfPoints,
  calculateRSS as rssOfPoints,
  seededGaussian,
  seededRandom,
} from '@kit/stats';
import type { OLSFit, Residual } from '@kit/stats';

/**
 * 17_0's domain adapter over the kit statistics.
 *
 * The kit works in neutral `{x, y}`; this unit reasons in shoe size (x) and
 * height (y). Keeping the translation here means the widgets read in the
 * language of the lesson, and a future unit adapts the same kit to its own.
 */

export interface StudentDataPoint {
  id: number;
  height: number; // inches
  shoeSize: number; // US shoe size
  label?: string;
}

const toPoints = (students: StudentDataPoint[]) =>
  students.map((s) => ({ id: s.id, x: s.shoeSize, y: s.height, label: s.label }));

// Scalar helpers pass straight through.
export {
  calculateMean,
  calculateDeviations,
  calculateTSS,
  calculateVariance,
  calculateStandardDeviation,
} from '@kit/stats';
export type { OLSFit, Residual };

export const calculateCovariance = (points: StudentDataPoint[], bessel = false): number =>
  covOfPoints(toPoints(points), bessel);

export const calculatePearsonsR = (points: StudentDataPoint[]): number =>
  rOfPoints(toPoints(points));

export const calculateOLS = (points: StudentDataPoint[]): OLSFit => olsOfPoints(toPoints(points));

export const calculateResiduals = (
  points: StudentDataPoint[],
  slope: number,
  intercept: number
): Residual[] => residualsOfPoints(toPoints(points), slope, intercept);

export const calculateRSS = (
  points: StudentDataPoint[],
  slope: number,
  intercept: number
): number => rssOfPoints(toPoints(points), slope, intercept);

// --- Unit datasets -------------------------------------------------------

/** Sample A: every student exactly 66 inches — zero spread. */
export function generateSampleA(count = 100): StudentDataPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    height: 66,
    shoeSize: 9.5,
    label: `Student A${i + 1}`,
  }));
}

/** Sample B: half at 60 inches, half at 72 — same mean as A, wide spread. */
export function generateSampleB(count = 100): StudentDataPoint[] {
  const half = Math.floor(count / 2);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    height: i < half ? 60 : 72,
    shoeSize: i < half ? 7.5 : 11.5,
    label: `Student B${i + 1}`,
  }));
}

/** Correlated shoe-size/height cohort; deterministic for a given seed. */
export function generateShoeHeightDataset(count = 100, seed = 42): StudentDataPoint[] {
  const random = seededRandom(seed);
  const dataset: StudentDataPoint[] = [];

  for (let i = 0; i < count; i++) {
    // Mean shoe size ~9.5, SD ~1.6, rounded to half sizes.
    const shoe = Math.round((9.5 + seededGaussian(random) * 1.6) * 2) / 2;
    const clampedShoe = Math.max(5.5, Math.min(14, shoe));

    // height = 48 + 1.88 * shoeSize + noise
    const noise = seededGaussian(random) * 2.2;
    const height = Math.round((48 + 1.88 * clampedShoe + noise) * 10) / 10;

    dataset.push({
      id: i + 1,
      shoeSize: clampedShoe,
      height: Math.max(56, Math.min(78, height)),
      label: `Student #${i + 1}`,
    });
  }

  return dataset;
}
