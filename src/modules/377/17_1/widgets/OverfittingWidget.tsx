import React, { useMemo, useState } from 'react';
import { TrendingDown } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { polyFit, scoreCurve, sinDataset, trainTestSplit } from '../stats';

const MAX_DEGREE = 18;

/**
 * The overfitting demo: polynomial degree against train and test R². The two
 * curves separating is the whole lesson, so both the fitted curve and the
 * score curves are on screen at once.
 */
export const OverfittingWidget: React.FC = () => {
  const [degree, setDegree] = useState(3);

  const data = useMemo(() => sinDataset(60, 0.25, 3), []);
  const { train, test } = useMemo(() => trainTestSplit(data, 0.35, 5), [data]);

  const model = useMemo(() => polyFit(train, degree), [train, degree]);
  const trainR2 = scoreCurve(train, model);
  const testR2 = scoreCurve(test, model);

  // Every degree, so the classic U-shape can be drawn.
  const sweep = useMemo(
    () =>
      Array.from({ length: MAX_DEGREE }, (_, i) => {
        const d = i + 1;
        const m = polyFit(train, d);
        return { degree: d, train: scoreCurve(train, m), test: scoreCurve(test, m) };
      }),
    [train, test]
  );

  const best = sweep.reduce((a, b) => (b.test > a.test ? b : a));

  const curve = useMemo(() => {
    const xs = data.map((p) => p[0]);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    return Array.from({ length: 160 }, (_, i) => {
      const x = lo + (i / 159) * (hi - lo);
      return [x, model(x)] as [number, number];
    });
  }, [data, model]);

  const verdict =
    degree <= 2
      ? { text: 'Underfitting — high bias', tone: 'bad' as const }
      : testR2 > 0.6
        ? { text: 'Goldilocks zone', tone: 'good' as const }
        : { text: 'Overfitting — high variance', tone: 'bad' as const };

  // Plot area for the R² sweep.
  const W = 460;
  const H = 150;
  const sx = (d: number) => 34 + ((d - 1) / (MAX_DEGREE - 1)) * (W - 48);
  const sy = (r2: number) => 12 + (1 - Math.max(-1, r2)) * ((H - 30) / 2);

  return (
    <WidgetCard
      icon={TrendingDown}
      title="Making Overfitting Visible"
      subtitle="sin(x) + noise · polynomial regression · 39 train / 21 test"
    >
      <ScatterPlot
        points={[
          ...train.map(([x, y], i) => ({ x, y, id: `tr${i}`, tone: 'muted' as const })),
          ...test.map(([x, y], i) => ({ x, y, id: `te${i}`, tone: 'accent' as const, radius: 3.4 })),
        ]}
        curves={[{ points: curve, color: '#1A1A1A', width: 2 }]}
        xLabel="x"
        yLabel="y"
        yDomain={[-2.2, 2.2]}
        height={195}
      />

      <Slider
        label="polynomial degree"
        value={degree}
        min={1}
        max={MAX_DEGREE}
        onChange={setDegree}
        display={String(degree)}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="train R²" value={trainR2.toFixed(3)} />
        <StatChip
          label="test R²"
          value={testR2.toFixed(3)}
          tone={testR2 < 0 ? 'bad' : testR2 > 0.6 ? 'good' : 'neutral'}
        />
        <StatChip label="verdict" value={verdict.text} tone={verdict.tone} />
      </div>

      <div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
          R² against degree — train climbs, test peaks then collapses
        </span>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="R squared by degree">
          {[1, 0.5, 0, -0.5, -1].map((r2) => (
            <g key={r2}>
              <line x1={34} x2={W - 14} y1={sy(r2)} y2={sy(r2)} stroke="#1A1A1A" strokeOpacity={r2 === 0 ? 0.3 : 0.08} />
              <text x={30} y={sy(r2) + 3} textAnchor="end" className="fill-[#767676]" style={{ fontSize: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                {r2}
              </text>
            </g>
          ))}

          <polyline
            fill="none"
            stroke="#767676"
            strokeWidth={1.8}
            points={sweep.map((s) => `${sx(s.degree)},${sy(s.train)}`).join(' ')}
          />
          <polyline
            fill="none"
            stroke="#E67E22"
            strokeWidth={2.2}
            points={sweep.map((s) => `${sx(s.degree)},${sy(Math.max(-1, s.test))}`).join(' ')}
          />

          <line x1={sx(degree)} x2={sx(degree)} y1={8} y2={H - 18} stroke="#1A1A1A" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={sx(best.degree)} cy={sy(best.test)} r={3.5} fill="none" stroke="#27AE60" strokeWidth={2} />

          <text x={34} y={H - 4} className="fill-[#767676]" style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
            degree 1
          </text>
          <text x={W - 14} y={H - 4} textAnchor="end" className="fill-[#767676]" style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
            {MAX_DEGREE}
          </text>
        </svg>
        <div className="flex items-center gap-3 text-[10px] font-sans">
          <span className="flex items-center gap-1.5 text-[#4A4A4A]">
            <span className="w-4 h-0.5 bg-[#767676]" /> train
          </span>
          <span className="flex items-center gap-1.5 text-[#4A4A4A]">
            <span className="w-4 h-0.5 bg-[#E67E22]" /> test
          </span>
          <span className="flex items-center gap-1.5 text-[#4A4A4A]">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#27AE60]" /> best test R² at
            degree {best.degree}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-[#333333] leading-relaxed">
        Degree 1 cannot bend at all and misses a sine wave entirely — that is bias. Around degree 3
        the curve matches the signal. Past that, the extra flexibility goes into chasing noise: the
        train curve keeps creeping toward 1.0 while the test curve falls off a cliff, sometimes
        below zero — a model doing <em>worse than predicting the mean</em>.
      </p>

      <div className="p-3 bg-white border-l-2 border-l-[#E67E22] border-y border-r border-[#1A1A1A]/10 rounded-sm">
        <p className="text-[11px] text-[#555555] leading-relaxed">
          Test Error = Bias² + Variance + Irreducible Error. Moving right along this axis trades
          bias for variance; the best model sits where their sum bottoms out. Every technique in the
          rest of this course — cross-validation, regularization, ensembles — is another way of
          finding that point without peeking at the test set.
        </p>
      </div>
    </WidgetCard>
  );
};
