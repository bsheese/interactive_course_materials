import React, { useState } from 'react';
import { SearchCheck } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { MiniTable, Pills, Readout } from '../ui';

type Category = 'all' | 'types' | 'missing' | 'format' | 'structure' | 'dates';

const COLUMNS = ['pclass', 'name', 'sex', 'age', 'fare', 'sailed'];

/** Strings exactly as pandas would show them; null is a missing value. */
const ROWS: (string | number | null)[][] = [
  [3, 'Mr. Owen Harris Braund', 'male', 22, '$7.25', '04/10/1912'],
  [1, 'Mrs. John Bradley Cumings', 'Female', 38, '$71.28', '04/10/1912'],
  [3, 'Miss. Laina Heikkinen', 'female', null, '$7.93', '04/11/1912'],
  [1, 'Mrs. Jacques Heath Futrelle', ' female', 35, '$53.10', '04/10/1912'],
  [3, 'Mr. William Henry Allen', 'MALE', 35, '$8.05', '04/12/1912'],
  [2, 'Mr. James Moran', 'male', null, '$8.46', '04/10/1912'],
];

const CATEGORIES: { value: Category; label: string; says: string }[] = [
  { value: 'all', label: 'All five', says: 'Every highlighted cell is something pandas will not fix for you. Pick a category to see its cells on their own.' },
  { value: 'types', label: 'Wrong types', says: 'pclass is a label stored as a number, and fare is text because of the dollar sign. Tools: astype, pd.to_numeric.' },
  { value: 'missing', label: 'Missing values', says: 'Two ages are blank. Tools: isnull, dropna, fillna, interpolate.' },
  { value: 'format', label: 'Inconsistent format', says: 'Female, female, " female" and MALE would all count as different groups. Tools: the .str methods.' },
  { value: 'structure', label: 'Structural', says: 'Each name packs a title, given names and a surname into one cell. Tools: str.split, str.extract.' },
  { value: 'dates', label: 'Date encoding', says: 'sailed is text, so it sorts alphabetically and cannot be subtracted. Tools: pd.to_datetime.' },
];

const categoryOf = (row: number, col: number): Exclude<Category, 'all'> | null => {
  const v = ROWS[row][col];
  if (v === null) return 'missing';
  if (col === 0 || col === 4) return 'types';
  if (col === 1) return 'structure';
  if (col === 2 && v !== 'male' && v !== 'female') return 'format';
  if (col === 5) return 'dates';
  return null;
};

const show = (v: string | number | null) => (v === null ? 'NaN' : typeof v === 'string' ? `"${v}"` : String(v));

export const MessyTableWidget: React.FC = () => {
  const [cat, setCat] = useState<Category>('all');

  return (
    <WidgetCard icon={SearchCheck} title="Six Passengers, Five Kinds of Mess" subtitle="Choose a category to highlight its cells">
      <Pills options={CATEGORIES.map(({ value, label }) => ({ value, label }))} value={cat} onChange={setCat} />
      <MiniTable
        columns={COLUMNS}
        rows={ROWS.map((r) => r.map(show))}
        tone={(i, j) => {
          const c = categoryOf(i, j);
          return c && (cat === 'all' || cat === c) ? 'flag' : 'plain';
        }}
      />
      <Readout>{CATEGORIES.find((c) => c.value === cat)!.says}</Readout>
    </WidgetCard>
  );
};
