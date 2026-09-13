import React from 'react';

interface LegendItem {
  label: string;
  color: string;
}

/** Small colour-key row shared by every categorical chart in this module. */
export const ChartLegend: React.FC<{ items: LegendItem[] }> = ({ items }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#4A4A4A]">
    {items.map((item) => (
      <span key={item.label} className="flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
          style={{ backgroundColor: item.color }}
        />
        {item.label}
      </span>
    ))}
  </div>
);
