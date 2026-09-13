import React, { useMemo, useState } from 'react';
import { ScatterChart } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { ScatterPlot, type PlotPoint } from '@kit/components/ScatterPlot';
import { ChartLegend } from '../charts/Legend';
import { hexForIndex, toneForIndex } from '../charts/palette';
import { PENGUINS, PENGUIN_SPECIES } from '../data';

export const ScatterPlotWidget: React.FC = () => {
  const [sizeBySex, setSizeBySex] = useState(true);

  const points = useMemo<PlotPoint[]>(() => {
    const masses = PENGUINS.map((p) => p.body_mass_g);
    const minMass = Math.min(...masses);
    const maxMass = Math.max(...masses);
    return PENGUINS.map((p) => ({
      id: p.id,
      x: p.bill_length_mm,
      y: p.flipper_length_mm,
      tone: toneForIndex(PENGUIN_SPECIES.indexOf(p.species)),
      radius: sizeBySex ? 2 + ((p.body_mass_g - minMass) / (maxMass - minMass)) * 5 : 2.8,
      label: `${p.species}, ${p.body_mass_g}g`,
    }));
  }, [sizeBySex]);

  return (
    <WidgetCard
      icon={ScatterChart}
      title={`sns.scatterplot(data=penguins, x='bill_length_mm', y='flipper_length_mm', hue='species'${
        sizeBySex ? ", size='body_mass_g'" : ''
      })`}
      subtitle="Two numeric variables, colour and size carrying a third and fourth"
      action={
        <button
          onClick={() => setSizeBySex((v) => !v)}
          className={`px-2.5 py-1 rounded-sm text-[10px] font-medium border transition-colors ${
            sizeBySex ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:bg-[#F5F2ED]'
          }`}
        >
          size='body_mass_g'
        </button>
      }
    >
      <ScatterPlot points={points} xLabel="Bill Length (mm)" yLabel="Flipper Length (mm)" />
      <ChartLegend items={PENGUIN_SPECIES.map((s, i) => ({ label: s, color: hexForIndex(i) }))} />
    </WidgetCard>
  );
};
