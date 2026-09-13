import React, { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { WidgetCard, StatChip } from '@kit/components/WidgetCard';
import { ScatterPlot, type PlotLine, type PlotPoint } from '@kit/components/ScatterPlot';
import { PENGUINS } from '../data';
import { calculateOLS } from '../stats';

export const RegPlotWidget: React.FC = () => {
  const [showLine, setShowLine] = useState(true);

  const points = useMemo<PlotPoint[]>(
    () => PENGUINS.map((p) => ({ id: p.id, x: p.flipper_length_mm, y: p.body_mass_g })),
    []
  );
  const olsPoints = useMemo(() => PENGUINS.map((p) => ({ x: p.flipper_length_mm, y: p.body_mass_g })), []);
  const ols = useMemo(() => calculateOLS(olsPoints), [olsPoints]);
  const lines = useMemo<PlotLine[]>(
    () => (showLine ? [{ slope: ols.slope, intercept: ols.intercept, label: 'OLS fit' }] : []),
    [showLine, ols]
  );

  return (
    <WidgetCard
      icon={TrendingUp}
      title="sns.regplot(data=penguins, x='flipper_length_mm', y='body_mass_g')"
      subtitle="A scatterplot plus the line scatterplot alone never draws"
      action={
        <button
          onClick={() => setShowLine((v) => !v)}
          className={`px-2.5 py-1 rounded-sm text-[10px] font-medium border transition-colors ${
            showLine ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:bg-[#F5F2ED]'
          }`}
        >
          fit line
        </button>
      }
    >
      <ScatterPlot points={points} lines={lines} xLabel="Flipper Length (mm)" yLabel="Body Mass (g)" />
      <div className="grid grid-cols-2 gap-2">
        <StatChip label="Pearson's r" value={ols.r.toFixed(3)} tone="good" />
        <StatChip label="R²" value={ols.r2.toFixed(3)} tone="accent" />
      </div>
    </WidgetCard>
  );
};
