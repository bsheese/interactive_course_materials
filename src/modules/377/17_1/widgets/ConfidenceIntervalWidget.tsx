import React, { useMemo, useState } from 'react';
import { Brackets } from 'lucide-react';
import { Histogram } from '@kit/components/Histogram';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { seededRandom32 } from '@kit/stats';
import { PENGUINS } from '../data';
import { T_STAR_95, bootstrapSlopes, fit, percentile } from '../stats';
import type { XY } from '../data';

/**
 * Two routes to the same interval — bootstrap percentiles and the classical
 * formula — plus the coverage simulation that shows what "95%" actually
 * refers to: the procedure, not any one interval.
 */
export const ConfidenceIntervalWidget: React.FC = () => {
  const [showCoverage, setShowCoverage] = useState(false);

  const observed = useMemo(() => fit(PENGUINS), []);
  const slopes = useMemo(() => bootstrapSlopes(PENGUINS, 2000), []);

  const sorted = useMemo(() => [...slopes].sort((a, b) => a - b), [slopes]);
  const bootLo = percentile(sorted, 0.025);
  const bootHi = percentile(sorted, 0.975);

  const formulaLo = observed.slope - T_STAR_95 * observed.seSlope;
  const formulaHi = observed.slope + T_STAR_95 * observed.seSlope;

  /**
   * Coverage: treat the full sample as the population, draw 40 fresh samples
   * of 60 penguins, and build an interval from each. About 95% should cover
   * the population slope.
   */
  const coverage = useMemo(() => {
    const random = seededRandom32(31);
    const truth = observed.slope;

    return Array.from({ length: 40 }, () => {
      const sample: XY[] = Array.from(
        { length: 60 },
        () => PENGUINS[Math.floor(random() * PENGUINS.length)]
      );
      const f = fit(sample);
      const lo = f.slope - T_STAR_95 * f.seSlope;
      const hi = f.slope + T_STAR_95 * f.seSlope;
      return { lo, hi, slope: f.slope, covers: lo <= truth && truth <= hi };
    });
  }, [observed.slope]);

  const covered = coverage.filter((c) => c.covers).length;
  const spanLo = Math.min(...coverage.map((c) => c.lo));
  const spanHi = Math.max(...coverage.map((c) => c.hi));

  return (
    <WidgetCard
      icon={Brackets}
      title="The 95% Confidence Interval"
      subtitle="Bootstrap percentiles vs. β̂₁ ± 1.96 · SE"
      action={
        <button
          onClick={() => setShowCoverage((prev) => !prev)}
          className="text-[11px] font-sans font-medium px-2.5 py-1 bg-[#F5F2ED] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 rounded-sm transition-colors"
        >
          {showCoverage ? 'Back to the interval' : 'What does 95% mean?'}
        </button>
      }
    >
      {!showCoverage ? (
        <>
          <Histogram
            values={slopes}
            xLabel="bootstrap slope"
            markers={[
              { value: bootLo, color: '#2980B9', label: '2.5%' },
              { value: bootHi, color: '#2980B9', label: '97.5%' },
              { value: observed.slope, color: '#E67E22' },
            ]}
            shadeBeyond={{ lower: bootLo, upper: bootHi, color: '#767676' }}
            formatX={(v) => v.toFixed(1)}
            height={195}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 bg-[#F5F2ED] border border-[#1A1A1A]/10 rounded-sm px-3 py-2">
              <span className="text-[11px] font-sans font-bold text-[#2980B9]">
                Bootstrap percentile
              </span>
              <span className="font-mono text-xs font-bold text-[#1A1A1A]">
                [{bootLo.toFixed(2)}, {bootHi.toFixed(2)}]
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 bg-[#F5F2ED] border border-[#1A1A1A]/10 rounded-sm px-3 py-2">
              <span className="text-[11px] font-sans font-bold text-[#E67E22]">
                β̂₁ ± 1.96 · SE
              </span>
              <span className="font-mono text-xs font-bold text-[#1A1A1A]">
                [{formulaLo.toFixed(2)}, {formulaHi.toFixed(2)}]
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#767676] leading-relaxed">
            Two different philosophies, intervals that agree to within a fraction of a gram. Neither
            contains zero — nowhere near it — which is the same verdict the p-value gave, expressed
            in units you can actually interpret.
          </p>
        </>
      ) : (
        <>
          <svg viewBox="0 0 460 250" className="w-full" role="img" aria-label="coverage simulation">
            {coverage.map((c, i) => {
              const y = 8 + i * 6;
              const sx = (v: number) => 30 + ((v - spanLo) / (spanHi - spanLo)) * 400;
              return (
                <g key={i}>
                  <line
                    x1={sx(c.lo)}
                    x2={sx(c.hi)}
                    y1={y}
                    y2={y}
                    stroke={c.covers ? '#27AE60' : '#C0392B'}
                    strokeWidth={c.covers ? 1.8 : 2.6}
                    strokeOpacity={c.covers ? 0.65 : 1}
                  />
                  <circle cx={sx(c.slope)} cy={y} r={1.6} fill="#1A1A1A" fillOpacity={0.7} />
                </g>
              );
            })}
            <line
              x1={30 + ((observed.slope - spanLo) / (spanHi - spanLo)) * 400}
              x2={30 + ((observed.slope - spanLo) / (spanHi - spanLo)) * 400}
              y1={0}
              y2={246}
              stroke="#E67E22"
              strokeWidth={1.8}
            />
            <text
              x={30 + ((observed.slope - spanLo) / (spanHi - spanLo)) * 400}
              y={247}
              textAnchor="middle"
              className="fill-[#E67E22]"
              style={{ fontSize: 9, fontWeight: 700 }}
            >
              population slope
            </text>
          </svg>

          <p className="text-[11px] text-[#333333] leading-relaxed">
            Forty fresh samples of 60 penguins, one interval from each.{' '}
            <span className="font-bold text-[#27AE60]">{covered}</span> of 40 cover the population
            slope; the <span className="font-bold text-[#C0392B]">{40 - covered}</span> in red miss
            it entirely — and nothing about those samples announced that they were the unlucky ones.
          </p>

          <div className="p-3 bg-white border-l-2 border-l-[#E67E22] border-y border-r border-[#1A1A1A]/10 rounded-sm">
            <p className="text-[11px] text-[#555555] leading-relaxed">
              This is why the careful phrasing matters. The 95% describes <em>the procedure</em> —
              about 95 intervals in 100 built this way will contain the true value. It is not a 95%
              probability that this particular interval, already computed, contains it.
            </p>
          </div>
        </>
      )}

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="β̂₁" value={observed.slope.toFixed(2)} tone="accent" />
        <StatChip label="SE" value={observed.seSlope.toFixed(3)} />
        <StatChip label="contains 0?" value="no" tone="good" />
      </div>
    </WidgetCard>
  );
};
