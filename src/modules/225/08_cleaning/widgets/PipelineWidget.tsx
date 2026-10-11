import React, { useState } from 'react';
import { Workflow } from 'lucide-react';
import { WidgetCard, StatChip } from '@kit/components/WidgetCard';
import { Code, MiniTable, Pills } from '../ui';

interface Col {
  key: string;
  label: string;
}
interface State {
  cols: Col[];
  rows: { id: number; v: Record<string, string | null> }[];
}

const RAW_COLS: Col[] = [
  { key: 'created', label: 'Creation Date' },
  { key: 'done', label: 'Completion Date' },
  { key: 'status', label: 'Status' },
  { key: 'addr', label: 'Street Address' },
  { key: 'ward', label: 'Ward' },
];
const RAW_ROWS: (string | null)[][] = [
  ['01/01/2011', '01/05/2011', 'Completed', '  6059 S KOMENSKY AVE', '13'],
  ['01/01/2011', '01/05/2011', 'Completed', '4651 S WASHTENAW AVE ', '12'],
  ['01/02/2011', '01/09/2011', 'Completed', '6200 s massasoit ave', '13'],
  ['01/02/2011', '01/07/2011', 'Completed', '1814 W 43RD ST', null],
  ['01/03/2011', '01/04/2011', 'Completed', '5400 S Pulaski RD', '14'],
];

const RENAMED = ['creation_date', 'completion_date', 'status', 'street_address', 'ward'];
const toDate = (s: string) => {
  const [m, d, y] = s.split('/').map(Number);
  return Date.UTC(y, m - 1, d);
};
const iso = (s: string) => new Date(toDate(s)).toISOString().slice(0, 10);
const title = (s: string) => s.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function build(step: number): State {
  let cols = RAW_COLS.map((c) => ({ ...c }));
  let rows = RAW_ROWS.map((r, id) => ({ id, v: Object.fromEntries(RAW_COLS.map((c, j) => [c.key, r[j]])) as Record<string, string | null> }));
  if (step >= 1) cols = cols.map((c, j) => ({ ...c, label: RENAMED[j] }));
  if (step >= 2) cols = cols.filter((c) => c.key !== 'status');
  if (step >= 3) {
    rows = rows.map((r) => ({
      id: r.id,
      v: {
        ...r.v,
        created: iso(r.v.created!),
        done: iso(r.v.done!),
        days: String((toDate(r.v.done!) - toDate(r.v.created!)) / 86400000),
      },
    }));
    cols = [...cols.slice(0, 2), ...cols.slice(2), { key: 'days', label: 'resolution_days' }];
  }
  if (step >= 4) rows = rows.filter((r) => r.v.ward !== null);
  if (step >= 5) rows = rows.map((r) => ({ id: r.id, v: { ...r.v, addr: title(r.v.addr!) } }));
  return { cols, rows };
}

const STEPS = [
  { label: 'raw', code: 'raw = pd.read_csv(url)' },
  { label: '1 rename', code: 'df = raw.rename(columns=column_map)' },
  { label: '2 drop', code: 'df = df.drop(columns=["status"])   # one value in every row' },
  {
    label: '3 dates',
    code: 'df["creation_date"] = pd.to_datetime(df["creation_date"], format="%m/%d/%Y")\ndf["completion_date"] = pd.to_datetime(df["completion_date"], format="%m/%d/%Y")\ndf["resolution_days"] = (df["completion_date"] - df["creation_date"]).dt.days',
  },
  { label: '4 dropna', code: 'df = df.dropna(subset=["ward"])' },
  { label: '5 strings', code: 'df["street_address"] = df["street_address"].str.strip().str.title()' },
];

export const PipelineWidget: React.FC = () => {
  const [step, setStep] = useState(0);
  const state = build(step);
  const prev = step > 0 ? build(step - 1) : null;

  const text = (v: string | null, col: string) => (v === null ? 'NaN' : col === 'addr' || col === 'status' || (step < 3 && (col === 'created' || col === 'done')) ? `"${v}"` : v);
  const nulls = state.rows.reduce((n, r) => n + state.cols.filter((c) => r.v[c.key] == null).length, 0);

  return (
    <WidgetCard icon={Workflow} title="One Step at a Time" subtitle="Five rows of Chicago 311 requests, cleaned in the notebook's order">
      <Pills options={STEPS.map((s, i) => ({ value: i, label: s.label }))} value={step} onChange={setStep} />
      <MiniTable
        columns={state.cols.map((c) => c.label)}
        rows={state.rows.map((r) => state.cols.map((c) => text(r.v[c.key] ?? null, c.key)))}
        tone={(i, j) => {
          const r = state.rows[i];
          const c = state.cols[j];
          if (r.v[c.key] == null) return 'null';
          if (!prev) return 'plain';
          const before = prev.rows.find((p) => p.id === r.id);
          const isNewColumn = !prev.cols.some((p) => p.key === c.key);
          return isNewColumn || !before || before.v[c.key] !== r.v[c.key] ? 'changed' : 'plain';
        }}
      />
      <div className="grid grid-cols-3 gap-2">
        <StatChip label="rows" value={String(state.rows.length)} />
        <StatChip label="columns" value={String(state.cols.length)} />
        <StatChip label="nulls" value={String(nulls)} tone={nulls ? 'bad' : 'good'} />
      </div>
      <Code>{STEPS[step].code}</Code>
    </WidgetCard>
  );
};
