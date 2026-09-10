import React, { useMemo, useState } from 'react';
import { Repeat } from 'lucide-react';
import { Histogram } from '@kit/components/Histogram';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { calculateStandardDeviation } from '@kit/stats';
import { PENGUINS } from '../data';
import { bootstrapSlopes, fit } from '../stats';

const REP_CHOICES = [100, 500, 2000];

/**
 * The standard error, built rather than quoted: resample pairs with
 * replacement, refit, and take the spread of the resulting slopes. It lands on
 * the classical formula's answer without ever using the formula.
 */
export const BootstrapSlopeWidget: React.FC = () => {
  const [reps, setReps] = useState(500);

  const observed = useMemo(() => fit(PENGUINS), []);
  const slopes = useMemo(() => bootstrapSlopes(PENGUINS, reps), [reps]);

  const bootSE = calculateStandardDeviation(slopes, true);
  const agreement = (bootSE / observed.seSlope) * 100;

  return (
    <WidgetCard
      icon={Repeat}
      title="How Much Would the Slope Wiggle?"
      subtitle="Resample the 333 penguins with replacement, refit, repeat"
      action={
        <div className="flex items-center gap-1 text-[11px] font-sans">
          {REP_CHOICES.map((choice) => (
            <button
              key={choice}
              onClick={() => setReps(choice)}
              className={`px-2 py-0.5 rounded-xs border transition-colors ${
                reps === choice
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                  : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      }
    >
      <Histogram
        values={slopes}
        xLabel="bootstrap slope (g per mm)"
        markers={[
          { value: observed.slope, color: '#E67E22', label: 'observed' },
        ]}
        formatX={(v) => v.toFixed(1)}
        height={200}
      />

      <div className="grid grid-cols-2 gap-2">
        <StatChip
          label="bootstrap SE"
          value={bootSE.toFixed(3)}
          tone="accent"
          hint="standard deviation of the resampled slopes"
        />
        <StatChip
          label="formula SE"
          value={observed.seSlope.toFixed(3)}
          hint="sqrt(MSE / Sxx) — what statsmodels prints"
        />
      </div>

      <div className="bg-[#F5F2ED] border-l-2 border-l-[#27AE60] border-y border-r border-[#1A1A1A]/10 rounded-sm p-3">
        <p className="text-[11px] text-[#333333] leading-relaxed">
          The simulation and the formula agree to within{' '}
          <span className="font-mono font-bold text-[#27AE60]">
            {Math.abs(100 - agreement).toFixed(1)}%
          </span>
          . They are two routes to the same quantity: how much this slope would move if you went
          back out and measured 333 different penguins.
        </p>
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Note what the bootstrap keeps: each resample draws whole (x, y) <em>pairs</em>, so the
        flipper-to-mass relationship survives intact. That is exactly the opposite of the
        permutation test, which broke the pairing on purpose. Same machinery, opposite question.
      </p>
    </WidgetCard>
  );
};
