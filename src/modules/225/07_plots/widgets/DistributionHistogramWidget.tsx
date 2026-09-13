import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { WidgetCard, Slider, StatChip } from '@kit/components/WidgetCard';
import { calculateMean, calculateStandardDeviation } from '@kit/stats';
import { DistributionHistogram } from '../charts/DistributionHistogram';
import { ChartLegend } from '../charts/Legend';
import { hexForIndex } from '../charts/palette';
import { PENGUINS, PENGUIN_SPECIES } from '../data';
import { numericValues } from '../stats';

export const DistributionHistogramWidget: React.FC = () => {
  const [bins, setBins] = useState(16);
  const allFlippers = useMemo(() => numericValues(PENGUINS, 'flipper_length_mm'), []);
  const mean = calculateMean(allFlippers);
  const sd = calculateStandardDeviation(allFlippers, true);

  return (
    <WidgetCard
      icon={BarChart3}
      title="sns.histplot(data=penguins, x='flipper_length_mm', hue='species')"
      subtitle="One numeric variable, split by species"
    >
      <DistributionHistogram
        rows={PENGUINS}
        xKey="flipper_length_mm"
        hueKey="species"
        hueCategories={PENGUIN_SPECIES}
        bins={bins}
        xLabel="Flipper Length (mm)"
      />
      <ChartLegend items={PENGUIN_SPECIES.map((s, i) => ({ label: s, color: hexForIndex(i) }))} />
      <Slider label="bins" value={bins} min={6} max={30} onChange={setBins} />
      <div className="grid grid-cols-3 gap-2">
        <StatChip label="n" value={String(allFlippers.length)} />
        <StatChip label="Mean" value={`${mean.toFixed(1)} mm`} tone="accent" />
        <StatChip label="Std Dev" value={`${sd.toFixed(1)} mm`} />
      </div>
    </WidgetCard>
  );
};
