import React, { useState } from 'react';
import { Rows3 } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { CategoricalBar } from '../charts/CategoricalBar';
import { ChartLegend } from '../charts/Legend';
import { hexForIndex } from '../charts/palette';
import { PENGUINS, PENGUIN_SEX, PENGUIN_SPECIES } from '../data';

export const BarPlotWidget: React.FC = () => {
  const [splitBySex, setSplitBySex] = useState(true);

  return (
    <WidgetCard
      icon={Rows3}
      title={`sns.barplot(data=penguins, x='species', y='body_mass_g'${splitBySex ? ", hue='sex'" : ''})`}
      subtitle="Mean estimate with a 95% confidence interval whisker"
      action={
        <button
          onClick={() => setSplitBySex((v) => !v)}
          className={`px-2.5 py-1 rounded-sm text-[10px] font-medium border transition-colors ${
            splitBySex ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:bg-[#F5F2ED]'
          }`}
        >
          hue='sex'
        </button>
      }
    >
      <CategoricalBar
        rows={PENGUINS}
        xKey="species"
        yKey="body_mass_g"
        categories={PENGUIN_SPECIES}
        hueKey={splitBySex ? 'sex' : undefined}
        hueCategories={splitBySex ? PENGUIN_SEX : undefined}
        yLabel="Body Mass (g)"
      />
      {splitBySex && <ChartLegend items={PENGUIN_SEX.map((s, i) => ({ label: s, color: hexForIndex(i) }))} />}
    </WidgetCard>
  );
};
