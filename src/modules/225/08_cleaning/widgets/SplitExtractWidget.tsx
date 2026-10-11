import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { Code, MiniTable, Pills, Readout } from '../ui';

const NAMES = [
  'Mr. Owen Harris Braund',
  'Mrs. John Bradley (Florence Briggs Thayer) Cumings',
  'Miss. Laina Heikkinen',
  'Master. Gosta Leonard Palsson',
  'Lady. (Lucille Christiana Sutherland)Duff Gordon',
  'the Countess. of (Lucy Noel Martha Dyer-Edwards) Rothes',
];

type Method = 'split' | 'extract' | 'named';

const METHODS: { value: Method; label: string; code: string; columns: string[]; run: (n: string) => (string | null)[]; says: string }[] = [
  {
    value: 'split',
    label: 'str.split',
    code: 'df["name"].str.split(". ", expand=True, n=1)',
    columns: ['0', '1'],
    run: (n) => {
      const i = n.indexOf('. ');
      return i < 0 ? [n, null] : [n.slice(0, i), n.slice(i + 2)];
    },
    says: 'Split cuts at the first ". " it finds, so the Countess row comes out as "the Countess", two words, and it keeps whatever follows.',
  },
  {
    value: 'extract',
    label: 'str.extract',
    code: 'df["name"].str.extract(r"(\\w+)\\.")',
    columns: ['0'],
    run: (n) => [n.match(/(\w+)\./)?.[1] ?? null],
    says: 'Extract looks for one word followed by a period, so the Countess row yields "Countess" and drops "the".',
  },
  {
    value: 'named',
    label: 'named groups',
    code: 'df["name"].str.extract(r"^(?P<title>\\w+)\\.\\s+(?P<first>\\w+)")',
    columns: ['title', 'first'],
    run: (n) => {
      const m = n.match(/^(?<title>\w+)\.\s+(?<first>\w+)/);
      return [m?.groups?.title ?? null, m?.groups?.first ?? null];
    },
    says: 'Anchoring the pattern with ^ is stricter. It names its columns, and it returns NaN for the two names that do not start with "Word. ".',
  },
];

export const SplitExtractWidget: React.FC = () => {
  const [method, setMethod] = useState<Method>('split');
  const m = METHODS.find((x) => x.value === method)!;
  const results = NAMES.map((n) => m.run(n));

  return (
    <WidgetCard icon={Scissors} title="Pulling the Title Out of a Name" subtitle="The same six names, three different tools">
      <Pills options={METHODS.map(({ value, label }) => ({ value, label }))} value={method} onChange={setMethod} />
      <MiniTable
        columns={['name', ...m.columns]}
        rows={NAMES.map((n, i) => [n, ...results[i].map((v) => (v === null ? 'NaN' : `"${v}"`))])}
        tone={(i, j) => (j > 0 && results[i][j - 1] === null ? 'null' : j > 0 ? 'changed' : 'plain')}
      />
      <Readout>{m.says}</Readout>
      <Code>{m.code}</Code>
    </WidgetCard>
  );
};
