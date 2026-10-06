import { seededGaussian, seededRandom32 } from '@kit/stats';
import { AMES_FEATURES, AMES_HOUSES } from './data';
import {
  type Fold,
  type Matrix,
  applyScaler,
  columns,
  fitOLS,
  fitPipeline,
  fitRidge,
  fitScaler,
  kFold,
  mean,
  mse,
  predict,
  r2Score,
  rows,
} from './linalg';

/**
 * The 17_2 adapters: Ames as a feature matrix, the synthetic worlds the
 * widgets need, and regression trees. Everything is seeded, so the projector
 * and a student's laptop show the same numbers.
 */

export type XY = [x: number, y: number];

// --- Ames ----------------------------------------------------------------

export const FEATURE_LABELS = AMES_FEATURES.map((f) => f.label);
export const featureIndex = (key: string) => AMES_FEATURES.findIndex((f) => f.key === key);

/** All 12 features, one row per house. */
export const AMES_X: Matrix = AMES_HOUSES.map((h) => h.f);
/** The notebooks' target: log of sale price. */
export const AMES_LOG_PRICE: number[] = AMES_HOUSES.map((h) => Math.log(h.p));
export const AMES_PRICE: number[] = AMES_HOUSES.map((h) => h.p);

/** Living area vs price in $1,000s — the one-feature view the tree widgets use. */
export const AMES_AREA_PRICE: XY[] = AMES_HOUSES.map((h) => [
  h.f[featureIndex('grLivArea')],
  h.p / 1000,
]);

export const AMES_FOLDS: Fold[] = kFold(AMES_X.length, 5, 42);

/** Mean 5-fold CV R² of plain least squares on a subset of feature columns. */
export function cvR2(cols: number[], folds: Fold[] = AMES_FOLDS): number {
  if (cols.length === 0) return 0;
  const X = columns(AMES_X, cols);
  return mean(
    folds.map(({ train, test }) => {
      const m = fitOLS(rows(X, train), rows(AMES_LOG_PRICE, train));
      return r2Score(rows(AMES_LOG_PRICE, test), predict(m, rows(X, test)));
    })
  );
}

// --- Leakage: selecting features from pure noise ---------------------------

export interface NoiseWorld {
  X: Matrix;
  y: number[];
}

/** n rows of p columns of pure noise, and a target that is noise too. */
export function noiseWorld(n: number, p: number, seed: number): NoiseWorld {
  const random = seededRandom32(seed);
  const X = Array.from({ length: n }, () => Array.from({ length: p }, () => seededGaussian(random)));
  const y = Array.from({ length: n }, () => seededGaussian(random));
  return { X, y };
}

/** Indices of the k columns most correlated (in absolute value) with y, using the given rows only. */
export function topCorrelated(X: Matrix, y: number[], useRows: number[], k: number): number[] {
  const p = X[0].length;
  const ys = rows(y, useRows);
  const ym = mean(ys);
  const yc = ys.map((v) => v - ym);
  const yss = Math.sqrt(yc.reduce((s, v) => s + v * v, 0)) || 1;
  const scores: [number, number][] = [];
  for (let j = 0; j < p; j++) {
    let xm = 0;
    for (const i of useRows) xm += X[i][j];
    xm /= useRows.length;
    let sxy = 0;
    let sxx = 0;
    useRows.forEach((i, r) => {
      const d = X[i][j] - xm;
      sxy += d * yc[r];
      sxx += d * d;
    });
    scores.push([Math.abs(sxy / (Math.sqrt(sxx) * yss || 1)), j]);
  }
  return scores
    .sort((a, b) => b[0] - a[0])
    .slice(0, k)
    .map(([, j]) => j);
}

/**
 * CV R² per fold for the two orderings: select the top-k columns on all rows
 * and then cross-validate (leaky), or select inside each training fold (honest).
 */
export function selectionLeak(world: NoiseWorld, k: number, seed: number) {
  const { X, y } = world;
  const folds = kFold(y.length, 5, seed);
  const all = y.map((_, i) => i);
  const leakyCols = topCorrelated(X, y, all, k);

  const score = (cols: number[], { train, test }: Fold) => {
    const Xc = columns(X, cols);
    const m = fitOLS(rows(Xc, train), rows(y, train));
    return r2Score(rows(y, test), predict(m, rows(Xc, test)));
  };

  return {
    leaky: folds.map((f) => score(leakyCols, f)),
    honest: folds.map((f) => score(topCorrelated(X, y, f.train, k), f)),
  };
}

// --- Multicollinearity -----------------------------------------------------

/** Two predictors with correlation ρ and a target that depends on both equally. */
export function twinFeatures(rho: number, n: number, seed: number) {
  const random = seededRandom32(seed);
  const X: Matrix = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = seededGaussian(random);
    const b = rho * a + Math.sqrt(1 - rho * rho) * seededGaussian(random);
    X.push([a, b]);
    y.push(1 * a + 1 * b + seededGaussian(random) * 1.5);
  }
  return { X, y };
}

/** Bootstrap the two-feature OLS fit: one (β₁, β₂) pair per resample. */
export function bootstrapCoefs(X: Matrix, y: number[], reps: number, seed: number): XY[] {
  const random = seededRandom32(seed);
  const n = y.length;
  return Array.from({ length: reps }, () => {
    const idx = Array.from({ length: n }, () => Math.floor(random() * n));
    const m = fitOLS(rows(X, idx), rows(y, idx));
    return [m.coef[0], m.coef[1]] as XY;
  });
}

// --- Polynomial worlds for regularization and tuning ------------------------

/** sin(x) + noise on [0, 2π] — the same world as the 17_1_6 overfitting demo. */
export function wiggleWorld(n: number, noise: number, seed: number): XY[] {
  const random = seededRandom32(seed);
  return Array.from({ length: n }, (_, i) => {
    const x = ((i + 0.5) / n) * 2 * Math.PI + (random() - 0.5) * 0.08;
    return [x, Math.sin(x) + seededGaussian(random) * noise] as XY;
  });
}

/** x, x², …, x^d with x rescaled to [−1, 1] — a fixed formula, safe anywhere. */
export const polyRow = (x: number, degree: number): number[] => {
  const z = x / Math.PI - 1;
  return Array.from({ length: degree }, (_, i) => z ** (i + 1));
};

export interface PolyRidge {
  predict: (x: number) => number;
  /** Coefficients on the standardized polynomial columns. */
  coef: number[];
}

/** Polynomial features → StandardScaler → Ridge, fitted on the given points. */
export function fitPolyRidge(points: XY[], degree: number, alpha: number): PolyRidge {
  const X = points.map(([x]) => polyRow(x, degree));
  const y = points.map(([, y]) => y);
  const pipe = fitPipeline(X, y, (Xs, yy) => fitRidge(Xs, yy, alpha));
  return {
    predict: (x: number) => pipe.predict([polyRow(x, degree)])[0],
    coef: pipe.model.coef,
  };
}

export const polyMse = (model: PolyRidge, points: XY[]) =>
  mse(
    points.map(([, y]) => y),
    points.map(([x]) => model.predict(x))
  );

/** Log-spaced grid, like np.logspace(lo, hi, count). */
export const logspace = (lo: number, hi: number, count: number) =>
  Array.from({ length: count }, (_, i) => 10 ** (lo + ((hi - lo) * i) / (count - 1)));

/** Mean and per-fold validation MSE of a polynomial ridge at one alpha. */
export function cvPolyRidge(points: XY[], degree: number, alpha: number, folds: Fold[]) {
  const perFold = folds.map(({ train, test }) => polyMse(fitPolyRidge(rows(points, train), degree, alpha), rows(points, test)));
  return { mean: mean(perFold), perFold };
}

// --- Regression trees on one feature ----------------------------------------

export type TreeNode =
  | { leaf: true; value: number; n: number }
  | { leaf: false; threshold: number; left: TreeNode; right: TreeNode; n: number };

/** Within-group sum of squared deviations — 17_0's TSS, computed per group. */
const sse = (ys: number[]) => {
  const m = mean(ys);
  return ys.reduce((s, y) => s + (y - m) ** 2, 0);
};

/**
 * Every candidate split on x (midpoints between distinct sorted values) with
 * the total within-group SSE it would leave. The best split is the minimum.
 */
export function splitCurve(points: XY[], minLeaf = 1): { threshold: number; sse: number }[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0]);
  const n = sorted.length;
  const pre = [0];
  const pre2 = [0];
  for (const [, y] of sorted) {
    pre.push(pre[pre.length - 1] + y);
    pre2.push(pre2[pre2.length - 1] + y * y);
  }
  const out: { threshold: number; sse: number }[] = [];
  for (let i = minLeaf; i <= n - minLeaf; i++) {
    if (sorted[i - 1][0] === sorted[i]?.[0]) continue;
    if (i === n) break;
    const sL = pre[i];
    const sR = pre[n] - sL;
    const qL = pre2[i];
    const qR = pre2[n] - qL;
    const err = qL - (sL * sL) / i + qR - (sR * sR) / (n - i);
    out.push({ threshold: (sorted[i - 1][0] + sorted[i][0]) / 2, sse: err });
  }
  return out;
}

export function fitTree(points: XY[], maxDepth: number, minLeaf = 1): TreeNode {
  const value = mean(points.map(([, y]) => y));
  if (maxDepth <= 0 || points.length < 2 * minLeaf) return { leaf: true, value, n: points.length };
  const curve = splitCurve(points, minLeaf);
  if (curve.length === 0) return { leaf: true, value, n: points.length };
  const best = curve.reduce((a, b) => (b.sse < a.sse ? b : a));
  const left = points.filter(([x]) => x <= best.threshold);
  const right = points.filter(([x]) => x > best.threshold);
  return {
    leaf: false,
    threshold: best.threshold,
    n: points.length,
    left: fitTree(left, maxDepth - 1, minLeaf),
    right: fitTree(right, maxDepth - 1, minLeaf),
  };
}

export function predictTree(node: TreeNode, x: number): number {
  let cur = node;
  while (!cur.leaf) cur = x <= cur.threshold ? cur.left : cur.right;
  return cur.value;
}

export const countLeaves = (node: TreeNode): number =>
  node.leaf ? 1 : countLeaves(node.left) + countLeaves(node.right);

export function scoreFn(points: XY[], f: (x: number) => number): number {
  return r2Score(
    points.map(([, y]) => y),
    points.map(([x]) => f(x))
  );
}

/** Bagging: each tree sees a bootstrap resample of the training rows. */
export function fitForest(points: XY[], nTrees: number, maxDepth: number, seed: number): TreeNode[] {
  const random = seededRandom32(seed);
  const n = points.length;
  return Array.from({ length: nTrees }, () => {
    const sample = Array.from({ length: n }, () => points[Math.floor(random() * n)]);
    return fitTree(sample, maxDepth);
  });
}

export const predictForest = (trees: TreeNode[], x: number) =>
  trees.length ? mean(trees.map((t) => predictTree(t, x))) : 0;

/**
 * Gradient boosting with one-question trees (stumps): start at the mean, then
 * each round fits a stump to the current residuals and adds a shrunken copy.
 */
export function fitBoosting(points: XY[], rounds: number, learningRate: number) {
  const base = mean(points.map(([, y]) => y));
  const stumps: TreeNode[] = [];
  const current = points.map(() => base);
  for (let r = 0; r < rounds; r++) {
    const resid: XY[] = points.map(([x, y], i) => [x, y - current[i]]);
    const stump = fitTree(resid, 1);
    stumps.push(stump);
    points.forEach(([x], i) => {
      current[i] += learningRate * predictTree(stump, x);
    });
  }
  const predictAt = (x: number, upTo = stumps.length) => {
    let s = base;
    for (let r = 0; r < upTo; r++) s += learningRate * predictTree(stumps[r], x);
    return s;
  };
  return { base, stumps, predict: predictAt };
}

// --- Choosing on the test set ------------------------------------------------

/**
 * K models with identical true skill, each scored once on the same test set.
 * Returns how much better the best-looking one appears than it really is,
 * over many repeat studies.
 */
export function winnersCurse(k: number, trueMae: number, noiseSd: number, studies: number, seed: number) {
  const random = seededRandom32(seed);
  return Array.from({ length: studies }, () => {
    let best = Infinity;
    for (let i = 0; i < k; i++) best = Math.min(best, trueMae + seededGaussian(random) * noiseSd);
    return best;
  });
}

// --- Misc --------------------------------------------------------------------

export const standardizeColumns = (X: Matrix) => applyScaler(X, fitScaler(X));

export const fmtDollars = (v: number) =>
  `$${Math.round(v).toLocaleString('en-US')}`;
