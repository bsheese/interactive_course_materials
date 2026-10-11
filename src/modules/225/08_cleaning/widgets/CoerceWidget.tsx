import React, { useState } from 'react';
import { Binary } from 'lucide-react';
import { WidgetCard, StatChip } from '@kit/components/WidgetCard';
import { Code, MiniTable, Pills, Readout } from '../ui';

const RAW = ['22', '35', 'unknown', '41', '28', 'N/A', '7'];

type View = 'text' | 'raise' | 'coerce';

const asNumber = (s: string) => (s.trim() !== '' && Number.isFinite(Number(s)) ? Number(s) : null);

export const CoerceWidget: React.FC = () => {
  const [view, setView] = useState<View>('text');

  const nums = RAW.map(asNumber);
  const firstBad = RAW.findIndex((s) => asNumber(s) === null);

  const display: string[] =
    view === 'text' ? RAW.map((s) => `"${s}"`) : view === 'raise' ? RAW.map((s) => `"${s}"`) : nums.map((n) => (n === null ? 'NaN' : n.toFixed(1)));

  const sorted =
    view === 'coerce'
      ? nums.filter((n): n is number => n !== null).sort((a, b) => a - b).map((n) => n.toFixed(0))
      : [...RAW].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).map((s) => `"${s}"`);

  const code = {
    text: 'ages_raw.sort_values()',
    raise: 'pd.to_numeric(ages_raw)',
    coerce: 'pd.to_numeric(ages_raw, errors="coerce").sort_values()',
  }[view];

  return (
    <WidgetCard icon={Binary} title="Seven Ages, Two of Them Not Numbers" subtitle="What to_numeric does with text it cannot read">
      <Pills
        options={[
          { value: 'text' as View, label: 'as read (object)' },
          { value: 'raise' as View, label: 'to_numeric()' },
          { value: 'coerce' as View, label: 'errors="coerce"' },
        ]}
        value={view}
        onChange={setView}
      />
      <MiniTable
        columns={[view === 'coerce' ? 'age  (float64)' : 'age  (object)']}
        rows={display.map((d) => [d])}
        tone={(i) => (view === 'coerce' ? (nums[i] === null ? 'null' : 'plain') : view === 'raise' && i === firstBad ? 'flag' : 'plain')}
      />
      {view === 'raise' ? (
        <Readout>
          <span className="font-mono text-[#C0392B]">ValueError: Unable to parse string "{RAW[firstBad]}" at position {firstBad}</span>
        </Readout>
      ) : (
        <div className="space-y-2">
          <StatChip label="NaN count" value={view === 'coerce' ? String(nums.filter((n) => n === null).length) : '0'} />
          <Readout>
            Sorted: <span className="font-mono font-bold text-[#1A1A1A]">{sorted.join('  ')}</span>
            {view === 'text' && ' (text order puts "7" after "41", because "7" follows "4" character by character)'}
          </Readout>
        </div>
      )}
      <Code>{code}</Code>
    </WidgetCard>
  );
};
