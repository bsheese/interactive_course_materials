import React, { useMemo, useState } from 'react';
import { Droplets } from 'lucide-react';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { mean } from '../linalg';
import { noiseWorld, selectionLeak } from '../stats';
import { ActionButton, Callout, Legend, LegendItem, SectionLabel } from '../ui';

const N_ROWS = 50;
const K = 10;
const COLUMN_STEPS = [10, 50, 100, 250, 500, 1000, 2000];
const REPEATS = 20;

/**
 * The leak with teeth: pick the 10 columns most correlated with the target,
 * out of hundreds of columns of pure noise, then cross-validate. Done before
 * the folds are drawn, the score says the noise predicts the target; done
 * inside each training fold, the score says what is true.
 */
export const SelectionLeakWidget: React.FC = () => {
  const [step, setStep] = useState(5);
  const [seed, setSeed] = useState(1);
  const p = COLUMN_STEPS[step];

  const result = useMemo(() => selectionLeak(noiseWorld(N_ROWS, p, seed), K, seed + 100), [p, seed]);

  // The same experiment on many fresh datasets, so one lucky draw cannot carry the lesson.
  const average = useMemo(() => {
    let leaky = 0;
    let honest = 0;
    for (let r = 0; r < REPEATS; r++) {
      const res = selectionLeak(noiseWorld(N_ROWS, p, 1000 + r), K, 2000 + r);
      leaky += mean(res.leaky) / REPEATS;
      honest += mean(res.honest) / REPEATS;
    }
    return { leaky, honest };
  }, [p]);

  const leakyMean = mean(result.leaky);
  const honestMean = mean(result.honest);

  // A shared R² axis for the fold dots.
  const W = 460;
  const lo = -2;
  const hi = 1;
  const sx = (v: number) => 92 + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (W - 110);
  const rowsDef = [
    { label: 'select, then CV', values: result.leaky, m: leakyMean, color: '#C0392B', y: 26 },
    { label: 'select inside CV', values: result.honest, m: honestMean, color: '#27AE60', y: 62 },
  ];

  return (
    <WidgetCard
      icon={Droplets}
      title="Selecting Features from Pure Noise"
      subtitle={`${N_ROWS} rows · ${p.toLocaleString()} columns of random numbers · keep the ${K} best`}
      action={<ActionButton onClick={() => setSeed((s) => s + 1)}>New random dataset</ActionButton>}
    >
      <Slider
        label="columns of noise to choose from"
        value={step}
        min={0}
        max={COLUMN_STEPS.length - 1}
        onChange={setStep}
        display={p.toLocaleString()}
      />

      <div>
        <SectionLabel>Cross-validated R² — five folds, one dot each</SectionLabel>
        <svg viewBox={`0 0 ${W} 96`} className="w-full" role="img" aria-label="Fold R squared, leaky versus honest">
          {[-2, -1.5, -1, -0.5, 0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={sx(t)} x2={sx(t)} y1={8} y2={78} stroke="#1A1A1A" strokeOpacity={t === 0 ? 0.35 : 0.07} />
              <text x={sx(t)} y={90} textAnchor="middle" className="fill-[#767676]" style={{ fontSize: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                {t}
              </text>
            </g>
          ))}
          {rowsDef.map((r) => (
            <g key={r.label}>
              <text x={86} y={r.y + 3} textAnchor="end" className="fill-[#333333]" style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
                {r.label}
              </text>
              {r.values.map((v, i) => (
                <circle key={i} cx={sx(v)} cy={r.y} r={3.6} fill={r.color} fillOpacity={0.55} />
              ))}
              <line x1={sx(r.m)} x2={sx(r.m)} y1={r.y - 9} y2={r.y + 9} stroke={r.color} strokeWidth={2.4} />
            </g>
          ))}
        </svg>
        <Legend>
          <LegendItem color="#767676" shape="line">0 = no better than predicting the mean</LegendItem>
          <LegendItem color="#1A1A1A" shape="line">thick tick = mean of the five folds</LegendItem>
        </Legend>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatChip label="select, then CV" value={leakyMean.toFixed(2)} tone="bad" />
        <StatChip label="select inside each fold" value={honestMean.toFixed(2)} tone="good" />
        <StatChip label={`average of ${REPEATS} datasets`} value={average.leaky.toFixed(2)} tone="bad" />
        <StatChip label={`average of ${REPEATS} datasets`} value={average.honest.toFixed(2)} tone="good" />
      </div>

      <Callout>
        Every number in this dataset is random, so the true R² of any model is zero or worse. The
        left-hand procedure looked at all {N_ROWS} targets to choose its {K} columns, including the
        rows that later served as validation folds. Those columns were chosen <em>because</em> they
        happen to line up with those very rows, so the validation score rewards a coincidence it
        helped create. Moving the selection inside each training fold removes the coincidence, and
        the score falls to where it belongs.
      </Callout>
    </WidgetCard>
  );
};
