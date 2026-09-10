import React, { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { seededRandom32 } from '@kit/stats';
import { T_STAR_95, fit, tToP } from '../stats';
import type { XY } from '../data';

/**
 * A deliberately tiny true effect (0.4 units of y per unit of x) measured at
 * growing n. The effect never changes; only the evidence does. This is the
 * cleanest way to separate statistical from practical significance.
 */
export const SampleSizeWidget: React.FC = () => {
  const [n, setN] = useState(40);

  // One long fixed population; larger n just reads more of the same rows, so
  // the picture grows rather than reshuffling under the student.
  const population = useMemo<XY[]>(() => {
    const random = seededRandom32(17);
    return Array.from({ length: 1200 }, () => {
      const x = random() * 20;
      // True slope 0.4, swamped by noise of roughly SD 9 — chosen so the
      // effect is genuinely undetectable at n = 40 and unmistakable by n = 800.
      const noise = (random() + random() + random() + random() + random() + random() - 3) * 13;
      return [x, 50 + 0.4 * x + noise] as XY;
    });
  }, []);

  const sample = useMemo(() => population.slice(0, n), [population, n]);
  const f = useMemo(() => fit(sample), [sample]);

  const p = tToP(f.tStat);
  const ciLo = f.slope - T_STAR_95 * f.seSlope;
  const ciHi = f.slope + T_STAR_95 * f.seSlope;
  const significant = p < 0.05;

  return (
    <WidgetCard
      icon={Users}
      title="The Same Effect, More Data"
      subtitle="True slope is 0.4 the whole way — only n changes"
    >
      <ScatterPlot
        points={sample.map(([x, y], i) => ({ x, y, id: i }))}
        lines={[
          { slope: f.slope, intercept: f.intercept, color: '#E67E22' },
          { slope: 0.4, intercept: 50, color: '#27AE60', dashed: true },
        ]}
        xLabel="x"
        yLabel="y"
        xDomain={[-1, 21]}
        yDomain={[10, 95]}
        height={200}
      />

      <div className="flex items-center gap-3 text-[10px] font-sans">
        <span className="flex items-center gap-1.5 text-[#4A4A4A]">
          <span className="w-4 h-0.5 bg-[#E67E22]" /> fitted from this sample
        </span>
        <span className="flex items-center gap-1.5 text-[#4A4A4A]">
          <span className="w-4 h-0.5 bg-[#27AE60]" style={{ borderTop: '1px dashed' }} /> true
          population line
        </span>
      </div>

      <Slider
        label="sample size n"
        value={n}
        min={20}
        max={1200}
        step={10}
        onChange={setN}
        display={String(n)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatChip label="β̂₁" value={f.slope.toFixed(3)} tone="accent" />
        <StatChip label="SE" value={f.seSlope.toFixed(3)} hint="shrinks like 1/sqrt(n)" />
        <StatChip label="t" value={f.tStat.toFixed(2)} />
        <StatChip
          label="p-value"
          value={p < 0.0001 ? '<0.0001' : p.toFixed(4)}
          tone={significant ? 'good' : 'bad'}
        />
      </div>

      <div className="bg-[#F5F2ED] border border-[#1A1A1A]/10 rounded-sm px-3 py-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-sans text-[#4A4A4A]">95% CI for β₁</span>
        <span className="font-mono text-xs font-bold text-[#1A1A1A]">
          [{ciLo.toFixed(3)}, {ciHi.toFixed(3)}]
        </span>
      </div>

      <div
        className={`p-3 rounded-sm border-l-2 border-y border-r border-[#1A1A1A]/10 ${
          significant ? 'bg-[#27AE60]/5 border-l-[#27AE60]' : 'bg-[#C0392B]/5 border-l-[#C0392B]'
        }`}
      >
        <p className="text-[11px] text-[#333333] leading-relaxed">
          {significant ? (
            <>
              At n = {n} this is <span className="font-bold text-[#27AE60]">statistically significant</span> — and
              the effect is still 0.4. The full 20-unit span of x buys eight units of y, against
              noise with a standard deviation of about 9. Significance says the effect is real, not
              that it is large.
            </>
          ) : (
            <>
              At n = {n} the interval still straddles zero, so this reads as{' '}
              <span className="font-bold text-[#C0392B]">not significant</span> — even though the
              effect is genuinely there. Keep dragging: nothing about the world changes, only how
              precisely you have measured it.
            </>
          )}
        </p>
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        SE falls like 1/√n, so t grows like √n and p collapses. With enough data, any effect that is
        not exactly zero becomes significant. That is why "is it significant?" is never the last
        question — "is it big enough to matter?" is.
      </p>
    </WidgetCard>
  );
};
