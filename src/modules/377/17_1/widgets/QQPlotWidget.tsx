import React, { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Histogram } from '@kit/components/Histogram';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { calculateMean, seededGaussian, seededRandom32 } from '@kit/stats';
import { qqPoints } from '../stats';

type Shape = 'normal' | 'heavy' | 'skewed';

const SHAPES: { key: Shape; label: string; reading: string }[] = [
  {
    key: 'normal',
    label: 'Normal',
    reading:
      'Points track the diagonal from end to end. Mild wandering at the extreme tails is normal even for genuinely normal data — there are only a few points out there.',
  },
  {
    key: 'heavy',
    label: 'Heavy tails',
    reading:
      'An S-curve: the low end sits below the line and the high end above it. Both tails are more extreme than a normal distribution would produce — outliers on both sides.',
  },
  {
    key: 'skewed',
    label: 'Right-skewed',
    reading:
      'The upper end pulls sharply away while the lower end hugs the line. A long right tail — the signature that usually means a log transform is worth trying.',
  },
];

/**
 * Q-Q plots read as shapes, not numbers, so this pairs each residual
 * distribution with its histogram — the comparison that shows why the Q-Q plot
 * is the more sensitive of the two.
 */
export const QQPlotWidget: React.FC = () => {
  const [shape, setShape] = useState<Shape>('normal');

  const values = useMemo(() => {
    const random = seededRandom32(43);
    return Array.from({ length: 200 }, () => {
      const g = seededGaussian(random);
      switch (shape) {
        case 'heavy':
          // Occasional draws from a much wider distribution.
          return random() < 0.12 ? g * 4.5 : g * 0.85;
        case 'skewed':
          return Math.exp(g * 0.62) - 1.2;
        default:
          return g;
      }
    });
  }, [shape]);

  const qq = useMemo(() => qqPoints(values), [values]);
  const active = SHAPES.find((s) => s.key === shape)!;

  // Sample skewness and excess kurtosis — the two quantities Jarque-Bera uses.
  const { skew, kurtosis } = useMemo(() => {
    const mean = calculateMean(values);
    const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length) || 1;
    const m3 = values.reduce((s, v) => s + ((v - mean) / sd) ** 3, 0) / values.length;
    const m4 = values.reduce((s, v) => s + ((v - mean) / sd) ** 4, 0) / values.length;
    return { skew: m3, kurtosis: m4 - 3 };
  }, [values]);

  return (
    <WidgetCard
      icon={TrendingUp}
      title="Reading a Q-Q Plot"
      subtitle="Sorted residuals against the quantiles a normal distribution would give"
      action={
        <div className="flex gap-1 text-[10px] font-sans">
          {SHAPES.map((s) => (
            <button
              key={s.key}
              onClick={() => setShape(s.key)}
              className={`px-2 py-0.5 rounded-xs border transition-colors ${
                shape === s.key
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                  : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      }
    >
      <ScatterPlot
        points={qq.map(([x, y], i) => ({
          x,
          y,
          id: i,
          tone: Math.abs(y - x) > 0.8 ? ('bad' as const) : ('default' as const),
        }))}
        lines={[{ slope: 1, intercept: 0, color: '#E67E22', dashed: true }]}
        xLabel="theoretical normal quantile"
        yLabel="standardised residual"
        xDomain={[-3.2, 3.2]}
        yDomain={[-4.2, 4.2]}
        height={215}
      />

      <div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
          The same residuals as a histogram
        </span>
        <Histogram values={values} bins={30} height={120} barColor="#1A1A1A" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatChip
          label="skewness"
          value={skew.toFixed(2)}
          tone={Math.abs(skew) > 0.5 ? 'bad' : 'good'}
          hint="0 for a symmetric distribution"
        />
        <StatChip
          label="excess kurtosis"
          value={kurtosis.toFixed(2)}
          tone={Math.abs(kurtosis) > 1 ? 'bad' : 'good'}
          hint="0 for a normal distribution; positive means heavy tails"
        />
      </div>

      <div className="p-3 bg-[#F5F2ED] border-l-2 border-l-[#E67E22] border-y border-r border-[#1A1A1A]/10 rounded-sm">
        <p className="text-[11px] text-[#333333] leading-relaxed">{active.reading}</p>
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Compare the two views: the heavy-tailed histogram still looks roughly bell-shaped, while its
        Q-Q plot is unmistakably S-curved. That sensitivity in the tails is exactly why the Q-Q plot
        is the standard tool here. And with n this large the Central Limit Theorem keeps inference
        approximately valid anyway — mild non-normality is the least alarming of the four
        violations.
      </p>
    </WidgetCard>
  );
};
