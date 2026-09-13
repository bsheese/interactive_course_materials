import React, { useMemo } from 'react';
import type { Row } from '../stats';
import { meanWithCI, numericValues } from '../stats';
import { hexForIndex } from './palette';

interface CategoricalBarProps {
  rows: Row[];
  xKey: string;
  yKey: string;
  categories: string[];
  hueKey?: string;
  hueCategories?: string[];
  yLabel?: string;
  height?: number;
}

/** Grouped bars at the mean, with a 95% CI whisker — `sns.barplot`'s point
 *  estimate plus uncertainty, not just a raw total. */
export const CategoricalBar: React.FC<CategoricalBarProps> = ({
  rows,
  xKey,
  yKey,
  categories,
  hueKey,
  hueCategories,
  yLabel,
  height = 260,
}) => {
  const W = 460;
  const H = height;
  const M = { top: 12, right: 14, bottom: 30, left: 52 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const slotWidth = iw / categories.length;
  const hues = hueKey && hueCategories && hueCategories.length > 0 ? hueCategories : [undefined];

  const bars = useMemo(
    () =>
      categories.flatMap((cat, ci) =>
        hues.map((hue, hi) => {
          const subset = rows.filter(
            (r) => String(r[xKey]) === cat && (hue === undefined || String(r[hueKey as string]) === hue)
          );
          return { cat, ci, hue, hi, stats: meanWithCI(numericValues(subset, yKey)) };
        })
      ),
    [rows, xKey, yKey, hueKey, categories, hues]
  );

  const [yMin, yMax] = useMemo(() => {
    const highs = bars.map((b) => b.stats.ciHigh);
    const hi = Math.max(...highs, 0);
    return [0, hi * 1.1 || 1];
  }, [bars]);

  const sy = (v: number) => M.top + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const yTicks = [yMin, yMin + (yMax - yMin) / 2, yMax];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`bar plot of ${yKey} by ${xKey}`}>
      <line x1={M.left} x2={M.left + iw} y1={M.top + ih} y2={M.top + ih} stroke="#1A1A1A" strokeOpacity={0.35} />
      <line x1={M.left} x2={M.left} y1={M.top} y2={M.top + ih} stroke="#1A1A1A" strokeOpacity={0.35} />

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={M.left} x2={M.left + iw} y1={sy(t)} y2={sy(t)} stroke="#1A1A1A" strokeOpacity={0.06} />
          <text x={M.left - 6} y={sy(t) + 3} textAnchor="end" className="fill-[#767676]" style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
            {Math.round(t)}
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

      {bars.map(({ cat, ci, hue, hi, stats }) => {
        const groupWidth = slotWidth * 0.62;
        const barWidth = groupWidth / hues.length;
        const groupLeft = M.left + slotWidth * ci + (slotWidth - groupWidth) / 2;
        const x = groupLeft + barWidth * hi;
        const color = hexForIndex(hi);
        const barTop = sy(stats.mean);
        return (
          <g key={`${cat}-${hue ?? 'all'}`}>
            <rect x={x} y={barTop} width={barWidth * 0.85} height={Math.max(0, sy(0) - barTop)} fill={color} fillOpacity={0.6} />
            <line x1={x + barWidth * 0.425} x2={x + barWidth * 0.425} y1={sy(stats.ciLow)} y2={sy(stats.ciHigh)} stroke="#1A1A1A" strokeWidth={1.3} />
            <line
              x1={x + barWidth * 0.425 - 3}
              x2={x + barWidth * 0.425 + 3}
              y1={sy(stats.ciHigh)}
              y2={sy(stats.ciHigh)}
              stroke="#1A1A1A"
              strokeWidth={1.3}
            />
            <line
              x1={x + barWidth * 0.425 - 3}
              x2={x + barWidth * 0.425 + 3}
              y1={sy(stats.ciLow)}
              y2={sy(stats.ciLow)}
              stroke="#1A1A1A"
              strokeWidth={1.3}
            />
          </g>
        );
      })}

      {categories.map((cat, i) => (
        <text
          key={cat}
          x={M.left + slotWidth * (i + 0.5)}
          y={M.top + ih + 13}
          textAnchor="middle"
          className="fill-[#4A4A4A]"
          style={{ fontSize: 9, fontWeight: 600 }}
        >
          {cat}
        </text>
      ))}
    </svg>
  );
};
