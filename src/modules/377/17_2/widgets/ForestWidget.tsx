import React, { useMemo, useState } from 'react';
import { Trees } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { fitForest, fitTree, predictForest, predictTree, scoreFn } from '../stats';
import { Callout, Legend, LegendItem, SectionLabel } from '../ui';
import { TREE_TEST, TREE_TRAIN } from './TreeDepthWidget';

const TREE_COUNTS = [1, 2, 5, 10, 25, 50, 100];
const MAX_DEPTH = 16;
const SWEEP_TREES = 20;
const XS = Array.from({ length: 500 }, (_, i) => 400 + (i / 499) * 3400);

/**
 * Bagging: many trees, each grown on a bootstrap resample, averaged. Each
 * deep tree is jagged in its own way; the average of their staircases is far
 * steadier than any one of them.
 */
export const ForestWidget: React.FC = () => {
  const [countStep, setCountStep] = useState(4);
  const [depth, setDepth] = useState(MAX_DEPTH);
  const nTrees = TREE_COUNTS[countStep];

  const forest = useMemo(() => fitForest(TREE_TRAIN, 100, depth, 7), [depth]);
  const used = forest.slice(0, nTrees);
  const single = useMemo(() => fitTree(TREE_TRAIN, depth), [depth]);

  const forestTest = scoreFn(TREE_TEST, (x) => predictForest(used, x));
  const singleTest = scoreFn(TREE_TEST, (x) => predictTree(single, x));

  // Test R² by depth for one tree and for a small forest: the forest flattens the cliff.
  const sweep = useMemo(
    () =>
      Array.from({ length: MAX_DEPTH }, (_, i) => {
        const d = i + 1;
        const t = fitTree(TREE_TRAIN, d);
        const f = fitForest(TREE_TRAIN, SWEEP_TREES, d, 11);
        return {
          d,
          single: scoreFn(TREE_TEST, (x) => predictTree(t, x)),
          forest: scoreFn(TREE_TEST, (x) => predictForest(f, x)),
        };
      }),
    []
  );

  const shown = used.slice(0, 4);

  return (
    <WidgetCard
      icon={Trees}
      title="Averaging Many Trees"
      subtitle={`Ames · price from living area · each tree grown on a bootstrap resample`}
    >
      <ScatterPlot
        points={TREE_TRAIN.map(([x, y], i) => ({ x, y, id: i, tone: 'muted' as const, radius: 1.8 }))}
        curves={[
          ...shown.map((t) => ({
            points: XS.map((x) => [x, predictTree(t, x)] as [number, number]),
            color: '#2C7FB8',
            width: 0.8,
          })),
          { points: XS.map((x) => [x, predictForest(used, x)] as [number, number]), color: '#E67E22', width: 2.4 },
        ]}
        xDomain={[400, 3800]}
        yDomain={[0, 650]}
        xLabel="above-ground living area (sq ft)"
        yLabel="sale price ($1,000s)"
        formatY={(v) => `${v}k`}
        height={205}
      />
      <Legend>
        <LegendItem color="#2C7FB8" shape="line">individual trees (up to four shown)</LegendItem>
        <LegendItem color="#E67E22" shape="line">the forest: their average</LegendItem>
      </Legend>

      <div className="grid grid-cols-2 gap-3">
        <Slider
          label="trees in the forest"
          value={countStep}
          min={0}
          max={TREE_COUNTS.length - 1}
          onChange={setCountStep}
          display={String(nTrees)}
        />
        <Slider
          label="max_depth of each tree"
          value={depth}
          min={1}
          max={MAX_DEPTH}
          onChange={setDepth}
          display={depth === MAX_DEPTH ? `${depth} (≈ none)` : String(depth)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatChip label="one tree, test R²" value={singleTest.toFixed(3)} />
        <StatChip label={`forest of ${nTrees}, test R²`} value={forestTest.toFixed(3)} tone={forestTest > singleTest ? 'good' : 'neutral'} />
      </div>

      <div>
        <SectionLabel>Test R² by depth: one tree against a forest of {SWEEP_TREES}</SectionLabel>
        <ScatterPlot
          points={[]}
          curves={[
            { points: sweep.map((s) => [s.d, s.single]), color: '#767676', width: 1.8 },
            { points: sweep.map((s) => [s.d, s.forest]), color: '#E67E22', width: 2.2 },
            { points: [[depth, 0.2], [depth, 0.6]], color: '#1A1A1A', dashed: true, width: 1 },
          ]}
          xDomain={[1, MAX_DEPTH]}
          yDomain={[0.2, 0.6]}
          xLabel="max_depth"
          yLabel="test R²"
          formatX={(v) => v.toFixed(0)}
          formatY={(v) => v.toFixed(1)}
          height={135}
        />
        <Legend>
          <LegendItem color="#767676" shape="line">one tree</LegendItem>
          <LegendItem color="#E67E22" shape="line">forest</LegendItem>
        </Legend>
      </div>

      <Callout>
        A fully grown tree memorises its own resample, so each blue staircase is wrong in its own
        particular places. Because the resamples differ, so do the mistakes, and averaging lets them
        cancel. For shallow trees, which make the same mistakes on every resample, the forest and
        the single tree score about the same. The deeper and noisier the trees, the bigger the
        rescue. What averaging cannot do is add knowledge the trees lack: with only one feature to
        work with, the forest levels off near the best a single pruned tree can do.
      </Callout>
    </WidgetCard>
  );
};
