import React, { useMemo, useState } from 'react';
import { GitFork } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { mean } from '../linalg';
import { AMES_AREA_PRICE, splitCurve } from '../stats';
import { ActionButton, Callout, Legend, LegendItem, SectionLabel } from '../ui';

const PTS = AMES_AREA_PRICE;
const X_LO = 400;
const X_HI = 3800;

const groupSse = (ys: number[]) => {
  const m = mean(ys);
  return ys.reduce((s, y) => s + (y - m) ** 2, 0);
};

/**
 * The one move a regression tree makes, done by hand: choose a threshold,
 * predict each side's mean, and add up the squared errors. The algorithm just
 * tries every threshold and keeps the lowest total.
 */
export const TreeSplitWidget: React.FC = () => {
  const [t, setT] = useState(1200);

  const curve = useMemo(() => splitCurve(PTS), []);
  const best = curve.reduce((a, b) => (b.sse < a.sse ? b : a));
  const tss = useMemo(() => groupSse(PTS.map((p) => p[1])), []);

  const left = PTS.filter(([x]) => x <= t).map((p) => p[1]);
  const right = PTS.filter(([x]) => x > t).map((p) => p[1]);
  const mL = mean(left);
  const mR = mean(right);
  const sse = groupSse(left) + groupSse(right);
  const scale = 1e6; // SSE in ($1,000s)² is in the millions; show it in millions.

  return (
    <WidgetCard
      icon={GitFork}
      title="Choosing One Question"
      subtitle={`Ames · ${PTS.length} houses · “Is Gr Liv Area ≤ ${Math.round(t).toLocaleString()} sq ft?”`}
      action={<ActionButton onClick={() => setT(Math.round(best.threshold))}>Jump to the best split</ActionButton>}
    >
      <ScatterPlot
        points={PTS.map(([x, y], i) => ({ x, y, id: i, tone: x <= t ? ('muted' as const) : ('default' as const), radius: 2.2 }))}
        curves={[
          { points: [[X_LO, mL], [t, mL]], color: '#E67E22', width: 3 },
          { points: [[t, mR], [X_HI, mR]], color: '#E67E22', width: 3 },
          { points: [[t, 0], [t, 650]], color: '#C0392B', dashed: true, width: 1.2 },
        ]}
        xDomain={[X_LO, X_HI]}
        yDomain={[0, 650]}
        xLabel="above-ground living area (sq ft)"
        yLabel="sale price ($1,000s)"
        formatY={(v) => `${v}k`}
        height={210}
      />
      <Legend>
        <LegendItem color="#B9B3A9">answer “yes”: left leaf</LegendItem>
        <LegendItem color="#1A1A1A">answer “no”: right leaf</LegendItem>
        <LegendItem color="#E67E22" shape="line">each leaf predicts its mean</LegendItem>
      </Legend>

      <Slider
        label="threshold"
        value={t}
        min={X_LO + 200}
        max={X_HI - 400}
        step={10}
        onChange={setT}
        display={`${Math.round(t).toLocaleString()} sq ft`}
      />

      <div className="grid grid-cols-2 gap-2">
        <StatChip label={`left leaf (${left.length} houses)`} value={`predicts $${Math.round(mL)}k`} />
        <StatChip label={`right leaf (${right.length} houses)`} value={`predicts $${Math.round(mR)}k`} />
        <StatChip label="squared error left after split" value={`${(sse / scale).toFixed(2)} M`} tone={Math.abs(t - best.threshold) < 15 ? 'good' : 'neutral'} />
        <StatChip label="share of TSS removed (R²)" value={(1 - sse / tss).toFixed(3)} tone="accent" />
      </div>

      <div>
        <SectionLabel>Total squared error for every possible threshold</SectionLabel>
        <ScatterPlot
          points={[
            { x: best.threshold, y: best.sse / scale, id: 'best', tone: 'good', radius: 5 },
            { x: t, y: sse / scale, id: 'cur', tone: 'accent', radius: 4.5 },
          ]}
          curves={[{ points: curve.map((c) => [c.threshold, c.sse / scale] as [number, number]), color: '#1A1A1A', width: 1.6 }]}
          hLine={{ y: tss / scale, color: '#767676', dashed: true, label: 'no split (TSS)' }}
          xDomain={[X_LO, X_HI]}
          yDomain={[3.8, 6.5]}
          xLabel="threshold (sq ft)"
          yLabel="error (millions)"
          formatY={(v) => v.toFixed(1)}
          height={150}
        />
      </div>

      <Callout>
        The dashed line is the error with no question at all, where every house is predicted at the
        overall mean: that is the TSS from 17_0. Each threshold splits the houses into two groups and
        predicts each group's own mean, and what remains is the sum of the two groups' squared
        deviations. The green dot is the lowest point on the curve, at about{' '}
        {Math.round(best.threshold).toLocaleString()} sq ft. That is the question a tree would ask
        first. It then asks the same thing again inside each group.
      </Callout>
    </WidgetCard>
  );
};
