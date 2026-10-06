import React from 'react';

/**
 * Small pieces of widget chrome shared by the 17_2 widgets. They copy the
 * look of the 17_1 widgets (segmented toggles, the "New split" button, the
 * orange-rule callout) so the decks read as one system.
 */

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="block text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
    {children}
  </span>
);

export function Toggle<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 justify-end text-[10px] font-sans">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`px-2 py-0.5 rounded-xs border transition-colors ${
            value === o.value
              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
              : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const ActionButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="text-[11px] font-sans font-medium px-2.5 py-1 bg-[#F5F2ED] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 rounded-sm transition-colors disabled:opacity-40 disabled:hover:bg-[#F5F2ED] disabled:hover:text-[#1A1A1A]"
  >
    {children}
  </button>
);

export const Callout: React.FC<{ tone?: 'accent' | 'good'; children: React.ReactNode }> = ({
  tone = 'accent',
  children,
}) => (
  <div
    className={`p-3 rounded-sm border-l-2 border-y border-r border-[#1A1A1A]/10 ${
      tone === 'good' ? 'bg-[#27AE60]/5 border-l-[#27AE60]' : 'bg-white border-l-[#E67E22]'
    }`}
  >
    <div className="text-[11px] text-[#555555] leading-relaxed">{children}</div>
  </div>
);

export const LegendItem: React.FC<{ color: string; shape?: 'dot' | 'line' | 'dash'; children: React.ReactNode }> = ({
  color,
  shape = 'dot',
  children,
}) => (
  <span className="flex items-center gap-1.5 text-[#4A4A4A]">
    {shape === 'dot' && <span className="w-2 h-2 rounded-full" style={{ background: color }} />}
    {shape === 'line' && <span className="w-4 h-0.5" style={{ background: color }} />}
    {shape === 'dash' && <span className="w-4 border-t-2 border-dashed" style={{ borderColor: color }} />}
    {children}
  </span>
);

export const Legend: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-sans">{children}</div>
);

/**
 * Horizontal signed bars with labels — coefficients, CV gains, encodings.
 * `ghost` draws an outline behind the bar (e.g. a feature's solo score).
 */
export const BarList: React.FC<{
  items: { label: string; value: number; ghost?: number; tone?: 'accent' | 'muted' | 'good' | 'bad'; note?: string }[];
  domain: [number, number];
  format?: (v: number) => string;
  labelWidth?: number;
}> = ({ items, domain, format = (v) => v.toFixed(3), labelWidth = 128 }) => {
  const W = 460;
  const rowH = 17;
  const H = items.length * rowH + 6;
  const left = labelWidth;
  const right = W - 52;
  const sx = (v: number) => left + ((Math.max(domain[0], Math.min(domain[1], v)) - domain[0]) / (domain[1] - domain[0])) * (right - left);
  const zero = sx(0);
  const fill = { accent: '#E67E22', muted: '#B9B3A9', good: '#27AE60', bad: '#C0392B' };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      <line x1={zero} x2={zero} y1={0} y2={H} stroke="#1A1A1A" strokeOpacity={0.3} />
      {items.map((it, i) => {
        const y = 3 + i * rowH;
        const x0 = Math.min(zero, sx(it.value));
        const w = Math.abs(sx(it.value) - zero);
        return (
          <g key={it.label}>
            <text
              x={left - 6}
              y={y + 11}
              textAnchor="end"
              className="fill-[#333333]"
              style={{ fontSize: 9.5, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {it.label}
            </text>
            {it.ghost !== undefined && (
              <rect
                x={Math.min(zero, sx(it.ghost))}
                y={y + 2}
                width={Math.abs(sx(it.ghost) - zero)}
                height={rowH - 5}
                fill="none"
                stroke="#1A1A1A"
                strokeOpacity={0.35}
                strokeDasharray="2 2"
              />
            )}
            <rect x={x0} y={y + 4} width={Math.max(w, 0.5)} height={rowH - 9} fill={fill[it.tone ?? 'accent']} />
            <text
              x={right + 4}
              y={y + 11}
              className={it.value === 0 ? 'fill-[#A0A0A0]' : 'fill-[#1A1A1A]'}
              style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {it.note ?? format(it.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
