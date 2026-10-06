import React, { useMemo, useState } from 'react';
import { Hammer } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { fitBoosting, predictTree, scoreFn } from '../stats';
import { Legend, LegendItem, SectionLabel, Toggle, Callout } from '../ui';
import { TREE_TEST, TREE_TRAIN } from './TreeDepthWidget';

const MAX_ROUNDS = 200;
const XS = Array.from({ length: 500 }, (_, i) => 400 + (i / 499) * 3400);

/**
 * Gradient boosting with one-question trees. The top panel is the model so
 * far; the bottom panel is what it still gets wrong, with the next tree,
 * which is fitted to exactly those residuals.
 */
export const BoostingWidget: React.FC = () => {
  const [lr, setLr] = useState(0.1);
  const [rounds, setRounds] = useState(5);

  const boost = useMemo(() => fitBoosting(TREE_TRAIN, MAX_ROUNDS + 1, lr), [lr]);
  const f = (x: number) => boost.predict(x, rounds);
  const next = boost.stumps[rounds];
  const resid = TREE_TRAIN.map(([x, y]) => [x, y - f(x)] as [number, number]);

  const testCurve = useMemo(
    () =>
      Array.from({ length: 41 }, (_, i) => {
        const r = i * 5;
        return [r, scoreFn(TREE_TEST, (x) => boost.predict(x, r))] as [number, number];
      }),
    [boost]
  );

  const trainR2 = scoreFn(TREE_TRAIN, f);
  const testR2 = scoreFn(TREE_TEST, f);

  return (
    <WidgetCard
      icon={Hammer}
      title="Boosting: Each Tree Fixes the Last One’s Errors"
      subtitle="Ames · price from living area · one-question trees (stumps)"
      action={
        <Toggle
          options={[
            { value: 0.1, label: 'learning rate 0.1' },
            { value: 0.3, label: 'learning rate 0.3' },
            { value: 1, label: 'learning rate 1.0' },
          ]}
          value={lr}
          onChange={setLr}
        />
      }
    >
      <div>
        <SectionLabel>The model after {rounds} {rounds === 1 ? 'tree' : 'trees'}</SectionLabel>
        <ScatterPlot
          points={TREE_TRAIN.map(([x, y], i) => ({ x, y, id: i, tone: 'muted' as const, radius: 1.8 }))}
          curves={[{ points: XS.map((x) => [x, f(x)] as [number, number]), color: '#E67E22', width: 2.2 }]}
          xDomain={[400, 3800]}
          yDomain={[0, 650]}
          xLabel="above-ground living area (sq ft)"
          yLabel="price ($1,000s)"
          formatY={(v) => `${v}k`}
          height={175}
        />
      </div>

      <div>
        <SectionLabel>What it still gets wrong, and tree #{rounds + 1} fitted to exactly that</SectionLabel>
        <ScatterPlot
          points={resid.map(([x, y], i) => ({ x, y, id: i, tone: 'muted' as const, radius: 1.8 }))}
          curves={[
            { points: XS.map((x) => [x, predictTree(next, x)] as [number, number]), color: '#1A1A1A', width: 2.2 },
          ]}
          hLine={{ y: 0, color: '#767676' }}
          xDomain={[400, 3800]}
          yDomain={[-250, 350]}
          xLabel="above-ground living area (sq ft)"
          yLabel="residual ($1,000s)"
          formatY={(v) => `${v}k`}
          height={150}
        />
        <Legend>
          <LegendItem color="#B9B3A9">residual = actual − current prediction</LegendItem>
          <LegendItem color="#1A1A1A" shape="line">next tree (added × {lr})</LegendItem>
        </Legend>
      </div>

      <Slider label="trees added so far" value={rounds} min={0} max={MAX_ROUNDS} onChange={setRounds} display={String(rounds)} />

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="start (mean price)" value={`$${Math.round(boost.base)}k`} />
        <StatChip label="train R²" value={trainR2.toFixed(3)} />
        <StatChip label="test R²" value={testR2.toFixed(3)} tone="accent" />
      </div>

      <div>
        <SectionLabel>Test R² as trees are added</SectionLabel>
        <ScatterPlot
          points={[{ x: rounds, y: Math.max(-0.1, testR2), id: 'cur', tone: 'accent', radius: 4 }]}
          curves={[{ points: testCurve.map(([r, v]) => [r, Math.max(-0.1, v)]), color: '#E67E22', width: 2 }]}
          xDomain={[0, MAX_ROUNDS]}
          yDomain={[-0.1, 0.65]}
          xLabel="trees"
          yLabel="test R²"
          formatX={(v) => v.toFixed(0)}
          formatY={(v) => v.toFixed(1)}
          height={120}
        />
      </div>

      <Callout>
        Round 0 predicts the mean price for every house, so the residuals are just each house's
        distance from the mean. The next tree asks one question about those residuals and splits
        them into a mostly-negative group and a mostly-positive group. Adding a fraction of its
        answer moves the model toward the data, the residuals shrink, and the following tree works
        on whatever is left. A smaller learning rate takes smaller steps and needs more trees to get
        to the same place.
      </Callout>
    </WidgetCard>
  );
};
