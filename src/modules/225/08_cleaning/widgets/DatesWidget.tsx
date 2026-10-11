import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { Code, MiniTable, Pills, Readout } from '../ui';

const RAW = ['03/04/2022', '12/01/2021', '01/15/2023', '11/30/2021'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type View = 'text' | 'mdy' | 'dmy';

interface Parsed {
  iso: string | null;
  label: string;
}

function parse(s: string, view: Exclude<View, 'text'>): Parsed {
  const [a, b, y] = s.split('/').map(Number);
  const month = view === 'mdy' ? a : b;
  const day = view === 'mdy' ? b : a;
  if (month < 1 || month > 12) return { iso: null, label: `✗ there is no month ${month}` };
  const iso = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { iso, label: `${iso}   (${day} ${MONTH[month - 1]})` };
}

export const DatesWidget: React.FC = () => {
  const [view, setView] = useState<View>('text');

  const parsed = view === 'text' ? null : RAW.map((s) => parse(s, view));
  const order =
    view === 'text'
      ? [...RAW].sort()
      : parsed!.flatMap((p) => (p.iso ? [p.iso] : [])).sort();

  const code = {
    text: 'dates.sort_values()',
    mdy: 'pd.to_datetime(dates, format="%m/%d/%Y").sort_values()',
    dmy: 'pd.to_datetime(dates, format="%d/%m/%Y")',
  }[view];

  return (
    <WidgetCard icon={CalendarDays} title="Four Dates, Three Readings" subtitle="The same strings, read as text, as month/day, and as day/month">
      <Pills
        options={[
          { value: 'text' as View, label: 'as text' },
          { value: 'mdy' as View, label: 'format="%m/%d/%Y"' },
          { value: 'dmy' as View, label: 'format="%d/%m/%Y"' },
        ]}
        value={view}
        onChange={setView}
      />
      <MiniTable
        columns={view === 'text' ? ['date  (object)'] : ['date  (datetime64)']}
        rows={RAW.map((s, i) => [parsed ? parsed[i].label : `"${s}"`])}
        tone={(i) => (parsed && parsed[i].iso === null ? 'null' : parsed && view === 'dmy' ? 'flag' : 'plain')}
      />
      <Readout>
        Sorted: <span className="font-mono font-bold text-[#1A1A1A]">{order.join('   ')}</span>
      </Readout>
      <Readout>
        {view === 'text' && 'Text order starts with the month, so January 2023 comes before November 2021.'}
        {view === 'mdy' && 'The format matches how the strings were written, and the dates now sort in time order.'}
        {view === 'dmy' &&
          'Two strings parse without complaint but are read as 3 April and 12 January instead of 4 March and 1 December. Only the strings with a day above 12 fail, and pandas raises an error for them.'}
      </Readout>
      <Code>{code}</Code>
    </WidgetCard>
  );
};
