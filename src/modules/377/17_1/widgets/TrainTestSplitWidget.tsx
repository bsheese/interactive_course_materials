import React, { useMemo, useState } from 'react';
import { Scissors } from 'lucide-react';
import { Histogram } from '@kit/components/Histogram';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { calculateMean } from '@kit/stats';
import { AMES } from '../data';
import { fit, scoreOn, trainTestSplit } from '../stats';

/**
 * The reassuring half of 17_1_6: a two-parameter model on real housing data
 * generalizes fine, and the train/test gap is noise around zero. Establishing
 * that baseline is what makes the overfitting demo legible.
 */
export const TrainTestSplitWidget: React.FC = () => {
  const [seed, setSeed] = useState(42);
  const [testPct, setTestPct] = useState(20);

  const { train, test } = useMemo(
    () => trainTestSplit(AMES, testPct / 100, seed),
    [seed, testPct]
  );

  const model = useMemo(() => fit(train), [train]);
  const trainR2 = model.r2;
  const testR2 = scoreOn(test, model);

  // The gap across many splits — is this split's gap unusual, or just noise?
  const gaps = useMemo(
    () =>
      Array.from({ length: 300 }, (_, i) => {
        const split = trainTestSplit(AMES, testPct / 100, 100 + i);
        const m = fit(split.train);
        return m.r2 - scoreOn(split.test, m);
      }),
    [testPct]
  );

  const meanGap = calculateMean(gaps);
  const gap = trainR2 - testR2;

  return (
    <WidgetCard
      icon={Scissors}
      title="Fit on Train, Score on Both"
      subtitle={`Ames · area → price · ${train.length} train / ${test.length} test`}
      action={
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="text-[11px] font-sans font-medium px-2.5 py-1 bg-[#F5F2ED] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 rounded-sm transition-colors"
        >
          New split
        </button>
      }
    >
      <ScatterPlot
        points={[
          ...train.map(([x, y], i) => ({ x, y, id: `tr${i}`, tone: 'muted' as const })),
          ...test.map(([x, y], i) => ({ x, y, id: `te${i}`, tone: 'accent' as const, radius: 3.2 })),
        ]}
        lines={[{ slope: model.slope, intercept: model.intercept, color: '#1A1A1A' }]}
        xLabel="living area (sq ft)"
        yLabel="sale price ($)"
        formatY={(v) => `${Math.round(v / 1000)}k`}
        height={205}
      />

      <div className="flex items-center gap-3 text-[10px] font-sans">
        <span className="flex items-center gap-1.5 text-[#4A4A4A]">
          <span className="w-2 h-2 rounded-full bg-[#B9B3A9]" /> train (the line saw these)
        </span>
        <span className="flex items-center gap-1.5 text-[#4A4A4A]">
          <span className="w-2 h-2 rounded-full bg-[#E67E22]" /> test (held out)
        </span>
      </div>

      <Slider
        label="test set size"
        value={testPct}
        min={10}
        max={50}
        step={5}
        onChange={setTestPct}
        display={`${testPct}%`}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="train R²" value={trainR2.toFixed(3)} />
        <StatChip label="test R²" value={testR2.toFixed(3)} tone={testR2 > 0 ? 'good' : 'bad'} />
        <StatChip
          label="gap"
          value={`${gap >= 0 ? '+' : ''}${gap.toFixed(3)}`}
          tone={Math.abs(gap) > 0.15 ? 'bad' : 'good'}
        />
      </div>

      <div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
          The gap across 300 different splits
        </span>
        <Histogram
          values={gaps}
          xLabel="train R² − test R²"
          markers={[
            { value: 0, color: '#767676', dashed: true },
            { value: gap, color: '#E67E22', label: 'this split' },
          ]}
          formatX={(v) => v.toFixed(2)}
          height={140}
        />
      </div>

      <p className="text-[11px] text-[#333333] leading-relaxed">
        The gap is centred near{' '}
        <span className="font-mono font-bold">{meanGap.toFixed(3)}</span> — essentially zero — and
        it lands on both sides of the line. Test R² coming out <em>higher</em> than train R² is not
        a bug or a leak; it is sampling variation, and it happens routinely with an honest model.
      </p>

      <div className="p-3 bg-white border-l-2 border-l-[#E67E22] border-y border-r border-[#1A1A1A]/10 rounded-sm">
        <p className="text-[11px] text-[#555555] leading-relaxed">
          <span className="font-bold text-[#1A1A1A]">Simple models generalize.</span> Two parameters
          fitted on hundreds of houses have almost no room to memorise anything, so what they learn
          transfers. Keep this baseline in mind — the next slide breaks it on purpose. And the
          golden rule throughout: the test set is off-limits for fitting <em>and</em> for choosing
          between models.
        </p>
      </div>
    </WidgetCard>
  );
};
