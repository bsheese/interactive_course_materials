import React, { useMemo } from 'react';
import type { Row } from '../stats';
import { correlationMatrix } from '../stats';
import { hexForCorrelation } from './palette';

interface CorrelationHeatmapProps {
  rows: Row[];
  columns: { key: string; label: string }[];
  maskUpper: boolean;
  height?: number;
}

/** Pearson's r for every pair of numeric columns, colour-encoded and
 *  annotated — `sns.heatmap(df.corr(), annot=True)`. */
export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ rows, columns, maskUpper, height = 300 }) => {
  const matrix = useMemo(() => correlationMatrix(rows, columns.map((c) => c.key)), [rows, columns]);

  const n = columns.length;
  const W = 460;
  const H = height;
  const M = { top: 8, right: 10, bottom: 22, left: 96 };
  const gridSize = Math.min(W - M.left - M.right, H - M.top - M.bottom);
  const cell = gridSize / n;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="correlation heatmap">
      {columns.map((colLabel, row) =>
        columns.map((_, col) => {
          if (maskUpper && col > row) return null;
          const r = matrix[row][col];
          const x = M.left + col * cell;
          const y = M.top + row * cell;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width={cell} height={cell} fill={hexForCorrelation(r)} stroke="#F5F2ED" strokeWidth={1.5} />
              <text
                x={x + cell / 2}
                y={y + cell / 2 + 3}
                textAnchor="middle"
                className="fill-[#1A1A1A]"
                style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: Math.abs(r) > 0.6 ? 700 : 400 }}
              >
                {r.toFixed(2)}
              </text>
            </g>
          );
        })
      )}

      {columns.map((c, i) => (
        <text
          key={`row-${c.key}`}
          x={M.left - 6}
          y={M.top + i * cell + cell / 2 + 3}
          textAnchor="end"
          className="fill-[#4A4A4A]"
          style={{ fontSize: 9, fontWeight: 600 }}
        >
          {c.label}
        </text>
      ))}
      {columns.map((c, i) => (
        <text
          key={`col-${c.key}`}
          x={M.left + i * cell + cell / 2}
          y={M.top + gridSize + 11}
          textAnchor="middle"
          className="fill-[#4A4A4A]"
          style={{ fontSize: 9, fontWeight: 600 }}
        >
          {c.label.split(' ')[0]}
        </text>
      ))}
    </svg>
  );
};
