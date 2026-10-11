import React, { useState } from 'react';
import { Eraser } from 'lucide-react';
import { WidgetCard, StatChip } from '@kit/components/WidgetCard';
import { Code, MiniTable, Pills } from '../ui';

const COLUMNS = ['age', 'fare', 'deck', 'embarked'];
const ROWS: (string | number | null)[][] = [
  [22, 7.25, null, 'S'],
  [38, 71.28, 'C85', 'C'],
  [null, 8.05, null, 'S'],
  [35, 53.1, 'C123', 'S'],
  [null, null, null, null],
  [54, 51.86, 'E46', 'S'],
  [27, null, null, null],
];

type Mode = 'default' | 'all' | 'thresh' | 'subset';

const MODES: { value: Mode; label: string; code: string; keep: (r: (string | number | null)[]) => boolean }[] = [
  { value: 'default', label: 'dropna()', code: 'df.dropna()', keep: (r) => r.every((v) => v !== null) },
  { value: 'all', label: 'how="all"', code: 'df.dropna(how="all")', keep: (r) => r.some((v) => v !== null) },
  { value: 'thresh', label: 'thresh=3', code: 'df.dropna(thresh=3)', keep: (r) => r.filter((v) => v !== null).length >= 3 },
  { value: 'subset', label: 'subset=["age"]', code: 'df.dropna(subset=["age"])', keep: (r) => r[0] !== null },
];

export const DropnaWidget: React.FC = () => {
  const [mode, setMode] = useState<Mode>('default');
  const m = MODES.find((x) => x.value === mode)!;
  const kept = ROWS.filter(m.keep).length;

  return (
    <WidgetCard icon={Eraser} title="Which Rows Survive?" subtitle="Seven rows, four columns, and a different rule each time">
      <Pills options={MODES.map(({ value, label }) => ({ value, label }))} value={mode} onChange={setMode} />
      <MiniTable
        columns={COLUMNS}
        rows={ROWS.map((r) => r.map((v) => (v === null ? 'NaN' : String(v))))}
        tone={(i, j) => (ROWS[i][j] === null ? 'null' : 'plain')}
        rowTone={(i) => (m.keep(ROWS[i]) ? 'plain' : 'dropped')}
      />
      <div className="grid grid-cols-2 gap-2">
        <StatChip label="rows kept" value={`${kept} of ${ROWS.length}`} tone="accent" />
        <StatChip label="rows dropped" value={String(ROWS.length - kept)} />
      </div>
      <Code>{m.code}</Code>
    </WidgetCard>
  );
};
