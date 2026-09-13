import React, { useMemo } from 'react';
import type { Row } from '../stats';
import { fiveNumberSummary, numericValues } from '../stats';
import { hexForIndex } from './palette';

interface CategoricalBoxProps {
  rows: Row[];
  xKey: string;
  yKey: string;
  categories: string[];
  yLabel?: string;
  height?: number;
}

/** A boxplot: median, IQR box, Tukey whiskers, and points past 1.5*IQR drawn
 *  individually as outliers — exactly what `sns.boxplot` draws. */
export const CategoricalBox: React.FC<CategoricalBoxProps> = ({
  rows,
  xKey,
  yKey,
  categories,
  yLabel,
  height = 260,
}) => {
  const W = 460;
  const H = height;
  const M = { top: 12, right: 14, bottom: 30, left: 52 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const slotWidth = iw / categories.length;

  const summaries = useMemo(
    () =>
      categories.map((cat) => {
        const values = numericValues(
          rows.filter((r) => String(r[xKey]) === cat),
          yKey
        );
        return { cat, summary: fiveNumberSummary(values) };
      }),
    [rows, xKey, yKey, categories]
  );

  const [yMin, yMax] = useMemo(() => {
    const all = summaries.flatMap((s) => [s.summary.min, s.summary.max]);
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const margin = (hi - lo) * 0.08 || 1;
    return [lo - margin, hi + margin];
  }, [summaries]);

  const sy = (v: number) => M.top + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const yTicks = [yMin, yMin + (yMax - yMin) / 2, yMax];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`box plot of ${yKey} by ${xKey}`}>
      <line x1={M.left} x2={M.left + iw} y1={M.top + ih} y2={M.top + ih} stroke="#1A1A1A" strokeOpacity={0.35} />
      <line x1={M.left} x2={M.left} y1={M.top} y2={M.top + ih} stroke="#1A1A1A" strokeOpacity={0.35} />

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={M.left} x2={M.left + iw} y1={sy(t)} y2={sy(t)} stroke="#1A1A1A" strokeOpacity={0.06} />
          <text x={M.left - 6} y={sy(t) + 3} textAnchor="end" className="fill-[#767676]" style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
            {Math.round(t * 10) / 10}
          </text>
        </g>
      ))}

      {yLabel && (
        <text
          transform={`rotate(-90 12 ${M.top + ih / 2})`}
          x={12}
          y={M.top + ih / 2}
          textAnchor="middle"
          className="fill-[#4A4A4A]"
          style={{ fontSize: 10, fontWeight: 600 }}
        >
          {yLabel}
        </text>
      )}

      {summaries.map(({ cat, summary }, i) => {
        const center = M.left + slotWidth * (i + 0.5);
        const boxWidth = slotWidth * 0.5;
        const color = hexForIndex(i);
        return (
          <g key={cat}>
            <line x1={center} x2={center} y1={sy(summary.whiskerHigh)} y2={sy(summary.q3)} stroke={color} strokeOpacity={0.6} />
            <line x1={center} x2={center} y1={sy(summary.q1)} y2={sy(summary.whiskerLow)} stroke={color} strokeOpacity={0.6} />
            <line x1={center - boxWidth * 0.25} x2={center + boxWidth * 0.25} y1={sy(summary.whiskerHigh)} y2={sy(summary.whiskerHigh)} stroke={color} strokeOpacity={0.6} />
            <line x1={center - boxWidth * 0.25} x2={center + boxWidth * 0.25} y1={sy(summary.whiskerLow)} y2={sy(summary.whiskerLow)} stroke={color} strokeOpacity={0.6} />
            <rect
              x={center - boxWidth / 2}
              y={sy(summary.q3)}
              width={boxWidth}
              height={Math.max(1, sy(summary.q1) - sy(summary.q3))}
              fill={color}
              fillOpacity={0.16}
              stroke={color}
              strokeWidth={1.3}
            />
            <line x1={center - boxWidth / 2} x2={center + boxWidth / 2} y1={sy(summary.median)} y2={sy(summary.median)} stroke={color} strokeWidth={2} />
            {summary.outliers.map((v, oi) => (
              <circle key={oi} cx={center} cy={sy(v)} r={2.2} fill={color} fillOpacity={0.55} />
            ))}
            <text x={center} y={M.top + ih + 13} textAnchor="middle" className="fill-[#4A4A4A]" style={{ fontSize: 9, fontWeight: 600 }}>
              {cat}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
