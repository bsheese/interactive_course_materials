import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { Code, Pills } from '../ui';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const TEMPS: (number | null)[] = [32, null, null, 55, 67, 75, null, 73, 65, 50, 40, 34];

type Method = 'none' | 'ffill' | 'bfill' | 'interpolate' | 'mean';

const METHODS: { value: Method; label: string; code: string }[] = [
  { value: 'none', label: 'no fill', code: 'temps' },
  { value: 'ffill', label: 'ffill()', code: 'temps.ffill()' },
  { value: 'bfill', label: 'bfill()', code: 'temps.bfill()' },
  { value: 'interpolate', label: 'interpolate()', code: 'temps.interpolate()' },
  { value: 'mean', label: 'fillna(mean)', code: 'temps.fillna(temps.mean())' },
];

function fill(method: Method): (number | null)[] {
  const out = [...TEMPS];
  const known = TEMPS.filter((v): v is number => v !== null);
  const mean = known.reduce((a, b) => a + b, 0) / known.length;
  for (let i = 0; i < out.length; i++) {
    if (TEMPS[i] !== null || method === 'none') continue;
    let lo = i - 1;
    while (lo >= 0 && TEMPS[lo] === null) lo--;
    let hi = i + 1;
    while (hi < TEMPS.length && TEMPS[hi] === null) hi++;
    if (method === 'ffill') out[i] = lo >= 0 ? TEMPS[lo] : null;
    else if (method === 'bfill') out[i] = hi < TEMPS.length ? TEMPS[hi] : null;
    else if (method === 'mean') out[i] = mean;
    else if (lo >= 0 && hi < TEMPS.length) {
      out[i] = TEMPS[lo]! + ((TEMPS[hi]! - TEMPS[lo]!) * (i - lo)) / (hi - lo);
    }
  }
  return out;
}

const W = 460;
const H = 190;
const PAD = { l: 34, r: 12, t: 14, b: 24 };
const sx = (i: number) => PAD.l + (i / 11) * (W - PAD.l - PAD.r);
const sy = (v: number) => PAD.t + (1 - (v - 25) / 60) * (H - PAD.t - PAD.b);

export const FillWidget: React.FC = () => {
  const [method, setMethod] = useState<Method>('ffill');
  const filled = fill(method);

  return (
    <WidgetCard icon={TrendingUp} title="Three Gaps, Four Ways to Fill Them" subtitle="Monthly average temperature, °F">
      <Pills options={METHODS.map(({ value, label }) => ({ value, label }))} value={method} onChange={setMethod} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Monthly temperatures with filled gaps">
        {[30, 50, 70].map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} stroke="#1A1A1A" strokeOpacity={0.08} />
            <text x={PAD.l - 6} y={sy(t) + 3} textAnchor="end" className="fill-[#767676]" style={{ fontSize: 9 }}>
              {t}
            </text>
          </g>
        ))}
        {MONTHS.map((m, i) => (
          <text key={i} x={sx(i)} y={H - 8} textAnchor="middle" className="fill-[#767676]" style={{ fontSize: 9 }}>
            {m}
          </text>
        ))}
        <polyline
          fill="none"
          stroke="#E67E22"
          strokeWidth={1.6}
          points={filled.flatMap((v, i) => (v === null ? [] : [`${sx(i)},${sy(v)}`])).join(' ')}
        />
        {filled.map((v, i) =>
          v === null ? (
            <line key={i} x1={sx(i)} x2={sx(i)} y1={PAD.t} y2={H - PAD.b} stroke="#C0392B" strokeOpacity={0.25} strokeDasharray="3 3" />
          ) : TEMPS[i] === null ? (
            <g key={i}>
              <circle cx={sx(i)} cy={sy(v)} r={4.5} fill="white" stroke="#E67E22" strokeWidth={1.8} />
              <text x={sx(i)} y={sy(v) - 9} textAnchor="middle" className="fill-[#E67E22] font-mono font-bold" style={{ fontSize: 9 }}>
                {Number.isInteger(v) ? v : v.toFixed(1)}
              </text>
            </g>
          ) : (
            <circle key={i} cx={sx(i)} cy={sy(v)} r={3.5} fill="#1A1A1A" />
          ),
        )}
      </svg>
      <Code>{METHODS.find((m) => m.value === method)!.code}</Code>
    </WidgetCard>
  );
};
