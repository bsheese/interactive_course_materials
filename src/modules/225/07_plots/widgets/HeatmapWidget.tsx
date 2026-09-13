import React, { useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { CorrelationHeatmap } from '../charts/CorrelationHeatmap';
import { PENGUINS, PENGUIN_NUMERIC_COLUMNS } from '../data';

const CORR_EXPR = "penguins.select_dtypes('number').corr()";

export const HeatmapWidget: React.FC = () => {
  const [maskUpper, setMaskUpper] = useState(false);

  return (
    <WidgetCard
      icon={Grid3x3}
      title={
        maskUpper
          ? `sns.heatmap(${CORR_EXPR}, annot=True, mask=np.triu(np.ones_like(${CORR_EXPR}, dtype=bool)))`
          : `sns.heatmap(${CORR_EXPR}, annot=True)`
      }
      subtitle="Every pair of numeric columns at once"
      action={
        <button
          onClick={() => setMaskUpper((v) => !v)}
          className={`px-2.5 py-1 rounded-sm text-[10px] font-medium border transition-colors ${
            maskUpper ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:bg-[#F5F2ED]'
          }`}
        >
          mask upper
        </button>
      }
    >
      <CorrelationHeatmap
        rows={PENGUINS}
        columns={PENGUIN_NUMERIC_COLUMNS.map((c) => ({ key: String(c.key), label: c.label }))}
        maskUpper={maskUpper}
      />
    </WidgetCard>
  );
};
