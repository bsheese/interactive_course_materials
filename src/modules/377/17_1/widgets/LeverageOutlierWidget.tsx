import React, { useMemo, useState } from 'react';
import { Move, RotateCcw } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { seededGaussian, seededRandom32 } from '@kit/stats';
import { fit, influenceMeasures } from '../stats';
import type { XY } from '../data';

const START: XY = [11, 16.5];

const PRESETS: { label: string; at: XY; note: string }[] = [
  { label: 'Ordinary', at: [11, 16.5], note: 'Middling x, small residual — no leverage, no outlier, no influence.' },
  { label: 'Outlier only', at: [10, 26], note: 'Big residual, but x sits near the middle, so it pulls the line up without tilting it.' },
  { label: 'Leverage only', at: [19, 26.5], note: 'Extreme x, but it lands right where the line already goes — high leverage, and yet harmless.' },
  { label: 'Influential', at: [19, 8], note: 'Extreme x AND a big residual. This is the one that swings the slope.' },
];

/**
 * Leverage, outlier and influence are three different things, and the fastest
 * way to feel the difference is to drag one point and watch which readouts
 * move. The line is refitted live with the point included.
 */
export const LeverageOutlierWidget: React.FC = () => {
  const [special, setSpecial] = useState<XY>(START);

  const base = useMemo<XY[]>(() => {
    const random = seededRandom32(29);
    return Array.from({ length: 30 }, (_, i) => {
      const x = 2 + (i / 29) * 10;
      return [x, 4 + 1.2 * x + seededGaussian(random) * 1.4] as XY;
    });
  }, []);

  const withPoint = useMemo<XY[]>(() => [...base, special], [base, special]);

  const fitWith = useMemo(() => fit(withPoint), [withPoint]);
  const fitWithout = useMemo(() => fit(base), [base]);

  const measures = useMemo(() => influenceMeasures(withPoint), [withPoint]);
  const specialMeasure = measures[measures.length - 1];

  const n = withPoint.length;
  const cookThreshold = 4 / n;
  const leverageThreshold = (2 * 2) / n; // 2p/n, the common rule of thumb.
  const slopeShift = fitWith.slope - fitWithout.slope;

  const highLeverage = (specialMeasure?.leverage ?? 0) > leverageThreshold;
  const bigResidual = Math.abs(specialMeasure?.studentized ?? 0) > 2;
  const influential = (specialMeasure?.cooksD ?? 0) > cookThreshold;

  return (
    <WidgetCard
      icon={Move}
      title="Drag the Orange Point"
      subtitle="Leverage ≠ outlier ≠ influence — move it and watch which one fires"
      action={
        <button
          onClick={() => setSpecial(START)}
          className="flex items-center gap-1 text-[11px] font-sans font-medium px-2.5 py-1 bg-[#F5F2ED] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 rounded-sm transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      }
    >
      <ScatterPlot
        points={[
          ...base.map(([x, y], i) => ({ x, y, id: i, tone: 'default' as const })),
          { x: special[0], y: special[1], id: 'special', tone: 'accent' as const },
        ]}
        lines={[
          { slope: fitWith.slope, intercept: fitWith.intercept, color: '#E67E22' },
          { slope: fitWithout.slope, intercept: fitWithout.intercept, color: '#767676', dashed: true },
        ]}
        xLabel="x"
        yLabel="y"
        xDomain={[0, 21]}
        yDomain={[0, 30]}
        height={230}
        draggableId="special"
        onDrag={(x, y) => setSpecial([x, y])}
      />

      <div className="flex items-center gap-3 text-[10px] font-sans">
        <span className="flex items-center gap-1.5 text-[#4A4A4A]">
          <span className="w-4 h-0.5 bg-[#E67E22]" /> with the point
        </span>
        <span className="flex items-center gap-1.5 text-[#4A4A4A]">
          <span className="w-4 h-0.5 bg-[#767676]" /> without it
        </span>
      </div>

      <div className="flex flex-wrap gap-1 text-[10px] font-sans">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setSpecial(preset.at)}
            className="px-2 py-0.5 rounded-xs border bg-white text-[#4A4A4A] border-[#1A1A1A]/15 hover:border-[#E67E22] hover:text-[#1A1A1A] transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatChip
          label="leverage hᵢᵢ"
          value={(specialMeasure?.leverage ?? 0).toFixed(3)}
          tone={highLeverage ? 'bad' : 'good'}
          hint={`flagged above 2p/n = ${leverageThreshold.toFixed(3)}`}
        />
        <StatChip
          label="stud. residual"
          value={(specialMeasure?.studentized ?? 0).toFixed(2)}
          tone={bigResidual ? 'bad' : 'good'}
          hint="unusual beyond about ±3"
        />
        <StatChip
          label="Cook's D"
          value={(specialMeasure?.cooksD ?? 0).toFixed(3)}
          tone={influential ? 'bad' : 'good'}
          hint={`flagged above 4/n = ${cookThreshold.toFixed(3)}`}
        />
        <StatChip
          label="slope shift"
          value={slopeShift >= 0 ? `+${slopeShift.toFixed(3)}` : slopeShift.toFixed(3)}
          tone={Math.abs(slopeShift) > 0.1 ? 'bad' : 'good'}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'High leverage', on: highLeverage, sub: 'extreme x' },
          { label: 'Outlier', on: bigResidual, sub: 'unusual y given x' },
          { label: 'Influential', on: influential, sub: 'actually moves the line' },
        ].map((flag) => (
          <div
            key={flag.label}
            className={`rounded-sm border px-2 py-2 ${
              flag.on ? 'bg-[#C0392B]/10 border-[#C0392B]/40' : 'bg-[#F5F2ED] border-[#1A1A1A]/10'
            }`}
          >
            <div className={`text-[11px] font-bold ${flag.on ? 'text-[#C0392B]' : 'text-[#B9B3A9]'}`}>
              {flag.label}
            </div>
            <div className="text-[9px] text-[#767676] leading-tight">{flag.sub}</div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Try "Leverage only": push the point far right but leave it on the line. Leverage is huge,
        Cook's D stays small, the line barely twitches. Leverage is only the <em>potential</em> to
        influence — a point has to be both far out in x and wrong in y before it actually drags the
        slope with it.
      </p>
    </WidgetCard>
  );
};
