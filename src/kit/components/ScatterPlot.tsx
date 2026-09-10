import React, { useCallback, useMemo, useRef } from 'react';

export interface PlotPoint {
  x: number;
  y: number;
  id?: number | string;
  /** Colours the marker; defaults to the neutral ink dot. */
  tone?: 'default' | 'accent' | 'good' | 'bad' | 'muted';
  radius?: number;
  label?: string;
}

export interface PlotLine {
  slope: number;
  intercept: number;
  color?: string;
  dashed?: boolean;
  label?: string;
  width?: number;
}

export interface PlotCurve {
  points: [number, number][];
  color?: string;
  dashed?: boolean;
  label?: string;
  width?: number;
}

interface ScatterPlotProps {
  points: PlotPoint[];
  lines?: PlotLine[];
  curves?: PlotCurve[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  /** Fix the axes so they don't jump as the data changes. */
  xDomain?: [number, number];
  yDomain?: [number, number];
  /** Draw a vertical segment from each point to the first line. */
  showResiduals?: boolean;
  /** Horizontal rule, e.g. y = 0 on a residual plot or the mean of y. */
  hLine?: { y: number; color?: string; dashed?: boolean; label?: string };
  formatX?: (v: number) => string;
  formatY?: (v: number) => string;
  /** Enables dragging the point with this id; reports data coordinates. */
  draggableId?: number | string;
  onDrag?: (x: number, y: number) => void;
  className?: string;
}

const TONE_FILL: Record<NonNullable<PlotPoint['tone']>, string> = {
  default: '#1A1A1A',
  accent: '#E67E22',
  good: '#27AE60',
  bad: '#C0392B',
  muted: '#B9B3A9',
};

const niceTicks = (min: number, max: number, count = 5): number[] => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min];
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-6; t += step) ticks.push(t);
  return ticks;
};

const pad = ([min, max]: [number, number]): [number, number] => {
  if (min === max) return [min - 1, max + 1];
  const margin = (max - min) * 0.06;
  return [min - margin, max + margin];
};

/**
 * Shared scatter plot: points, fitted lines, arbitrary curves, residual drops
 * and an optionally draggable point. Every module's plots go through this so
 * they read as one chart system and only get fixed once.
 */
export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  points,
  lines = [],
  curves = [],
  xLabel,
  yLabel,
  height = 260,
  xDomain,
  yDomain,
  showResiduals = false,
  hLine,
  formatX = (v) => String(Math.round(v * 100) / 100),
  formatY = (v) => String(Math.round(v * 100) / 100),
  draggableId,
  onDrag,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // A fixed viewBox keeps the drawing resolution-independent; the SVG scales
  // to its container via CSS.
  const W = 460;
  const H = height;
  const M = { top: 12, right: 14, bottom: 34, left: 52 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;

  const [xMin, xMax] = useMemo(() => {
    if (xDomain) return xDomain;
    const xs = points.map((p) => p.x);
    return pad([Math.min(...xs), Math.max(...xs)]);
  }, [points, xDomain]);

  const [yMin, yMax] = useMemo(() => {
    if (yDomain) return yDomain;
    const ys = points.map((p) => p.y);
    return pad([Math.min(...ys), Math.max(...ys)]);
  }, [points, yDomain]);

  const sx = useCallback((x: number) => M.left + ((x - xMin) / (xMax - xMin)) * iw, [xMin, xMax, iw, M.left]);
  const sy = useCallback((y: number) => M.top + ih - ((y - yMin) / (yMax - yMin)) * ih, [yMin, yMax, ih, M.top]);

  const clip = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggableId === undefined || !onDrag || !svgRef.current || e.buttons === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    // Map client pixels back through the viewBox to data coordinates.
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const x = xMin + ((clip(px, M.left, M.left + iw) - M.left) / iw) * (xMax - xMin);
    const y = yMin + ((M.top + ih - clip(py, M.top, M.top + ih)) / ih) * (yMax - yMin);
    onDrag(x, y);
  };

  const xTicks = niceTicks(xMin, xMax, 5);
  const yTicks = niceTicks(yMin, yMax, 5);
  const firstLine = lines[0];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full select-none ${draggableId !== undefined ? 'touch-none cursor-grab' : ''} ${className}`}
      onPointerMove={handlePointerMove}
      role="img"
      aria-label={`${yLabel ?? 'y'} against ${xLabel ?? 'x'}`}
    >
      {/* Gridlines */}
      {yTicks.map((t) => (
        <line
          key={`gy${t}`}
          x1={M.left}
          x2={M.left + iw}
          y1={sy(t)}
          y2={sy(t)}
          stroke="#1A1A1A"
          strokeOpacity={0.07}
        />
      ))}

      {/* Axes */}
      <line x1={M.left} x2={M.left + iw} y1={M.top + ih} y2={M.top + ih} stroke="#1A1A1A" strokeOpacity={0.35} />
      <line x1={M.left} x2={M.left} y1={M.top} y2={M.top + ih} stroke="#1A1A1A" strokeOpacity={0.35} />

      {xTicks.map((t) => (
        <text
          key={`tx${t}`}
          x={sx(t)}
          y={M.top + ih + 14}
          textAnchor="middle"
          className="fill-[#767676]"
          style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
        >
          {formatX(t)}
        </text>
      ))}
      {yTicks.map((t) => (
        <text
          key={`ty${t}`}
          x={M.left - 6}
          y={sy(t) + 3}
          textAnchor="end"
          className="fill-[#767676]"
          style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
        >
          {formatY(t)}
        </text>
      ))}

      {xLabel && (
        <text
          x={M.left + iw / 2}
          y={H - 4}
          textAnchor="middle"
          className="fill-[#4A4A4A]"
          style={{ fontSize: 10, fontWeight: 600 }}
        >
          {xLabel}
        </text>
      )}
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

      {/* Residual drops sit under the points */}
      {showResiduals && firstLine && (
        <g strokeOpacity={0.5} strokeWidth={0.8}>
          {points.map((p, i) => {
            const yHat = firstLine.slope * p.x + firstLine.intercept;
            return (
              <line
                key={`r${p.id ?? i}`}
                x1={sx(p.x)}
                x2={sx(p.x)}
                y1={sy(p.y)}
                y2={sy(clip(yHat, yMin, yMax))}
                stroke={p.y >= yHat ? '#27AE60' : '#C0392B'}
              />
            );
          })}
        </g>
      )}

      {hLine && (
        <line
          x1={M.left}
          x2={M.left + iw}
          y1={sy(hLine.y)}
          y2={sy(hLine.y)}
          stroke={hLine.color ?? '#767676'}
          strokeWidth={1.2}
          strokeDasharray={hLine.dashed === false ? undefined : '4 3'}
        />
      )}

      {curves.map((curve, ci) => (
        <polyline
          key={`c${ci}`}
          fill="none"
          stroke={curve.color ?? '#2980B9'}
          strokeWidth={curve.width ?? 2}
          strokeDasharray={curve.dashed ? '5 4' : undefined}
          points={curve.points
            .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
            .map(([x, y]) => `${sx(x)},${sy(clip(y, yMin - 1e6, yMax + 1e6))}`)
            .join(' ')}
          clipPath="url(#plot-clip)"
        />
      ))}

      <defs>
        <clipPath id="plot-clip">
          <rect x={M.left} y={M.top} width={iw} height={ih} />
        </clipPath>
      </defs>

      {lines.map((line, li) => {
        const y1 = line.slope * xMin + line.intercept;
        const y2 = line.slope * xMax + line.intercept;
        return (
          <line
            key={`l${li}`}
            x1={sx(xMin)}
            x2={sx(xMax)}
            y1={sy(y1)}
            y2={sy(y2)}
            stroke={line.color ?? '#E67E22'}
            strokeWidth={line.width ?? 2}
            strokeDasharray={line.dashed ? '5 4' : undefined}
            clipPath="url(#plot-clip)"
          />
        );
      })}

      {/* Points last so they sit on top */}
      {points.map((p, i) => {
        const isDraggable = draggableId !== undefined && p.id === draggableId;
        return (
          <circle
            key={p.id ?? i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={p.radius ?? (isDraggable ? 6 : 2.6)}
            fill={TONE_FILL[p.tone ?? 'default']}
            fillOpacity={p.tone === 'muted' ? 0.5 : isDraggable ? 1 : 0.62}
            stroke={isDraggable ? '#FFFFFF' : undefined}
            strokeWidth={isDraggable ? 1.5 : undefined}
            style={isDraggable ? { cursor: 'grab' } : undefined}
          >
            {p.label && <title>{p.label}</title>}
          </circle>
        );
      })}
    </svg>
  );
};
