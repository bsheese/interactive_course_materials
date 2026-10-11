import React from 'react';

/**
 * The small amount of widget chrome the 08 widgets share. Every widget is one
 * row of controls, one table or chart, and one line of code, so that is all
 * this file provides.
 */

export function Pills<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 rounded-sm text-[10px] font-medium border transition-colors ${
            value === o.value
              ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
              : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:bg-[#F5F2ED]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Code: React.FC<{ children: string }> = ({ children }) => (
  <pre className="bg-[#1A1A1A] text-[#ECE8E1] rounded-sm p-3 text-[10px] font-mono overflow-x-auto whitespace-pre">
    {children}
  </pre>
);

export type CellTone = 'plain' | 'flag' | 'changed' | 'dropped' | 'null';

const CELL_TONE: Record<CellTone, string> = {
  plain: 'text-[#1A1A1A]',
  flag: 'bg-[#E67E22]/15 text-[#1A1A1A]',
  changed: 'bg-[#27AE60]/15 text-[#1A1A1A]',
  dropped: 'text-[#A0A0A0] line-through',
  null: 'text-[#C0392B]',
};

/**
 * A pandas-looking table. Cells are strings so the widget decides exactly how
 * a value is shown (quotes around strings, NaN, whitespace); `tone` marks the
 * cells worth looking at.
 */
export const MiniTable: React.FC<{
  columns: string[];
  rows: string[][];
  tone?: (row: number, col: number) => CellTone;
  rowTone?: (row: number) => 'dropped' | 'plain';
  caption?: string;
}> = ({ columns, rows, tone, rowTone, caption }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-[11px] font-mono border-collapse">
      <thead>
        <tr className="border-b border-[#1A1A1A]/20">
          <th className="w-6 py-1 pr-2 text-left text-[#A0A0A0] font-normal" />
          {columns.map((c) => (
            <th key={c} className="py-1 px-2 text-left font-bold text-[#1A1A1A] whitespace-nowrap">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const dropped = rowTone?.(i) === 'dropped';
          return (
            <tr key={i} className={`border-b border-[#1A1A1A]/5 ${dropped ? 'opacity-45' : ''}`}>
              <td className="py-1 pr-2 text-[#A0A0A0]">{i}</td>
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={`py-1 px-2 whitespace-pre ${
                    CELL_TONE[dropped ? 'dropped' : (tone?.(i, j) ?? 'plain')]
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
    {caption && <p className="mt-2 text-[10px] text-[#767676]">{caption}</p>}
  </div>
);

/** One short sentence under a widget; the only prose a widget carries. */
export const Readout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-[#4A4A4A] leading-relaxed">{children}</p>
);

export const NAN = 'NaN';
