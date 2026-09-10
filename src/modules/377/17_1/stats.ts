import { calculateMean, seededGaussian, seededRandom32 } from '@kit/stats';
import type { XY } from './data';

/**
 * The regression machinery 17_1 teaches: inference by simulation (bootstrap,
 * permutation), the classical formulas those simulations reproduce, residual
 * diagnostics, influence measures, and the generalization tools.
 *
 * Everything is deterministic given a seed, so a number on the projector is the
 * same number on a student's laptop.
 */

export interface Fit {
  slope: number;
  intercept: number;
  r2: number;
  /** Classical SE of the slope: sqrt(MSE / Sxx). */
  seSlope: number;
  seIntercept: number;
  tStat: number;
  n: number;
  rss: number;
  meanX: number;
  meanY: number;
  sxx: number;
  /** Residual standard error, sqrt(RSS / (n - 2)). */
  sigma: number;
}

export function fit(points: XY[]): Fit {
  const n = points.length;
  const empty: Fit = {
    slope: 0, intercept: 0, r2: 0, seSlope: 0, seIntercept: 0, tStat: 0,
    n, rss: 0, meanX: 0, meanY: 0, sxx: 0, sigma: 0,
  };
  if (n < 2) return empty;

  const meanX = calculateMean(points.map((p) => p[0]));
  const meanY = calculateMean(points.map((p) => p[1]));

  let sxy = 0;
  let sxx = 0;
  for (const [x, y] of points) {
    sxy += (x - meanX) * (y - meanY);
    sxx += (x - meanX) ** 2;
  }
  if (sxx === 0) return { ...empty, meanX, meanY };

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;

  let rss = 0;
  let tss = 0;
  for (const [x, y] of points) {
    rss += (y - (slope * x + intercept)) ** 2;
    tss += (y - meanY) ** 2;
  }

  const sigma = n > 2 ? Math.sqrt(rss / (n - 2)) : 0;
  const seSlope = sigma / Math.sqrt(sxx);
  const seIntercept = sigma * Math.sqrt(1 / n + meanX ** 2 / sxx);

  return {
    slope,
    intercept,
    r2: tss === 0 ? 0 : 1 - rss / tss,
    seSlope,
    seIntercept,
    tStat: seSlope === 0 ? 0 : slope / seSlope,
    n,
    rss,
    meanX,
    meanY,
    sxx,
    sigma,
  };
}

export const predict = (f: Pick<Fit, 'slope' | 'intercept'>, x: number) => f.slope * x + f.intercept;

export const residuals = (points: XY[], f: Pick<Fit, 'slope' | 'intercept'>): XY[] =>
  points.map(([x, y]) => [predict(f, x), y - predict(f, x)] as XY);

/** R² of a fit evaluated on data it was not fitted to — can go negative. */
export function scoreOn(points: XY[], f: Pick<Fit, 'slope' | 'intercept'>): number {
  if (points.length === 0) return 0;
  const meanY = calculateMean(points.map((p) => p[1]));
  let rss = 0;
  let tss = 0;
  for (const [x, y] of points) {
    rss += (y - predict(f, x)) ** 2;
    tss += (y - meanY) ** 2;
  }
  return tss === 0 ? 0 : 1 - rss / tss;
}

// --- Inference by simulation (17_1_2) -----------------------------------

/** Bootstrap: resample pairs WITH replacement; the relationship survives. */
export function bootstrapSlopes(points: XY[], reps: number, seed = 7): number[] {
  const random = seededRandom32(seed);
  const n = points.length;
  const slopes: number[] = [];

  for (let r = 0; r < reps; r++) {
    const sample: XY[] = new Array(n);
    for (let i = 0; i < n; i++) sample[i] = points[Math.floor(random() * n)];
    slopes.push(fit(sample).slope);
  }
  return slopes;
}

/** Permutation: shuffle y against x, destroying the relationship — the null world. */
export function permutationSlopes(points: XY[], reps: number, seed = 11): number[] {
  const random = seededRandom32(seed);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const n = points.length;
  const slopes: number[] = [];

  for (let r = 0; r < reps; r++) {
    const shuffled = ys.slice();
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    slopes.push(fit(xs.map((x, i) => [x, shuffled[i]] as XY)).slope);
  }
  return slopes;
}

/** Two-sided empirical p-value: how often the null is at least this extreme. */
export function empiricalPValue(nullStats: number[], observed: number): number {
  if (nullStats.length === 0) return 1;
  const atLeastAsExtreme = nullStats.filter((s) => Math.abs(s) >= Math.abs(observed)).length;
  return atLeastAsExtreme / nullStats.length;
}

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Two-sided p-value for a t statistic. Uses a normal approximation, which is
 * indistinguishable from the t distribution at the sample sizes in this unit
 * and keeps the widget dependency-free.
 */
export function tToP(t: number): number {
  const z = Math.abs(t);
  // Abramowitz & Stegun 26.2.17 for the normal CDF.
  const b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429];
  const k = 1 / (1 + 0.2316419 * z);
  const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const tail = pdf * (b[0] * k + b[1] * k ** 2 + b[2] * k ** 3 + b[3] * k ** 4 + b[4] * k ** 5);
  return Math.min(1, 2 * tail);
}

/** Critical value ~1.96 at 95%; the t correction matters little past n≈30. */
export const T_STAR_95 = 1.96;

// --- Diagnostics (17_1_3) ----------------------------------------------

/** Durbin–Watson: ~2 means no autocorrelation, <1.7 positive, >2.3 negative. */
export function durbinWatson(resid: number[]): number {
  if (resid.length < 2) return 2;
  let num = 0;
  let den = 0;
  for (let i = 1; i < resid.length; i++) num += (resid[i] - resid[i - 1]) ** 2;
  for (const e of resid) den += e * e;
  return den === 0 ? 2 : num / den;
}

/** Inverse normal CDF (Acklam's rational approximation) — for Q-Q quantiles. */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pLow) return -normalQuantile(1 - p);

  const q = p - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** Q-Q points: theoretical normal quantile vs. standardised sample quantile. */
export function qqPoints(values: number[]): XY[] {
  const n = values.length;
  if (n === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const mean = calculateMean(sorted);
  const sd = Math.sqrt(sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, n - 1)) || 1;
  // Blom's plotting positions.
  return sorted.map((v, i) => [normalQuantile((i + 1 - 0.375) / (n + 0.25)), (v - mean) / sd] as XY);
}

// --- Influence (17_1_4) -------------------------------------------------

export interface Influence {
  index: number;
  x: number;
  y: number;
  /** Hat value h_ii — how extreme x is. */
  leverage: number;
  residual: number;
  /** Residual in standard-deviation units. */
  studentized: number;
  cooksD: number;
}

/** Leverage, studentized residuals and Cook's D for a simple regression. */
export function influenceMeasures(points: XY[]): Influence[] {
  const f = fit(points);
  const n = points.length;
  if (n < 3 || f.sxx === 0) return [];

  const mse = f.rss / (n - 2);

  return points.map(([x, y], index) => {
    const leverage = 1 / n + (x - f.meanX) ** 2 / f.sxx;
    const residual = y - predict(f, x);
    const denom = Math.sqrt(mse * (1 - leverage));
    const studentized = denom === 0 ? 0 : residual / denom;
    // D_i = (e_i^2 / (p * MSE)) * (h / (1-h)^2), with p = 2 parameters.
    const cooksD = mse === 0 ? 0 : (residual ** 2 / (2 * mse)) * (leverage / (1 - leverage) ** 2);
    return { index, x, y, leverage, residual, studentized, cooksD };
  });
}

// --- Generalization (17_1_6) -------------------------------------------

/** Deterministic train/test split — the shuffle depends only on the seed. */
export function trainTestSplit(points: XY[], testFraction: number, seed: number): { train: XY[]; test: XY[] } {
  const random = seededRandom32(seed);
  const shuffled = points.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const cut = Math.max(1, Math.round(shuffled.length * (1 - testFraction)));
  return { train: shuffled.slice(0, cut), test: shuffled.slice(cut) };
}

/**
 * Least-squares polynomial fit of the given degree, by normal equations with
 * Gaussian elimination. Degrees stay small enough here that conditioning is
 * not a problem; x is centred and scaled first to help.
 */
export function polyFit(points: XY[], degree: number): (x: number) => number {
  const n = points.length;
  if (n === 0) return () => 0;

  const xs = points.map((p) => p[0]);
  const centre = calculateMean(xs);
  const spread = Math.max(...xs.map((x) => Math.abs(x - centre))) || 1;
  const z = (x: number) => (x - centre) / spread;

  const size = degree + 1;
  const A: number[][] = Array.from({ length: size }, () => new Array(size + 1).fill(0));

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      A[i][j] = points.reduce((s, [x]) => s + z(x) ** (i + j), 0);
    }
    A[i][size] = points.reduce((s, [x, y]) => s + y * z(x) ** i, 0);
  }

  // Gaussian elimination with partial pivoting.
  for (let col = 0; col < size; col++) {
    let pivot = col;
    for (let r = col + 1; r < size; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    if (Math.abs(A[col][col]) < 1e-12) continue;

    for (let r = 0; r < size; r++) {
      if (r === col) continue;
      const factor = A[r][col] / A[col][col];
      for (let c = col; c <= size; c++) A[r][c] -= factor * A[col][c];
    }
  }

  const coefs = A.map((row, i) => (Math.abs(row[i]) < 1e-12 ? 0 : row[size] / row[i]));
  return (x: number) => coefs.reduce((sum, c, i) => sum + c * z(x) ** i, 0);
}

export function scoreCurve(points: XY[], f: (x: number) => number): number {
  if (points.length === 0) return 0;
  const meanY = calculateMean(points.map((p) => p[1]));
  let rss = 0;
  let tss = 0;
  for (const [x, y] of points) {
    rss += (y - f(x)) ** 2;
    tss += (y - meanY) ** 2;
  }
  return tss === 0 ? 0 : 1 - rss / tss;
}

/** sin(x) + noise, the 17_1_6 overfitting demo. */
export function sinDataset(n = 60, noise = 0.25, seed = 3): XY[] {
  const random = seededRandom32(seed);
  return Array.from({ length: n }, (_, i) => {
    const x = (i / (n - 1)) * 2 * Math.PI;
    return [x, Math.sin(x) + seededGaussian(random) * noise] as XY;
  });
}

/** Synthetic data for the assumption demos — one violation at a time. */
export type ViolationKind = 'none' | 'curved' | 'funnel' | 'heavy-tails';

export function violationDataset(kind: ViolationKind, n = 90, seed = 5): XY[] {
  const random = seededRandom32(seed);
  return Array.from({ length: n }, (_, i) => {
    const x = 1 + (i / (n - 1)) * 9;
    const g = seededGaussian(random);

    switch (kind) {
      case 'curved':
        // Diminishing returns: still rising everywhere, so a straight line gets
        // a healthy R2 while the residuals arc unmistakably. A hump-shaped
        // quadratic would cancel the linear trend and give the game away.
        return [x, 4 + 3.6 * x - 0.16 * x * x + g * 0.8] as XY;
      case 'funnel':
        // Linear in the mean; only the spread changes. Tuned so R2 lands close
        // to the healthy case — the whole point is that R2 misses this.
        return [x, 4 + 2.6 * x + g * (0.2 + 0.42 * x)] as XY;
      case 'heavy-tails': {
        // Linear and homoscedastic, but the noise has fat tails.
        const spike = random() < 0.09 ? (random() < 0.5 ? -1 : 1) * (4 + random() * 7) : 0;
        return [x, 4 + 2.6 * x + g * 1.4 + spike] as XY;
      }
      default:
        return [x, 4 + 2.6 * x + g * 1.9] as XY;
    }
  });
}

/** Autocorrelated series for the Durbin–Watson demo. */
export function autocorrelatedDataset(rho: number, n = 80, seed = 9): XY[] {
  const random = seededRandom32(seed);
  let e = 0;
  return Array.from({ length: n }, (_, i) => {
    const x = i / (n - 1) * 10;
    e = rho * e + seededGaussian(random) * 1.0;
    return [x, 3 + 1.2 * x + e] as XY;
  });
}
