import React, { useMemo } from 'react';
import type { Row } from '../stats';
import { kde, numericValues } from '../stats';
import { hexForIndex } from './palette';

interface CategoricalViolinProps {
  rows: Row[];
  xKey: string;
  yKey: string;
  categories: string[];
  bwAdjust: number;
  yLabel?: string;
  height?: number;
}

/** A violin: a mirrored KDE per category, width scaled to density — the
 *  shape a boxplot's five numbers can't show (bimodality, skew). */
export const CategoricalViolin: React.FC<CategoricalViolinProps> = ({
  rows,
  xKey,
  yKey,
  categories,
  bwAdjust,
  yLabel,
  height = 260,
}) => {
  const W = 460;
  const H = height;
  const M = { top: 12, right: 14, bottom: 30, left: 52 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const slotWidth = iw / categories.length;

  const perCategory = useMemo(
    () =>
      categories.map((cat) => {
        const values = numericValues(
          rows.filter((r) => String(r[xKey]) === cat),
          yKey
        );
        return { cat, values, density: kde(values, bwAdjust) };
      }),
    [rows, xKey, yKey, categories, bwAdjust]
  );

  const [yMin, yMax] = useMemo(() => {
    const all = perCategory.flatMap((c) => c.density.map((d) => d.x));
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    return [lo, hi];
  }, [perCategory]);

  const maxDensity = useMemo(
    () => Math.max(...perCategory.flatMap((c) => c.density.map((d) => d.y)), 1e-9),
    [perCategory]
  );

  const sy = (v: number) => M.top + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const yTicks = [yMin, yMin + (yMax - yMin) / 2, yMax];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`violin plot of ${yKey} by ${xKey}`}>
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

      {perCategory.map(({ cat, density }, i) => {
        const center = M.left + slotWidth * (i + 0.5);
        const halfWidth = slotWidth * 0.42;
        const color = hexForIndex(i);

        const rightSide = density.map((d) => `${center + (d.y / maxDensity) * halfWidth},${sy(d.x)}`);
        const leftSide = [...density]
          .reverse()
          .map((d) => `${center - (d.y / maxDensity) * halfWidth},${sy(d.x)}`);
        const points = [...rightSide, ...leftSide].join(' ');

        return (
          <g key={cat}>
            <polygon points={points} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={1.3} />
            <line x1={center} x2={center} y1={M.top} y2={M.top + ih} stroke={color} strokeOpacity={0.15} />
            <text x={center} y={M.top + ih + 13} textAnchor="middle" className="fill-[#4A4A4A]" style={{ fontSize: 9, fontWeight: 600 }}>
              {cat}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
