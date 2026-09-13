import React, { useState } from 'react';
import { Waves } from 'lucide-react';
import { WidgetCard, Slider } from '@kit/components/WidgetCard';
import { CategoricalViolin } from '../charts/CategoricalViolin';
import { ChartLegend } from '../charts/Legend';
import { hexForIndex } from '../charts/palette';
import { PENGUINS, PENGUIN_SPECIES } from '../data';

export const ViolinPlotWidget: React.FC = () => {
  const [bwAdjust, setBwAdjust] = useState(1.0);

  return (
    <WidgetCard
      icon={Waves}
      title="sns.violinplot(data=penguins, x='species', y='body_mass_g')"
      subtitle="A boxplot fused with a rotated density curve"
    >
      <CategoricalViolin
        rows={PENGUINS}
        xKey="species"
        yKey="body_mass_g"
        categories={PENGUIN_SPECIES}
        bwAdjust={bwAdjust}
        yLabel="Body Mass (g)"
      />
      <ChartLegend items={PENGUIN_SPECIES.map((s, i) => ({ label: s, color: hexForIndex(i) }))} />
      <Slider
        label="bw_adjust (KDE smoothing)"
        value={bwAdjust}
        min={0.3}
        max={2.5}
        step={0.1}
        display={bwAdjust.toFixed(1)}
        onChange={setBwAdjust}
      />
    </WidgetCard>
  );
};
