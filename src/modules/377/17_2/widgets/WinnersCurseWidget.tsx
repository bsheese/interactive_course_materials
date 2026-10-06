import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Histogram } from '@kit/components/Histogram';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { seededGaussian, seededRandom32 } from '@kit/stats';
import { mean } from '../linalg';
import { winnersCurse } from '../stats';
import { ActionButton, Callout, SectionLabel } from '../ui';

const TRUE_MAE = 13000;
/** Roughly how much one MAE wobbles from one 585-house test set to another. */
const NOISE = 400;
const STUDIES = 2000;
const K_STEPS = [1, 2, 3, 5, 10, 20, 50, 100];

const dollars = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

/**
 * Why consulting the test set to choose a model inflates the winner's score.
 * Every model here is equally good by construction; the only thing that
 * differs between them is test-set luck, and picking the best picks the luck.
 */
export const WinnersCurseWidget: React.FC = () => {
  const [step, setStep] = useState(2);
  const [seed, setSeed] = useState(1);
  const k = K_STEPS[step];

  // One study: k models, one shared test set, one winner.
  const study = useMemo(() => {
    const random = seededRandom32(seed * 7919 + k);
    return Array.from({ length: k }, () => TRUE_MAE + seededGaussian(random) * NOISE);
  }, [k, seed]);
  const winner = Math.min(...study);

  const winners = useMemo(() => winnersCurse(k, TRUE_MAE, NOISE, STUDIES, 99 + k), [k]);
  const avgWinner = mean(winners);

  const W = 460;
  const lo = TRUE_MAE - 4 * NOISE;
  const hi = TRUE_MAE + 4 * NOISE;
  const sx = (v: number) => 20 + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (W - 40);

  return (
    <WidgetCard
      icon={Trophy}
      title="Picking the Winner on the Test Set"
      subtitle={`Every model's true error is ${dollars(TRUE_MAE)} · test-set luck ≈ ±${dollars(NOISE)}`}
      action={<ActionButton onClick={() => setSeed((s) => s + 1)}>Run another study</ActionButton>}
    >
      <Slider
        label="models compared on the same test set"
        value={step}
        min={0}
        max={K_STEPS.length - 1}
        onChange={setStep}
        display={String(k)}
      />

      <div>
        <SectionLabel>One study: each model's measured test MAE</SectionLabel>
        <svg viewBox={`0 0 ${W} 58`} className="w-full" role="img" aria-label="Measured test errors">
          <line x1={20} x2={W - 20} y1={24} y2={24} stroke="#1A1A1A" strokeOpacity={0.12} />
          <line x1={sx(TRUE_MAE)} x2={sx(TRUE_MAE)} y1={6} y2={42} stroke="#27AE60" strokeWidth={1.6} strokeDasharray="3 3" />
          {study.map((v, i) => (
            <circle key={i} cx={sx(v)} cy={24} r={v === winner ? 6 : 3.5} fill={v === winner ? '#E67E22' : '#B9B3A9'} fillOpacity={v === winner ? 1 : 0.7} />
          ))}
          {[lo, TRUE_MAE, hi].map((t) => (
            <text key={t} x={sx(t)} y={54} textAnchor="middle" className="fill-[#767676]" style={{ fontSize: 8.5, fontFamily: 'JetBrains Mono, monospace' }}>
              {dollars(t)}
            </text>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatChip label="the winner reports" value={dollars(winner)} tone="accent" />
        <StatChip label="its real error" value={dollars(TRUE_MAE)} tone="good" />
      </div>

      <div>
        <SectionLabel>The winner's reported error across {STUDIES.toLocaleString()} studies</SectionLabel>
        <Histogram
          values={winners}
          domain={[lo, hi]}
          xLabel="reported MAE of the winner (orange = average, green dashed = truth)"
          markers={[
            { value: TRUE_MAE, color: '#27AE60', dashed: true },
            { value: avgWinner, color: '#E67E22' },
          ]}
          formatX={(v) => `${Math.round(v / 1000)}k`}
          height={140}
          barColor="#B9B3A9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatChip label="average reported" value={dollars(avgWinner)} tone="accent" />
        <StatChip label="optimism" value={dollars(TRUE_MAE - avgWinner)} tone={k > 1 ? 'bad' : 'good'} />
      </div>

      <Callout>
        With one model there is nothing to choose, and the test score is honest: it lands above the
        truth as often as below. With several, the winner is whichever got the luckiest test set
        draw, so its score is systematically too good. Three models (Ridge, Lasso, Elastic Net)
        inflate it a little; a hundred values of α compared on the test set inflate it a lot. None of
        these models is better than the others. Only the luck differs.
      </Callout>
    </WidgetCard>
  );
};
