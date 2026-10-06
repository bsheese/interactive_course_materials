import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { Callout, Legend, LegendItem, SectionLabel } from '../ui';

const RIDGE = '#1A1A1A';
const LASSO = '#E67E22';

/** Toy one-coefficient problem: cost(b) = (b − b̂)² + α·penalty(b). */
const ridgeSolution = (bHat: number, a: number) => bHat / (1 + a);
const lassoSolution = (bHat: number, a: number) => Math.sign(bHat) * Math.max(Math.abs(bHat) - a / 2, 0);

const range = (lo: number, hi: number, n = 160) => Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));

/**
 * Why the absolute-value penalty produces exact zeros and the squared one does
 * not, with a single coefficient. The squared tax is nearly free near zero,
 * so Ridge never finishes the job; the absolute tax charges full price for
 * every unit, so a weak feature is cheaper to drop than to keep.
 */
export const PenaltyShapeWidget: React.FC = () => {
  const [a, setA] = useState(1);
  const [bHat, setBHat] = useState(1);

  const r = ridgeSolution(bHat, a);
  const l = lassoSolution(bHat, a);
  const zeroAt = 2 * bHat;

  const alphas = range(0, 4);
  const bs = range(-0.6, 2.1);
  const ridgeCost = (b: number) => (b - bHat) ** 2 + a * b * b;
  const lassoCost = (b: number) => (b - bHat) ** 2 + a * Math.abs(b);

  return (
    <WidgetCard icon={Scissors} title="Squared Tax vs. Absolute Tax" subtitle="One coefficient, two penalties, the same α">
      <div className="grid grid-cols-2 gap-3">
        <Slider label="penalty strength α" value={a} min={0} max={4} step={0.05} onChange={setA} display={a.toFixed(2)} />
        <Slider
          label="unpenalized coefficient b̂"
          value={bHat}
          min={0.2}
          max={1.8}
          step={0.05}
          onChange={setBHat}
          display={bHat.toFixed(2)}
        />
      </div>

      <div>
        <SectionLabel>Where each penalty puts the coefficient, as α grows</SectionLabel>
        <ScatterPlot
          points={[
            { x: a, y: r, id: 'r', tone: 'default', radius: 4.5 },
            { x: a, y: l, id: 'l', tone: 'accent', radius: 4.5 },
          ]}
          curves={[
            { points: alphas.map((x) => [x, ridgeSolution(bHat, x)]), color: RIDGE, width: 2 },
            { points: alphas.map((x) => [x, lassoSolution(bHat, x)]), color: LASSO, width: 2 },
            { points: [[a, -0.1], [a, 1.9]], color: '#1A1A1A', dashed: true, width: 1 },
          ]}
          hLine={{ y: 0, color: '#767676' }}
          xDomain={[0, 4]}
          yDomain={[-0.1, 1.9]}
          xLabel="α"
          yLabel="fitted coefficient"
          formatX={(v) => v.toFixed(0)}
          formatY={(v) => v.toFixed(1)}
          height={185}
        />
        <Legend>
          <LegendItem color={RIDGE} shape="line">squared tax (Ridge): b̂ / (1 + α)</LegendItem>
          <LegendItem color={LASSO} shape="line">absolute tax (Lasso): b̂ − α/2, stopped at 0</LegendItem>
        </Legend>
      </div>

      <div>
        <SectionLabel>Total cost at this α: misfit plus tax. Each model sits at its minimum</SectionLabel>
        <ScatterPlot
          points={[
            { x: r, y: ridgeCost(r), id: 'rm', tone: 'default', radius: 4.5 },
            { x: l, y: lassoCost(l), id: 'lm', tone: 'accent', radius: 4.5 },
          ]}
          curves={[
            { points: bs.map((b) => [b, ridgeCost(b)]), color: RIDGE, width: 2 },
            { points: bs.map((b) => [b, lassoCost(b)]), color: LASSO, width: 2 },
            { points: [[0, 0], [0, 6]], color: '#767676', dashed: true, width: 1 },
          ]}
          xDomain={[-0.6, 2.1]}
          yDomain={[0, 5]}
          xLabel="coefficient b"
          yLabel="cost"
          formatX={(v) => v.toFixed(1)}
          formatY={(v) => v.toFixed(0)}
          height={175}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="Ridge coefficient" value={r.toFixed(3)} />
        <StatChip label="Lasso coefficient" value={l === 0 ? '0 — dropped' : l.toFixed(3)} tone={l === 0 ? 'accent' : 'neutral'} />
        <StatChip label="Lasso drops it at α =" value={zeroAt.toFixed(2)} />
      </div>

      <Callout>
        Look at the bottom chart near b = 0. The squared tax is flat there, so shaving the last bit
        off a small coefficient saves almost nothing, and Ridge never bothers: its coefficient
        approaches zero but never arrives. The absolute tax has a sharp corner at zero and charges
        the same α for every unit right down to the last one. Once α is more than twice what the
        feature is worth to the fit (here {zeroAt.toFixed(2)}), the cheapest place to stand is
        exactly at the corner, and the feature leaves the model.
      </Callout>
    </WidgetCard>
  );
};
