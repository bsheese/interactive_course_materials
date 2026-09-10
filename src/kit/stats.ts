import type { Point } from './types';

/**
 * Course-wide statistics helpers. Everything here is pure, dependency-free and
 * domain-neutral: point functions take `{x, y}`, so a module adapts its own
 * shape (see modules/377/17_0/stats.ts) rather than the kit learning about it.
 */

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}

export function calculateDeviations(values: number[]): number[] {
  const mean = calculateMean(values);
  return values.map((v) => v - mean);
}

/** Total sum of squares: the error a mean-only baseline makes. */
export function calculateTSS(values: number[]): number {
  const mean = calculateMean(values);
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0);
}

export function calculateVariance(values: number[], useBesselsCorrection = false): number {
  if (values.length <= (useBesselsCorrection ? 1 : 0)) return 0;
  const divisor = useBesselsCorrection ? values.length - 1 : values.length;
  return calculateTSS(values) / divisor;
}

export function calculateStandardDeviation(values: number[], useBesselsCorrection = false): number {
  return Math.sqrt(calculateVariance(values, useBesselsCorrection));
}

export function calculateCovariance(points: Point[], useBesselsCorrection = false): number {
  if (points.length <= (useBesselsCorrection ? 1 : 0)) return 0;
  const meanX = calculateMean(points.map((p) => p.x));
  const meanY = calculateMean(points.map((p) => p.y));

  const sumCrossProducts = points.reduce(
    (sum, p) => sum + (p.x - meanX) * (p.y - meanY),
    0
  );

  const divisor = useBesselsCorrection ? points.length - 1 : points.length;
  return sumCrossProducts / divisor;
}

export function calculatePearsonsR(points: Point[]): number {
  if (points.length < 2) return 0;
  const sdX = calculateStandardDeviation(points.map((p) => p.x), true);
  const sdY = calculateStandardDeviation(points.map((p) => p.y), true);
  if (sdX === 0 || sdY === 0) return 0;

  const r = calculateCovariance(points, true) / (sdX * sdY);
  // Clamp for numerical stability.
  return Math.max(-1, Math.min(1, r));
}

export interface OLSFit {
  slope: number;
  intercept: number;
  r: number;
  r2: number;
  meanX: number;
  meanY: number;
  sdX: number;
  sdY: number;
  cov: number;
}

export function calculateOLS(points: Point[]): OLSFit {
  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);

  const meanX = calculateMean(xValues);
  const meanY = calculateMean(yValues);
  const sdX = calculateStandardDeviation(xValues, true);
  const sdY = calculateStandardDeviation(yValues, true);
  const cov = calculateCovariance(points, true);
  const r = calculatePearsonsR(points);

  const slope = sdX === 0 ? 0 : r * (sdY / sdX);

  return {
    slope,
    intercept: meanY - slope * meanX,
    r,
    r2: r * r,
    meanX,
    meanY,
    sdX,
    sdY,
    cov,
  };
}

export interface Residual {
  id: number;
  x: number;
  y: number;
  yHat: number;
  residual: number;
  squaredResidual: number;
}

export function calculateResiduals(points: Point[], slope: number, intercept: number): Residual[] {
  return points.map((p, i) => {
    const yHat = slope * p.x + intercept;
    const residual = p.y - yHat;
    return {
      id: p.id ?? i + 1,
      x: p.x,
      y: p.y,
      yHat,
      residual,
      squaredResidual: residual * residual,
    };
  });
}

export function calculateRSS(points: Point[], slope: number, intercept: number): number {
  return calculateResiduals(points, slope, intercept).reduce(
    (sum, r) => sum + r.squaredResidual,
    0
  );
}

/**
 * Deterministic pseudo-random source (mulberry32). Good enough for resampling
 * work — long period, well-distributed — and stable across machines, so a
 * number on the projector is the same number on a student's laptop.
 */
export function seededRandom32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Legacy linear congruential source. Its period is short (233,280), so prefer
 * `seededRandom32` for simulation; this one is kept because 17_0's dataset is
 * defined by the exact sequence it produces.
 */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Box-Muller draw from a seeded uniform source. */
export function seededGaussian(random: () => number): number {
  const u1 = random();
  const u2 = random();
  return Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
}
