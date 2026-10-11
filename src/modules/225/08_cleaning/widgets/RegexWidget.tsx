import React, { useState } from 'react';
import { Regex } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { Code, Pills, Readout } from '../ui';

type Mode = 'replace' | 'test' | 'extract';

interface Preset {
  key: string;
  label: string;
  mode: Mode;
  pattern: string;
  strings: string[];
  says: string;
}

const PRESETS: Preset[] = [
  {
    key: 'digits',
    label: 'Phone: keep digits',
    mode: 'replace',
    pattern: '[^\\d]',
    strings: ['(555) 867-5309', '555.867.5309', '555-867-5309', '5558675309', 'not a phone'],
    says: '[^\\d] means any character that is not a digit. Each highlighted character is deleted, which leaves the ten digits and turns the last string into an empty one.',
  },
  {
    key: 'valid',
    label: 'Phone: validate',
    mode: 'test',
    pattern: '\\d{10}',
    strings: ['5558675309', '55586753091', '8675309', '5558675309x'],
    says: 'Without anchors, \\d{10} is satisfied by any ten digits in a row, even inside a longer string. Tick the box and only an exact ten digits passes.',
  },
  {
    key: 'currency',
    label: 'Currency: strip symbols',
    mode: 'replace',
    pattern: '[^\\d.]',
    strings: ['$71.28', '£7.25', '22.00', '$512.33'],
    says: '[^\\d.] keeps digits and the decimal point and removes everything else, so pd.to_numeric can finish the job.',
  },
  {
    key: 'groups',
    label: 'Name: capture groups',
    mode: 'extract',
    pattern: '^(?P<title>\\w+)\\.\\s+(?P<first>\\w+)',
    strings: ['Mr. Owen Harris Braund', 'Miss. Laina Heikkinen', 'Master. Gosta Leonard Palsson', 'the Countess. of Rothes'],
    says: 'Each named group becomes a column. The last string does not start with a single word and a period, so it matches nothing.',
  },
];

/** Python's (?P<name>…) is spelled (?<name>…) in JavaScript. */
const toJs = (p: string) => p.replace(/\(\?P</g, '(?<');

export const RegexWidget: React.FC = () => {
  const [key, setKey] = useState(PRESETS[0].key);
  const preset = PRESETS.find((p) => p.key === key)!;
  const [patterns, setPatterns] = useState<Record<string, string>>(() => Object.fromEntries(PRESETS.map((p) => [p.key, p.pattern])));
  const [anchored, setAnchored] = useState(false);

  const pattern = patterns[key];
  const effective = preset.mode === 'test' && anchored ? `^${pattern}$` : pattern;

  let re: RegExp | null = null;
  let error = '';
  try {
    re = new RegExp(toJs(effective), 'g');
  } catch (e) {
    error = (e as Error).message;
  }

  const cell = (s: string) => {
    if (!re) return { shown: <>{s}</>, result: '' };
    const parts: React.ReactNode[] = [];
    let last = 0;
    let cleaned = '';
    let first: RegExpExecArray | null = null;
    let any = false;
    re.lastIndex = 0;
    for (let m = re.exec(s); m; m = re.exec(s)) {
      if (m[0] === '') {
        re.lastIndex++;
        continue;
      }
      any = true;
      first ??= m;
      parts.push(<span key={`t${last}`}>{s.slice(last, m.index)}</span>);
      parts.push(
        <mark key={`m${m.index}`} className="bg-[#E67E22]/30 text-[#1A1A1A] rounded-[2px]">
          {m[0]}
        </mark>,
      );
      cleaned += s.slice(last, m.index);
      last = m.index + m[0].length;
    }
    parts.push(<span key="rest">{s.slice(last)}</span>);
    cleaned += s.slice(last);

    let result = '';
    if (preset.mode === 'replace') result = `"${cleaned}"`;
    else if (preset.mode === 'test') result = any ? 'True' : 'False';
    else result = first?.groups ? Object.entries(first.groups).map(([k, v]) => `${k}="${v}"`).join('  ') : 'NaN';
    return { shown: <>{parts}</>, result };
  };

  const code =
    preset.mode === 'replace'
      ? `s.str.replace(r"${pattern}", "", regex=True)`
      : preset.mode === 'test'
        ? `s.str.contains(r"${effective}")`
        : `s.str.extract(r"${pattern}")`;

  return (
    <WidgetCard icon={Regex} title="A Pattern Tester" subtitle="Edit the pattern and see which characters it matches">
      <Pills
        options={PRESETS.map((p) => ({ value: p.key, label: p.label }))}
        value={key}
        onChange={(k) => {
          setKey(k);
          setAnchored(false);
        }}
      />
      <div className="flex items-center gap-3">
        <input
          value={pattern}
          onChange={(e) => setPatterns((p) => ({ ...p, [key]: e.target.value }))}
          spellCheck={false}
          aria-label="regular expression"
          className="flex-1 min-w-0 font-mono text-xs border border-[#1A1A1A]/15 rounded-sm px-2 py-1.5 bg-white text-[#1A1A1A]"
        />
        {preset.mode === 'test' && (
          <label className="flex items-center gap-1.5 text-[11px] text-[#4A4A4A] whitespace-nowrap">
            <input type="checkbox" checked={anchored} onChange={(e) => setAnchored(e.target.checked)} className="accent-[#E67E22]" />
            add ^ and $
          </label>
        )}
      </div>
      {error ? (
        <Readout>
          <span className="font-mono text-[#C0392B]">{error}</span>
        </Readout>
      ) : (
        <table className="w-full text-[11px] font-mono border-collapse">
          <tbody>
            {preset.strings.map((s) => {
              const { shown, result } = cell(s);
              return (
                <tr key={s} className="border-b border-[#1A1A1A]/5">
                  <td className="py-1.5 pr-3 whitespace-pre text-[#1A1A1A]">{shown}</td>
                  <td className="py-1.5 text-right font-bold text-[#1A1A1A] whitespace-pre">{result}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <Readout>{preset.says}</Readout>
      <Code>{code}</Code>
    </WidgetCard>
  );
};
