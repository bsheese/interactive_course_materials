import React, { useMemo, useState } from 'react';
import { Network } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { rows, trainTestIndices } from '../linalg';
import { AMES_AREA_PRICE, type TreeNode, countLeaves, fitTree, predictTree, scoreFn } from '../stats';
import { Legend, LegendItem, SectionLabel, Callout } from '../ui';

const MAX_DEPTH = 16;
const XS = Array.from({ length: 600 }, (_, i) => 400 + (i / 599) * 3400);

export const AMES_TREE_SPLIT = trainTestIndices(AMES_AREA_PRICE.length, 0.3, 1);
export const TREE_TRAIN = rows(AMES_AREA_PRICE, AMES_TREE_SPLIT.train);
export const TREE_TEST = rows(AMES_AREA_PRICE, AMES_TREE_SPLIT.test);

const smallestLeaf = (node: TreeNode): number =>
  node.leaf ? node.n : Math.min(smallestLeaf(node.left), smallestLeaf(node.right));

/**
 * Depth as the tree's complexity dial: the same train-climbs, test-peaks
 * picture as polynomial degree and α, now as a staircase that gets finer.
 */
export const TreeDepthWidget: React.FC = () => {
  const [depth, setDepth] = useState(3);

  const sweep = useMemo(
    () =>
      Array.from({ length: MAX_DEPTH }, (_, i) => {
        const tree = fitTree(TREE_TRAIN, i + 1);
        const f = (x: number) => predictTree(tree, x);
        return { depth: i + 1, tree, train: scoreFn(TREE_TRAIN, f), test: scoreFn(TREE_TEST, f) };
      }),
    []
  );

  const cur = sweep[depth - 1];
  const bestDepth = sweep.reduce((a, b) => (b.test > a.test ? b : a)).depth;
  const curve = XS.map((x) => [x, predictTree(cur.tree, x)] as [number, number]);
  const label = depth === MAX_DEPTH ? `${depth} (≈ no limit)` : String(depth);

  return (
    <WidgetCard
      icon={Network}
      title="How Many Questions?"
      subtitle={`Ames · price from living area · ${TREE_TRAIN.length} train / ${TREE_TEST.length} test`}
    >
      <ScatterPlot
        points={[
          ...TREE_TRAIN.map(([x, y], i) => ({ x, y, id: `tr${i}`, tone: 'muted' as const, radius: 2 })),
          ...TREE_TEST.map(([x, y], i) => ({ x, y, id: `te${i}`, tone: 'accent' as const, radius: 2.4 })),
        ]}
        curves={[{ points: curve, color: '#1A1A1A', width: 1.8 }]}
        xDomain={[400, 3800]}
        yDomain={[0, 650]}
        xLabel="above-ground living area (sq ft)"
        yLabel="sale price ($1,000s)"
        formatY={(v) => `${v}k`}
        height={205}
      />
      <Legend>
        <LegendItem color="#B9B3A9">training houses</LegendItem>
        <LegendItem color="#E67E22">test houses</LegendItem>
        <LegendItem color="#1A1A1A" shape="line">the tree’s predictions</LegendItem>
      </Legend>

      <Slider label="max_depth" value={depth} min={1} max={MAX_DEPTH} onChange={setDepth} display={label} />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip label="leaves" value={String(countLeaves(cur.tree))} />
        <StatChip label="smallest leaf" value={`${smallestLeaf(cur.tree)} house${smallestLeaf(cur.tree) === 1 ? '' : 's'}`} tone={smallestLeaf(cur.tree) < 5 ? 'bad' : 'neutral'} />
        <StatChip label="train R²" value={cur.train.toFixed(3)} />
        <StatChip label="test R²" value={cur.test.toFixed(3)} tone={depth === bestDepth ? 'good' : 'accent'} />
      </div>

      <div>
        <SectionLabel>R² against depth</SectionLabel>
        <ScatterPlot
          points={[{ x: depth, y: cur.test, id: 'cur', tone: 'accent', radius: 4.5 }]}
          curves={[
            { points: sweep.map((s) => [s.depth, s.train]), color: '#767676', width: 1.8 },
            { points: sweep.map((s) => [s.depth, s.test]), color: '#E67E22', width: 2.2 },
          ]}
          xDomain={[1, MAX_DEPTH]}
          yDomain={[0.2, 1]}
          xLabel="max_depth"
          yLabel="R²"
          formatX={(v) => v.toFixed(0)}
          formatY={(v) => v.toFixed(1)}
          height={140}
        />
        <Legend>
          <LegendItem color="#767676" shape="line">train</LegendItem>
          <LegendItem color="#E67E22" shape="line">test (best at depth {bestDepth})</LegendItem>
        </Legend>
      </div>

      <Callout>
        Depth 1 is the single question from the previous slide: two leaves, two prices. Each extra
        level lets every leaf ask one more question, so the number of leaves can double. By depth 10
        or so, many leaves hold one or two houses, and a leaf with one house simply predicts that
        house's price. Training R² heads for 1 while test R² falls. Nothing about this is specific to
        trees; it is the polynomial-degree picture from 17_1_6, with depth as the dial.
      </Callout>
    </WidgetCard>
  );
};
