import React, { useMemo } from 'react';
import type { Row } from '../stats';
import { hexForIndex } from './palette';

interface DistributionHistogramProps {
  rows: Row[];
  xKey: string;
  hueKey?: string;
  hueCategories?: string[];
  bins: number;
  xLabel?: string;
  height?: number;
}

/** Overlaid, semi-transparent histograms per hue group — `sns.histplot`'s
 *  default `multiple="layer"` behaviour. */
export const DistributionHistogram: React.FC<DistributionHistogramProps> = ({
  rows,
  xKey,
  hueKey,
  hueCategories,
  bins,
  xLabel,
  height = 260,
}) => {
  const W = 460;
  const H = height;
  const M = { top: 12, right: 14, bottom: 30, left: 40 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;

  const allValues = useMemo(() => rows.map((r) => Number(r[xKey])).filter(Number.isFinite), [rows, xKey]);
  const groups = hueKey && hueCategories && hueCategories.length > 0 ? hueCategories : [undefined];

  const { lo, hi, width, series, maxCount } = useMemo(() => {
    const lo = Math.min(...allValues);
    const hi = Math.max(...allValues);
    const span = hi - lo || 1;
    const binWidth = span / bins;

    const series = groups.map((group) => {
      const values =
        group === undefined
          ? allValues
          : rows.filter((r) => String(r[hueKey as string]) === group).map((r) => Number(r[xKey]));
      const counts = new Array(bins).fill(0);
      values.forEach((v) => {
        const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / binWidth)));
        counts[idx] += 1;
      });
      return { group, counts };
    });

    const maxCount = Math.max(...series.flatMap((s) => s.counts), 1);
    return { lo, hi, width: binWidth, series, maxCount };
  }, [allValues, rows, xKey, hueKey, groups, bins]);

  const sx = (x: number) => M.left + ((x - lo) / (hi - lo)) * iw;
  const barWidth = (iw / bins) * 0.92;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`distribution of ${xKey}`}>
      <line x1={M.left} x2={M.left + iw} y1={M.top + ih} y2={M.top + ih} stroke="#1A1A1A" strokeOpacity={0.35} />

      {series.map((s, si) => (
        <g key={s.group ?? 'all'}>
          {s.counts.map((count, i) => {
            const binLo = lo + i * width;
            const barHeight = (count / maxCount) * ih;
            return (
              <rect
                key={i}
                x={sx(binLo)}
                y={M.top + ih - barHeight}
                width={barWidth}
                height={barHeight}
                fill={hexForIndex(si)}
                fillOpacity={groups.length > 1 ? 0.45 : 0.7}
              />
            );
          })}
        </g>
      ))}

      {[lo, (lo + hi) / 2, hi].map((t, i) => (
        <text
          key={i}
          x={sx(t)}
          y={M.top + ih + 13}
          textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}
          className="fill-[#767676]"
          style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
        >
          {Math.round(t * 10) / 10}
        </text>
      ))}

      {xLabel && (
        <text x={M.left + iw / 2} y={H - 2} textAnchor="middle" className="fill-[#4A4A4A]" style={{ fontSize: 10, fontWeight: 600 }}>
          {xLabel}
        </text>
      )}
    </svg>
  );
};
