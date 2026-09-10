import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { AMES } from '../data';
import { fit, influenceMeasures } from '../stats';
import type { XY } from '../data';

/** The 17_1_4 poisoned row: a mansion's area recorded against a shed's price. */
const POISONED: XY = [5642, 160000];

/**
 * Cook's Distance as a detective. The poisoned row is invisible in a scatter of
 * 246 houses and obvious in the Cook's D panel — and the drop test shows what
 * it was doing to the coefficients all along.
 */
export const CooksDistanceWidget: React.FC = () => {
  const [poisoned, setPoisoned] = useState(true);
  const [dropped, setDropped] = useState(false);

  const data = useMemo<XY[]>(() => (poisoned ? [...AMES, POISONED] : AMES), [poisoned]);
  const shown = useMemo<XY[]>(
    () => (dropped && poisoned ? data.slice(0, -1) : data),
    [data, dropped, poisoned]
  );

  const f = useMemo(() => fit(shown), [shown]);
  const measures = useMemo(() => influenceMeasures(data), [data]);

  const n = data.length;
  const threshold = 4 / n;
  const flagged = measures.filter((m) => m.cooksD > threshold);
  const worst = measures.reduce((a, b) => (b.cooksD > a.cooksD ? b : a), measures[0]);

  // Both fits, so the drop test can be quoted rather than just seen.
  const fitAll = useMemo(() => fit(data), [data]);
  const fitDropped = useMemo(() => fit(data.slice(0, -1)), [data]);
  const slopeChange = poisoned
    ? ((fitAll.slope - fitDropped.slope) / fitDropped.slope) * 100
    : 0;

  const maxCook = Math.max(...measures.map((m) => m.cooksD), threshold * 2);

  return (
    <WidgetCard
      icon={Search}
      title="Cook's Distance: the Needle in the Haystack"
      subtitle={`Ames Housing · area → price · n = ${n}`}
      action={
        <div className="flex gap-1 text-[10px] font-sans">
          <button
            onClick={() => {
              setPoisoned((prev) => !prev);
              setDropped(false);
            }}
            className={`px-2 py-0.5 rounded-xs border transition-colors ${
              poisoned
                ? 'bg-[#C0392B] text-white border-[#C0392B] font-bold'
                : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15'
            }`}
          >
            {poisoned ? 'poisoned row in' : 'clean data'}
          </button>
          {poisoned && (
            <button
              onClick={() => setDropped((prev) => !prev)}
              className={`px-2 py-0.5 rounded-xs border transition-colors ${
                dropped
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                  : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15'
              }`}
            >
              {dropped ? 'refitted without it' : 'run drop test'}
            </button>
          )}
        </div>
      }
    >
      <ScatterPlot
        points={shown.map(([x, y], i) => ({
          x,
          y,
          id: i,
          tone: poisoned && !dropped && i === shown.length - 1 ? ('bad' as const) : ('default' as const),
          radius: poisoned && !dropped && i === shown.length - 1 ? 5 : 2.4,
        }))}
        lines={[
          { slope: f.slope, intercept: f.intercept, color: '#E67E22' },
          ...(poisoned
            ? [{ slope: fitDropped.slope, intercept: fitDropped.intercept, color: '#767676', dashed: true }]
            : []),
        ]}
        xLabel="above-grade living area (sq ft)"
        yLabel="sale price ($)"
        formatY={(v) => `${Math.round(v / 1000)}k`}
        height={200}
      />

      <div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
          Cook's D by observation — the view that finds it
        </span>
        <svg viewBox="0 0 460 120" className="w-full" role="img" aria-label="Cook's distance stem plot">
          {measures.map((m, i) => {
            const x = 8 + (i / Math.max(1, measures.length - 1)) * 444;
            const h = (m.cooksD / maxCook) * 88;
            const over = m.cooksD > threshold;
            return (
              <line
                key={i}
                x1={x}
                x2={x}
                y1={100}
                y2={100 - h}
                stroke={over ? '#C0392B' : '#1A1A1A'}
                strokeOpacity={over ? 1 : 0.35}
                strokeWidth={over ? 2 : 1}
              />
            );
          })}
          <line x1={8} x2={452} y1={100} y2={100} stroke="#1A1A1A" strokeOpacity={0.35} />
          <line
            x1={8}
            x2={452}
            y1={100 - (threshold / maxCook) * 88}
            y2={100 - (threshold / maxCook) * 88}
            stroke="#E67E22"
            strokeDasharray="4 3"
            strokeWidth={1.2}
          />
          <text x={452} y={100 - (threshold / maxCook) * 88 - 3} textAnchor="end" className="fill-[#E67E22]" style={{ fontSize: 9, fontWeight: 700 }}>
            4/n = {threshold.toFixed(4)}
          </text>
          <text x={8} y={114} className="fill-[#767676]" style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
            observation index
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="flagged (D > 4/n)" value={String(flagged.length)} tone={flagged.length > 0 ? 'bad' : 'good'} />
        <StatChip label="largest D" value={worst ? worst.cooksD.toFixed(3) : '—'} tone={worst && worst.cooksD > threshold ? 'bad' : 'good'} />
        <StatChip label="R² (current fit)" value={f.r2.toFixed(3)} />
      </div>

      {poisoned && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono border border-[#1A1A1A]/10">
            <thead className="bg-[#ECE8E1] text-[#4A4A4A]">
              <tr>
                {['drop test', 'slope ($/sq ft)', 'R²'].map((h) => (
                  <th key={h} className="py-1.5 px-2 text-right font-sans font-bold text-[10px] first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              <tr>
                <td className="py-1.5 px-2 text-[#767676]">with the row</td>
                <td className="py-1.5 px-2 text-right">{fitAll.slope.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right">{fitAll.r2.toFixed(3)}</td>
              </tr>
              <tr className="bg-[#27AE60]/5">
                <td className="py-1.5 px-2 text-[#767676]">without it</td>
                <td className="py-1.5 px-2 text-right font-bold">{fitDropped.slope.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right font-bold">{fitDropped.r2.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] text-[#767676] mt-1.5">
            One row out of {n} moves the price-per-square-foot estimate by{' '}
            <span className="font-mono font-bold text-[#C0392B]">{slopeChange.toFixed(1)}%</span>.
          </p>
        </div>
      )}

      <div className="p-3 bg-white border-l-2 border-l-[#E67E22] border-y border-r border-[#1A1A1A]/10 rounded-sm">
        <p className="text-[11px] text-[#555555] leading-relaxed">
          <span className="font-bold text-[#1A1A1A]">Cook's D is a detective, not an executioner.</span>{' '}
          Here the flag led to a genuine data error — a 5,642 sq ft house priced at $160,000 — and
          fixing an error is a legitimate reason to drop a row. "It was hurting my R²" is not. When
          a point is real and you cannot drop it, report both models, use robust regression, or
          model what is actually going on.
        </p>
      </div>
    </WidgetCard>
  );
};
