import React, { useMemo, useState } from 'react';
import { Link2 } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { calculatePearsonsR } from '@kit/stats';
import { mean } from '../linalg';
import { bootstrapCoefs, twinFeatures } from '../stats';
import { ActionButton, Callout, Legend, LegendItem } from '../ui';

const RHOS = [0, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 0.98, 0.99];
const N = 100;
const REPS = 300;

const sd = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(mean(v.map((x) => (x - m) ** 2)));
};

/**
 * Multicollinearity as the bootstrap sees it. Two features that both matter
 * (true coefficients 1 and 1) are fitted together on resampled data; as their
 * correlation rises the individual coefficients smear out along a ridge while
 * their sum stays put.
 */
export const CollinearityWidget: React.FC = () => {
  const [step, setStep] = useState(5);
  const [seed, setSeed] = useState(4);
  const rho = RHOS[step];

  const { X, y } = useMemo(() => twinFeatures(rho, N, seed), [rho, seed]);
  const coefs = useMemo(() => bootstrapCoefs(X, y, REPS, seed + 50), [X, y, seed]);

  const r = calculatePearsonsR(X.map(([a, b]) => ({ x: a, y: b })));
  const vif = 1 / (1 - r * r);
  const b1 = coefs.map((c) => c[0]);
  const sums = coefs.map((c) => c[0] + c[1]);
  const flipped = coefs.filter(([a, b]) => a < 0 || b < 0).length / REPS;

  return (
    <WidgetCard
      icon={Link2}
      title="Two Features, One Signal"
      subtitle={`${N} rows · true coefficients β₁ = β₂ = 1 · ${REPS} bootstrap refits`}
      action={<ActionButton onClick={() => setSeed((s) => s + 1)}>New sample</ActionButton>}
    >
      <Slider
        label="correlation between the two features"
        value={step}
        min={0}
        max={RHOS.length - 1}
        onChange={setStep}
        display={`ρ = ${rho.toFixed(2)}`}
      />

      <ScatterPlot
        points={[
          ...coefs.map(([a, b], i) => ({ x: a, y: b, id: i, tone: 'muted' as const, radius: 2.2 })),
          { x: 1, y: 1, id: 'truth', tone: 'accent' as const, radius: 5 },
        ]}
        curves={[
          { points: [[-2, 4], [4, -2]], color: '#1A1A1A', dashed: true, width: 1 },
        ]}
        xDomain={[-2, 4]}
        yDomain={[-2, 4]}
        hLine={{ y: 0, color: '#767676' }}
        xLabel="β₁ (feature A's coefficient)"
        yLabel="β₂ (feature B's)"
        formatX={(v) => v.toFixed(0)}
        formatY={(v) => v.toFixed(0)}
        height={250}
      />
      <Legend>
        <LegendItem color="#B9B3A9">one bootstrap refit</LegendItem>
        <LegendItem color="#E67E22">the truth (1, 1)</LegendItem>
        <LegendItem color="#1A1A1A" shape="dash">β₁ + β₂ = 2</LegendItem>
      </Legend>

      <div className="grid grid-cols-2 gap-2">
        <StatChip label="VIF = 1 / (1 − r²)" value={vif.toFixed(1)} tone={vif > 10 ? 'bad' : vif > 5 ? 'accent' : 'good'} />
        <StatChip label="refits with a negative β" value={`${Math.round(flipped * 100)}%`} tone={flipped > 0.05 ? 'bad' : 'good'} />
        <StatChip label="spread of β₁ alone (SD)" value={sd(b1).toFixed(2)} />
        <StatChip label="spread of β₁ + β₂ (SD)" value={sd(sums).toFixed(2)} tone="good" />
      </div>

      <Callout>
        Each grey dot is the pair of coefficients from one resampled dataset. When the features are
        unrelated the dots form a tight round cloud around the truth. As the correlation rises, the
        cloud stretches along the dashed line: the data can tell how much the two features matter
        together, but not how to divide the credit between them, so a resample that gives A more
        gives B less. The sum stays stable throughout, which is why predictions barely change while
        the individual coefficients become unreadable.
      </Callout>
    </WidgetCard>
  );
};
