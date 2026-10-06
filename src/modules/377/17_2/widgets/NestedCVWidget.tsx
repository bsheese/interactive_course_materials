import React, { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { kFold, mean, rows } from '../linalg';
import { cvPolyRidge, fitPolyRidge, logspace, polyMse, wiggleWorld } from '../stats';
import { ActionButton, Callout, Legend, LegendItem, SectionLabel } from '../ui';
import { POLY_DEGREE, POLY_NOISE, fmtAlpha } from './CoefficientTaxWidget';

const N = 40;
const GRID = logspace(-8, 2, 21);
const LOG_GRID = GRID.map(Math.log10);
const clampLog = (v: number) => Math.min(1.15, Math.max(-1.55, Math.log10(v)));

/**
 * Nested cross-validation, one outer fold at a time. The inner loop is an
 * ordinary grid search that only ever sees the outer fold's training rows;
 * the outer fold is opened once, to score whatever the inner loop chose.
 */
export const NestedCVWidget: React.FC = () => {
  const [active, setActive] = useState(0);

  const data = useMemo(() => wiggleWorld(N, POLY_NOISE, 2), []);
  const order = useMemo(() => data.map((_, i) => i).sort((a, b) => data[a][0] - data[b][0]), [data]);
  const outer = useMemo(() => kFold(N, 5, 26), []);

  const results = useMemo(
    () =>
      outer.map((fold, f) => {
        const trainPts = rows(data, fold.train);
        const inner = kFold(trainPts.length, 5, 100 + f);
        const curve = GRID.map((a) => cvPolyRidge(trainPts, POLY_DEGREE, a, inner).mean);
        const best = curve.reduce((b, v, i) => (v < curve[b] ? i : b), 0);
        const model = fitPolyRidge(trainPts, POLY_DEGREE, GRID[best]);
        return { curve, best, outerMse: polyMse(model, rows(data, fold.test)) };
      }),
    [data, outer]
  );

  const r = results[active];
  const testSet = new Set(outer[active].test);
  const nested = mean(results.map((x) => x.outerMse));

  return (
    <WidgetCard
      icon={Layers}
      title="Nested Cross-Validation, Step by Step"
      subtitle={`${N} points · degree-${POLY_DEGREE} Ridge · 5 outer folds × 5 inner folds × ${GRID.length} alphas`}
      action={<ActionButton onClick={() => setActive((a) => (a + 1) % 5)}>Next outer fold</ActionButton>}
    >
      <div>
        <SectionLabel>The outer loop: each row is one outer fold (points ordered by x)</SectionLabel>
        <div className="mt-1 space-y-1">
          {outer.map((fold, f) => {
            const held = new Set(fold.test);
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`w-full flex items-center gap-2 px-1 py-0.5 rounded-xs border transition-colors ${
                  f === active ? 'border-[#1A1A1A]/50 bg-[#F5F2ED]' : 'border-transparent hover:border-[#1A1A1A]/15'
                }`}
              >
                <span className="text-[10px] font-mono text-[#4A4A4A] w-14 text-left shrink-0">fold {f + 1}</span>
                <span className="flex gap-[2px] flex-1">
                  {order.map((i) => (
                    <span key={i} className="h-3 flex-1 rounded-[1px]" style={{ background: held.has(i) ? '#E67E22' : '#D9D4CC' }} />
                  ))}
                </span>
                <span className="text-[10px] font-mono text-[#4A4A4A] w-32 text-right shrink-0">
                  α = {fmtAlpha(LOG_GRID[results[f].best])} · MSE {results[f].outerMse.toFixed(3)}
                </span>
              </button>
            );
          })}
        </div>
        <Legend>
          <LegendItem color="#D9D4CC">outer training rows (the inner loop works here)</LegendItem>
          <LegendItem color="#E67E22">outer test rows (locked until the end)</LegendItem>
        </Legend>
      </div>

      <div>
        <SectionLabel>
          Fold {active + 1}, inner loop: a grid search on its {N - testSet.size} training rows only
        </SectionLabel>
        <ScatterPlot
          points={[{ x: LOG_GRID[r.best], y: clampLog(r.curve[r.best]), id: 'best', tone: 'good', radius: 5 }]}
          curves={[{ points: r.curve.map((v, i) => [LOG_GRID[i], clampLog(v)]), color: '#E67E22', width: 2 }]}
          xDomain={[-8.3, 2.3]}
          yDomain={[-1.6, 1.2]}
          xLabel="α"
          yLabel="inner validation MSE"
          formatX={(v) => `1e${Number(v.toFixed(1))}`}
          formatY={(v) => String(Number((10 ** v).toPrecision(1)))}
          height={160}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label={`fold ${active + 1}: inner loop chose`} value={`α = ${fmtAlpha(LOG_GRID[r.best])}`} tone="good" />
        <StatChip label={`fold ${active + 1}: outer score`} value={r.outerMse.toFixed(3)} tone="accent" />
        <StatChip label="nested CV estimate" value={nested.toFixed(3)} />
      </div>

      <Callout>
        Step through the folds and watch two things. First, the chosen α changes from fold to fold,
        because each inner loop sees a slightly different set of rows. That is expected, and it is
        why the result of nested CV is a number, not a model. Second, the orange rows of each fold
        play no part in its inner loop: they are opened once, after α has been chosen, to score it.
        The average of the five outer scores is an estimate of how the whole procedure, tuning
        included, performs on data it has never seen.
      </Callout>
    </WidgetCard>
  );
};
