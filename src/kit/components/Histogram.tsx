import React, { useMemo } from 'react';

interface Marker {
  value: number;
  color?: string;
  label?: string;
  dashed?: boolean;
}

interface HistogramProps {
  values: number[];
  bins?: number;
  height?: number;
  xLabel?: string;
  /** Vertical rules — the observed statistic, a critical value, zero. */
  markers?: Marker[];
  /** Bars at or beyond these bounds are tinted, for tail/rejection regions. */
  shadeBeyond?: { lower?: number; upper?: number; color?: string };
  domain?: [number, number];
  formatX?: (v: number) => string;
  barColor?: string;
}

/**
 * Shared histogram for sampling and null distributions — the bootstrap, the
 * permutation test, coverage simulations.
 */
export const Histogram: React.FC<HistogramProps> = ({
  values,
  bins = 34,
  height = 190,
  xLabel,
  markers = [],
  shadeBeyond,
  domain,
  formatX = (v) => String(Math.round(v * 100) / 100),
  barColor = '#1A1A1A',
}) => {
  const W = 460;
  const H = height;
  const M = { top: 10, right: 12, bottom: 30, left: 34 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;

  const { counts, lo, hi, width, max } = useMemo(() => {
    const finite = values.filter(Number.isFinite);
    if (finite.length === 0) return { counts: [] as number[], lo: 0, hi: 1, width: 1, max: 1 };

    const markerValues = markers.map((m) => m.value).filter(Number.isFinite);
    const rawLo = domain ? domain[0] : Math.min(...finite, ...markerValues);
    const rawHi = domain ? domain[1] : Math.max(...finite, ...markerValues);
    const span = rawHi - rawLo || 1;
    const lo = domain ? rawLo : rawLo - span * 0.04;
    const hi = domain ? rawHi : rawHi + span * 0.04;
    const width = (hi - lo) / bins;

    const counts = new Array(bins).fill(0);
    finite.forEach((v) => {
      const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / width)));
      counts[idx] += 1;
    });

    return { counts, lo, hi, width, max: Math.max(...counts, 1) };
  }, [values, bins, domain, markers]);

  const sx = (x: number) => M.left + ((x - lo) / (hi - lo)) * iw;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="distribution">
      <line x1={M.left} x2={M.left + iw} y1={M.top + ih} y2={M.top + ih} stroke="#1A1A1A" strokeOpacity={0.35} />

      {counts.map((count, i) => {
        const binLo = lo + i * width;
        const binHi = binLo + width;
        const center = (binLo + binHi) / 2;
        const shaded =
          shadeBeyond &&
          ((shadeBeyond.lower !== undefined && center <= shadeBeyond.lower) ||
            (shadeBeyond.upper !== undefined && center >= shadeBeyond.upper));
        const barHeight = (count / max) * ih;

        return (
          <rect
            key={i}
            x={sx(binLo) + 0.5}
            y={M.top + ih - barHeight}
            width={Math.max(1, (iw / counts.length) - 1)}
            height={barHeight}
            fill={shaded ? (shadeBeyond?.color ?? '#C0392B') : barColor}
            fillOpacity={shaded ? 0.75 : 0.4}
          />
        );
      })}

      {markers.map((marker, i) => (
        <g key={i}>
          <line
            x1={sx(marker.value)}
            x2={sx(marker.value)}
            y1={M.top}
            y2={M.top + ih}
            stroke={marker.color ?? '#E67E22'}
            strokeWidth={1.8}
            strokeDasharray={marker.dashed ? '4 3' : undefined}
          />
          {marker.label && (
            <text
              x={sx(marker.value)}
              y={M.top - 1}
              textAnchor="middle"
              className="fill-[#4A4A4A]"
              style={{ fontSize: 9, fontWeight: 700 }}
            >
              {marker.label}
            </text>
          )}
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
          {formatX(t)}
        </text>
      ))}

      {xLabel && (
        <text
          x={M.left + iw / 2}
          y={H - 2}
          textAnchor="middle"
          className="fill-[#4A4A4A]"
          style={{ fontSize: 10, fontWeight: 600 }}
        >
          {xLabel}
        </text>
      )}
    </svg>
  );
};
