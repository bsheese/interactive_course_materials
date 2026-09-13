import React, { useState } from 'react';
import { GripHorizontal } from 'lucide-react';
import { WidgetCard, Slider } from '@kit/components/WidgetCard';
import { CategoricalStrip } from '../charts/CategoricalStrip';
import { ChartLegend } from '../charts/Legend';
import { hexForIndex } from '../charts/palette';
import { PENGUINS, PENGUIN_SEX, PENGUIN_SPECIES } from '../data';

export const StripPlotWidget: React.FC = () => {
  const [jitter, setJitter] = useState(0.25);

  return (
    <WidgetCard
      icon={GripHorizontal}
      title="sns.stripplot(data=penguins, x='species', y='body_mass_g', hue='sex')"
      subtitle="Before you trust the bar, look at the dots behind it"
    >
      <CategoricalStrip
        rows={PENGUINS}
        xKey="species"
        yKey="body_mass_g"
        categories={PENGUIN_SPECIES}
        hueKey="sex"
        hueCategories={PENGUIN_SEX}
        jitter={jitter}
        yLabel="Body Mass (g)"
      />
      <ChartLegend items={PENGUIN_SEX.map((s, i) => ({ label: s, color: hexForIndex(i) }))} />
      <Slider label="jitter" value={jitter} min={0} max={0.4} step={0.05} onChange={setJitter} />
    </WidgetCard>
  );
};
