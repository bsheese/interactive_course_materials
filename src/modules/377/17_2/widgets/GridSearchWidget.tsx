import React, { useMemo, useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { kFold } from '../linalg';
import { cvPolyRidge, fitPolyRidge, logspace, polyMse, wiggleWorld } from '../stats';
import { Callout, Legend, LegendItem, SectionLabel } from '../ui';
import { POLY_DEGREE, POLY_N, POLY_NOISE, POLY_SEED, fmtAlpha } from './CoefficientTaxWidget';

const GRID = logspace(-8, 2, 21);
const LOG_GRID = GRID.map(Math.log10);
const XS = Array.from({ length: 200 }, (_, i) => (i / 199) * 2 * Math.PI);
// Clamped to the plot so a wild fold stays on screen at the edge.
const log10 = (v: number) => Math.min(1.15, Math.max(-1.55, Math.log10(v)));

/**
 * Grid search drawn by hand: for every α on the grid, the training error and
 * the 5-fold validation error. Training error always prefers the smallest α;
 * only held-out folds can see where the penalty starts to help.
 */
export const GridSearchWidget: React.FC = () => {
  const [idx, setIdx] = useState(4);

  const data = useMemo(() => wiggleWorld(POLY_N, POLY_NOISE, POLY_SEED), []);
  const folds = useMemo(() => kFold(POLY_N, 5, 1), []);

  const sweep = useMemo(
    () =>
      GRID.map((a) => {
        const cv = cvPolyRidge(data, POLY_DEGREE, a, folds);
        return { a, train: polyMse(fitPolyRidge(data, POLY_DEGREE, a), data), cv: cv.mean, perFold: cv.perFold };
      }),
    [data, folds]
  );

  const bestIdx = sweep.reduce((b, s, i) => (s.cv < sweep[b].cv ? i : b), 0);
  const cur = sweep[idx];
  const model = useMemo(() => fitPolyRidge(data, POLY_DEGREE, GRID[idx]), [data, idx]);

  return (
    <WidgetCard
      icon={Grid3x3}
      title="A Validation Curve, Point by Point"
      subtitle={`${GRID.length} values of α · 5-fold CV · ${GRID.length * 5} model fits`}
    >
      <div>
        <SectionLabel>Error against α (both axes on a log scale)</SectionLabel>
        <ScatterPlot
          points={[
            ...cur.perFold.map((v, i) => ({ x: LOG_GRID[idx], y: log10(v), id: `f${i}`, tone: 'muted' as const, radius: 3 })),
            { x: LOG_GRID[bestIdx], y: log10(sweep[bestIdx].cv), id: 'best', tone: 'good' as const, radius: 5 },
            { x: LOG_GRID[idx], y: log10(cur.cv), id: 'cur', tone: 'accent' as const, radius: 4.5 },
          ]}
          curves={[
            { points: sweep.map((s, i) => [LOG_GRID[i], log10(s.train)]), color: '#767676', width: 1.8 },
            { points: sweep.map((s, i) => [LOG_GRID[i], log10(s.cv)]), color: '#E67E22', width: 2.2 },
          ]}
          xDomain={[-8.3, 2.3]}
          yDomain={[-1.6, 1.2]}
          xLabel="α"
          yLabel="mean squared error"
          formatX={(v) => `1e${Number(v.toFixed(1))}`}
          formatY={(v) => String(Number((10 ** v).toPrecision(1)))}
          height={200}
        />
        <Legend>
          <LegendItem color="#767676" shape="line">training error</LegendItem>
          <LegendItem color="#E67E22" shape="line">5-fold validation error</LegendItem>
          <LegendItem color="#B9B3A9">the five folds at this α</LegendItem>
          <LegendItem color="#27AE60">grid search’s pick</LegendItem>
        </Legend>
      </div>

      <Slider
        label="step along the grid"
        value={idx}
        min={0}
        max={GRID.length - 1}
        onChange={setIdx}
        display={`α = ${fmtAlpha(LOG_GRID[idx])}`}
      />

      <ScatterPlot
        points={data.map(([x, y], i) => ({ x, y, id: i }))}
        curves={[
          { points: XS.map((x) => [x, Math.sin(x)]), color: '#27AE60', dashed: true, width: 1.4 },
          { points: XS.map((x) => [x, model.predict(x)]), color: '#E67E22', width: 2 },
        ]}
        xDomain={[0, 2 * Math.PI]}
        yDomain={[-2.2, 2.2]}
        xLabel="x"
        yLabel="y"
        height={150}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="training MSE" value={cur.train.toFixed(3)} />
        <StatChip label="validation MSE" value={cur.cv.toFixed(3)} tone="accent" />
        <StatChip label="best α on the grid" value={fmtAlpha(LOG_GRID[bestIdx])} tone="good" />
      </div>

      <Callout>
        The grey curve keeps falling as α shrinks: asked which penalty it prefers, the training
        data always answers “none”, because any penalty makes the fit to those same points worse.
        The orange curve is computed on rows each fit did not see, and it is U-shaped. Its left arm
        is overfitting, its right arm is underfitting, and the bottom is the α that GridSearchCV
        would choose and then refit on all the training data.
      </Callout>
    </WidgetCard>
  );
};
