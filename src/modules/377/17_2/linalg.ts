import { seededRandom32 } from '@kit/stats';

/**
 * The small amount of linear algebra 17_2 needs to run real multiple
 * regression in the browser: least squares, Ridge, Lasso / Elastic Net,
 * a StandardScaler, and k-fold splits. Rows are observations, columns are
 * features — the same layout as a pandas DataFrame.
 *
 * Penalties follow scikit-learn's conventions so the alphas a student sees here
 * are on the same scale as the ones in the notebooks:
 *   Ridge:       ‖y − Xβ‖² + α‖β‖²
 *   ElasticNet:  (1/2n)‖y − Xβ‖² + α·r·‖β‖₁ + ½·α·(1 − r)·‖β‖²   (Lasso is r = 1)
 * The intercept is never penalized.
 */

export type Matrix = number[][];

export interface LinearModel {
  intercept: number;
  coef: number[];
}

export const mean = (v: number[]): number => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0);

/** Solves A·x = b by Gaussian elimination with partial pivoting. */
export function solve(A: Matrix, b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    if (Math.abs(M[col][col]) < 1e-14) continue;
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / M[col][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    if (Math.abs(M[r][r]) < 1e-14) continue;
    let s = M[r][n];
    for (let c = r + 1; c < n; c++) s -= M[r][c] * x[c];
    x[r] = s / M[r][r];
  }
  return x;
}

export const columns = (X: Matrix, cols: number[]): Matrix => X.map((row) => cols.map((c) => row[c]));
export const rows = <T>(data: T[], idx: number[]): T[] => idx.map((i) => data[i]);

// --- StandardScaler ------------------------------------------------------

export interface Scaler {
  mean: number[];
  sd: number[];
}

/** Learns column means and SDs — a statistical step, so fit it on training rows only. */
export function fitScaler(X: Matrix): Scaler {
  const p = X[0]?.length ?? 0;
  const m = new Array(p).fill(0);
  const s = new Array(p).fill(0);
  for (const row of X) for (let j = 0; j < p; j++) m[j] += row[j];
  for (let j = 0; j < p; j++) m[j] /= X.length;
  for (const row of X) for (let j = 0; j < p; j++) s[j] += (row[j] - m[j]) ** 2;
  for (let j = 0; j < p; j++) s[j] = Math.sqrt(s[j] / X.length) || 1;
  return { mean: m, sd: s };
}

export const applyScaler = (X: Matrix, sc: Scaler): Matrix =>
  X.map((row) => row.map((v, j) => (v - sc.mean[j]) / sc.sd[j]));

// --- Fitting -------------------------------------------------------------

/** Ridge with an unpenalized intercept. alpha = 0 is ordinary least squares. */
export function fitRidge(X: Matrix, y: number[], alpha: number): LinearModel {
  const n = X.length;
  const p = X[0]?.length ?? 0;
  const xm = new Array(p).fill(0);
  for (const row of X) for (let j = 0; j < p; j++) xm[j] += row[j] / n;
  const ym = mean(y);

  const A: Matrix = Array.from({ length: p }, () => new Array(p).fill(0));
  const b = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    const xc = X[i].map((v, j) => v - xm[j]);
    const yc = y[i] - ym;
    for (let j = 0; j < p; j++) {
      b[j] += xc[j] * yc;
      for (let k = j; k < p; k++) A[j][k] += xc[j] * xc[k];
    }
  }
  for (let j = 0; j < p; j++) {
    for (let k = 0; k < j; k++) A[j][k] = A[k][j];
    // A whisker of ridge keeps exactly collinear columns solvable at alpha = 0.
    A[j][j] += alpha + 1e-9;
  }
  const coef = p ? solve(A, b) : [];
  return { intercept: ym - coef.reduce((s, c, j) => s + c * xm[j], 0), coef };
}

export const fitOLS = (X: Matrix, y: number[]): LinearModel => fitRidge(X, y, 0);

const softThreshold = (z: number, g: number) => (z > g ? z - g : z < -g ? z + g : 0);

/**
 * Elastic Net by coordinate descent (Lasso when l1Ratio = 1). Pass `start` to
 * warm-start from a neighbouring alpha, which makes whole paths cheap.
 */
export function fitElasticNet(
  X: Matrix,
  y: number[],
  alpha: number,
  l1Ratio: number,
  start?: number[]
): LinearModel {
  const n = X.length;
  const p = X[0]?.length ?? 0;
  const xm = new Array(p).fill(0);
  for (const row of X) for (let j = 0; j < p; j++) xm[j] += row[j] / n;
  const ym = mean(y);

  // Column-major centred copy: coordinate descent walks one column at a time.
  const cols = Array.from({ length: p }, (_, j) => X.map((row) => row[j] - xm[j]));
  const z = cols.map((c) => c.reduce((s, v) => s + v * v, 0) / n);
  const beta = start ? start.slice() : new Array(p).fill(0);
  const resid = y.map((v, i) => v - ym - cols.reduce((s, c, j) => s + c[i] * beta[j], 0));

  const l1 = alpha * l1Ratio;
  const l2 = alpha * (1 - l1Ratio);
  for (let iter = 0; iter < 2000; iter++) {
    let maxDelta = 0;
    for (let j = 0; j < p; j++) {
      const c = cols[j];
      let rho = 0;
      for (let i = 0; i < n; i++) rho += c[i] * resid[i];
      rho = rho / n + z[j] * beta[j];
      const next = z[j] + l2 === 0 ? 0 : softThreshold(rho, l1) / (z[j] + l2);
      const delta = next - beta[j];
      if (delta !== 0) {
        for (let i = 0; i < n; i++) resid[i] -= c[i] * delta;
        beta[j] = next;
        maxDelta = Math.max(maxDelta, Math.abs(delta));
      }
    }
    if (maxDelta < 1e-7) break;
  }
  return { intercept: ym - beta.reduce((s, b, j) => s + b * xm[j], 0), coef: beta };
}

export const predict = (m: LinearModel, X: Matrix): number[] =>
  X.map((row) => row.reduce((s, v, j) => s + v * m.coef[j], m.intercept));

// --- Scoring -------------------------------------------------------------

export function r2Score(y: number[], yhat: number[]): number {
  const ym = mean(y);
  let rss = 0;
  let tss = 0;
  for (let i = 0; i < y.length; i++) {
    rss += (y[i] - yhat[i]) ** 2;
    tss += (y[i] - ym) ** 2;
  }
  return tss === 0 ? 0 : 1 - rss / tss;
}

export const mse = (y: number[], yhat: number[]): number =>
  mean(y.map((v, i) => (v - yhat[i]) ** 2));

export const mae = (y: number[], yhat: number[]): number =>
  mean(y.map((v, i) => Math.abs(v - yhat[i])));

// --- Splitting -----------------------------------------------------------

/** A seeded permutation of 0..n-1. */
export function shuffledIndices(n: number, seed: number): number[] {
  const random = seededRandom32(seed);
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export interface Fold {
  train: number[];
  test: number[];
}

/** k-fold cross-validation, shuffled once with a seed (KFold(shuffle=True)). */
export function kFold(n: number, k: number, seed: number): Fold[] {
  const order = shuffledIndices(n, seed);
  return Array.from({ length: k }, (_, f) => {
    const lo = Math.round((f * n) / k);
    const hi = Math.round(((f + 1) * n) / k);
    const test = order.slice(lo, hi);
    const train = [...order.slice(0, lo), ...order.slice(hi)];
    return { train, test };
  });
}

/** Train/test split by seed, as `train_test_split(test_size=…, random_state=…)`. */
export function trainTestIndices(n: number, testFraction: number, seed: number): Fold {
  const order = shuffledIndices(n, seed);
  const cut = Math.round(n * (1 - testFraction));
  return { train: order.slice(0, cut), test: order.slice(cut) };
}

/**
 * A scaler-plus-model pipeline, fitted on training rows only. Every widget
 * that cross-validates goes through this, so the scaler never sees a
 * validation fold — the leak the notebooks' Pipelines exist to prevent.
 */
export function fitPipeline(
  X: Matrix,
  y: number[],
  fitModel: (Xs: Matrix, y: number[]) => LinearModel
): { scaler: Scaler; model: LinearModel; predict: (Xnew: Matrix) => number[] } {
  const scaler = fitScaler(X);
  const model = fitModel(applyScaler(X, scaler), y);
  return { scaler, model, predict: (Xnew) => predict(model, applyScaler(Xnew, scaler)) };
}
