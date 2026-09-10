import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface WidgetCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Rendered at the right of the header — a reset button, a toggle, a stat. */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** The standard widget shell: icon header, optional action, body. */
export const WidgetCard: React.FC<WidgetCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}) => (
  <div className="bg-white border border-[#1A1A1A]/10 rounded-sm shadow-sm overflow-hidden">
    <div className="p-4 border-b border-[#1A1A1A]/10 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-2 bg-[#ECE8E1] rounded-sm border border-[#1A1A1A]/10 shrink-0">
          <Icon className="w-4 h-4 text-[#E67E22]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-serif font-bold text-sm text-[#1A1A1A] leading-snug">{title}</h3>
          {subtitle && <p className="text-xs text-[#666666] leading-snug">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

/** Small labelled statistic, for the readouts under a plot. */
export const StatChip: React.FC<{
  label: string;
  value: string;
  tone?: 'neutral' | 'good' | 'bad' | 'accent';
  hint?: string;
}> = ({ label, value, tone = 'neutral', hint }) => {
  const color = {
    neutral: 'text-[#1A1A1A]',
    good: 'text-[#27AE60]',
    bad: 'text-[#C0392B]',
    accent: 'text-[#E67E22]',
  }[tone];

  return (
    <div
      className="bg-[#F5F2ED] border border-[#1A1A1A]/10 rounded-sm px-2.5 py-1.5 min-w-0"
      title={hint}
    >
      <div className="text-[9px] uppercase tracking-[0.14em] text-[#767676] font-bold truncate">
        {label}
      </div>
      <div className={`font-mono text-sm font-bold ${color} truncate`}>{value}</div>
    </div>
  );
};

/** Labelled range input with a monospace readout. */
export const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  display?: string;
}> = ({ label, value, min, max, step = 1, onChange, display }) => (
  <label className="block">
    <span className="flex items-center justify-between text-xs font-sans text-[#4A4A4A] mb-1">
      <span>{label}</span>
      <span className="font-mono font-bold text-[#1A1A1A]">{display ?? value}</span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#E67E22]"
    />
  </label>
);
