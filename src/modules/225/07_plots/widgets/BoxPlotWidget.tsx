import React, { useState } from 'react';
import { Box } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { CategoricalBox } from '../charts/CategoricalBox';
import { ChartLegend } from '../charts/Legend';
import { hexForIndex } from '../charts/palette';
import { PENGUINS, PENGUIN_SPECIES } from '../data';

const MEASURES: { key: string; label: string }[] = [
  { key: 'bill_length_mm', label: 'Bill Length (mm)' },
  { key: 'body_mass_g', label: 'Body Mass (g)' },
  { key: 'flipper_length_mm', label: 'Flipper Length (mm)' },
];

export const BoxPlotWidget: React.FC = () => {
  const [measure, setMeasure] = useState(MEASURES[0].key);
  const label = MEASURES.find((m) => m.key === measure)?.label ?? measure;

  return (
    <WidgetCard
      icon={Box}
      title={`sns.boxplot(data=penguins, x='species', y='${measure}')`}
      subtitle="Median, quartiles, whiskers, and outliers past 1.5x IQR"
      action={
        <div className="flex gap-1">
          {MEASURES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMeasure(m.key)}
              className={`px-2 py-1 rounded-sm text-[10px] font-medium border transition-colors ${
                measure === m.key
                  ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                  : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:bg-[#F5F2ED]'
              }`}
            >
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>
      }
    >
      <CategoricalBox rows={PENGUINS} xKey="species" yKey={measure} categories={PENGUIN_SPECIES} yLabel={label} />
      <ChartLegend items={PENGUIN_SPECIES.map((s, i) => ({ label: s, color: hexForIndex(i) }))} />
    </WidgetCard>
  );
};
