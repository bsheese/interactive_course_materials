import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { WidgetCard, StatChip } from '@kit/components/WidgetCard';
import { Code, MiniTable } from '../ui';

const CITIES = ['  New York  ', 'new york', 'NEW YORK', 'nyc', '  Chicago', 'chicago ', 'Chicago', 'CHICAGO'];

const title = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** Applied in this order whichever steps are switched on. */
const STEPS = [
  { key: 'strip', label: '.str.strip()', run: (s: string) => s.trim() },
  { key: 'lower', label: '.str.lower()', run: (s: string) => s.toLowerCase() },
  { key: 'nyc', label: '.str.replace("nyc", "new york")', run: (s: string) => s.replace(/nyc/g, 'new york') },
  { key: 'title', label: '.str.title()', run: (s: string) => title(s) },
];

export const StringChainWidget: React.FC = () => {
  const [on, setOn] = useState<Record<string, boolean>>({ strip: false, lower: false, nyc: false, title: false });

  const active = STEPS.filter((s) => on[s.key]);
  const cleaned = CITIES.map((c) => active.reduce((acc, s) => s.run(acc), c));
  const distinct = new Set(cleaned).size;

  return (
    <WidgetCard icon={Link2} title="Eight Spellings, Two Cities" subtitle="Switch steps on and watch the distinct values collapse">
      <div className="flex flex-wrap gap-1.5">
        {STEPS.map((s) => (
          <button
            key={s.key}
            onClick={() => setOn((o) => ({ ...o, [s.key]: !o[s.key] }))}
            className={`px-2.5 py-1 rounded-sm text-[10px] font-mono border transition-colors ${
              on[s.key] ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:bg-[#F5F2ED]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <MiniTable
        columns={['raw', 'result']}
        rows={CITIES.map((c, i) => [`"${c}"`, `"${cleaned[i]}"`])}
        tone={(i, j) => (j === 1 && cleaned[i] !== CITIES[i] ? 'changed' : 'plain')}
      />
      <div className="grid grid-cols-2 gap-2">
        <StatChip label="distinct values" value={`${new Set(CITIES).size} → ${distinct}`} tone={distinct === 2 ? 'good' : 'accent'} />
        <StatChip label="steps applied" value={String(active.length)} />
      </div>
      <Code>{active.length ? `cities\n    ${active.map((s) => s.label).join('\n    ')}` : 'cities'}</Code>
    </WidgetCard>
  );
};
