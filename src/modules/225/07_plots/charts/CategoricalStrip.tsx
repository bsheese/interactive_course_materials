import React, { useMemo } from 'react';
import { seededRandom32 } from '@kit/stats';
import type { Row } from '../stats';
import { hexForIndex } from './palette';

interface CategoricalStripProps {
  rows: Row[];
  xKey: string;
  yKey: string;
  categories: string[];
  hueKey?: string;
  hueCategories?: string[];
  jitter: number;
  yLabel?: string;
  height?: number;
}

/** Every observation as its own dot, jittered along the category axis so
 *  points don't stack — the raw data a bar or box plot summarises away. */
export const CategoricalStrip: React.FC<CategoricalStripProps> = ({
  rows,
  xKey,
  yKey,
  categories,
  hueKey,
  hueCategories,
  jitter,
  yLabel,
  height = 260,
}) => {
  const W = 460;
  const H = height;
  const M = { top: 12, right: 14, bottom: 30, left: 52 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const slotWidth = iw / categories.length;

  const [yMin, yMax] = useMemo(() => {
    const values = rows.map((r) => Number(r[yKey])).filter(Number.isFinite);
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const margin = (hi - lo) * 0.08 || 1;
    return [lo - margin, hi + margin];
  }, [rows, yKey]);

  const sy = (v: number) => M.top + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const yTicks = [yMin, yMin + (yMax - yMin) / 2, yMax];

  const points = useMemo(
    () =>
      rows.map((r) => {
        const catIndex = categories.indexOf(String(r[xKey]));
        const hueIndex = hueKey && hueCategories ? hueCategories.indexOf(String(r[hueKey])) : 0;
        const jitterOffset = (seededRandom32(Number(r.id) || 0)() - 0.5) * jitter * slotWidth * 0.9;
        return {
          id: r.id,
          x: M.left + slotWidth * (catIndex + 0.5) + jitterOffset,
          y: sy(Number(r[yKey])),
          color: hexForIndex(hueKey ? hueIndex : catIndex),
        };
      }),
    [rows, xKey, yKey, hueKey, hueCategories, categories, jitter, slotWidth, sy]
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`strip plot of ${yKey} by ${xKey}`}>
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

      {points.map((p) => (
        <circle key={p.id} cx={p.x} cy={p.y} r={2.6} fill={p.color} fillOpacity={0.6} />
      ))}

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
