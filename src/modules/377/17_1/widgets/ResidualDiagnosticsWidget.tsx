import React, { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { fit, residuals, violationDataset } from '../stats';
import type { ViolationKind } from '../stats';

const CASES: { kind: ViolationKind; label: string; verdict: string; broken: string }[] = [
  {
    kind: 'none',
    label: 'Healthy',
    verdict:
      'A horizontal band of noise, centred on zero, with the same thickness everywhere. Nothing to see here — which is exactly what you want to see.',
    broken: 'none',
  },
  {
    kind: 'curved',
    label: 'Curved (L)',
    verdict:
      'The scatter looks passable and R² is respectable, but the residuals arc: positive at the ends, negative in the middle. A straight line is being forced through a bend.',
    broken: 'L — Linearity',
  },
  {
    kind: 'funnel',
    label: 'Funnel (E)',
    verdict:
      'The line is right on average — the residuals are centred on zero everywhere. But their spread fans out, so predictions at high fitted values are far less reliable than at low ones.',
    broken: 'E — Equal Variance',
  },
  {
    kind: 'heavy-tails',
    label: 'Heavy tails (N)',
    verdict:
      'Straight and evenly spread, but a handful of residuals sit far out. The fit is fine; the inference built on normal-theory standard errors is what suffers.',
    broken: 'N — Normality',
  },
];

/**
 * The residual plot as the primary diagnostic. Each case violates exactly one
 * assumption so the signature of that violation is unmistakable — the real
 * datasets in the notebooks break two at once, which is harder to read first.
 */
export const ResidualDiagnosticsWidget: React.FC = () => {
  const [kind, setKind] = useState<ViolationKind>('none');

  const data = useMemo(() => violationDataset(kind), [kind]);
  const f = useMemo(() => fit(data), [data]);
  const resid = useMemo(() => residuals(data, f), [data, f]);

  const active = CASES.find((c) => c.kind === kind)!;

  // Spread of residuals in the low and high thirds of fitted values — the
  // number behind "the funnel is real, not an illusion".
  const spreadRatio = useMemo(() => {
    const sorted = [...resid].sort((a, b) => a[0] - b[0]);
    const third = Math.floor(sorted.length / 3);
    const sd = (rows: typeof sorted) => {
      const vals = rows.map((r) => r[1]);
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      return Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
    };
    const low = sd(sorted.slice(0, third));
    const high = sd(sorted.slice(-third));
    return low === 0 ? 1 : high / low;
  }, [resid]);

  return (
    <WidgetCard
      icon={Activity}
      title="Reading the Residual Plot"
      subtitle="The same straight line, four different worlds"
      action={
        <div className="flex flex-wrap gap-1 justify-end text-[10px] font-sans">
          {CASES.map((c) => (
            <button
              key={c.kind}
              onClick={() => setKind(c.kind)}
              className={`px-2 py-0.5 rounded-xs border transition-colors ${
                kind === c.kind
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                  : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      }
    >
      <div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
          The scatter — where problems hide
        </span>
        <ScatterPlot
          points={data.map(([x, y], i) => ({ x, y, id: i }))}
          lines={[{ slope: f.slope, intercept: f.intercept, color: '#E67E22' }]}
          xLabel="x"
          yLabel="y"
          height={175}
        />
      </div>

      <div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
          The residual plot — where they show up
        </span>
        <ScatterPlot
          points={resid.map(([fitted, e], i) => ({
            x: fitted,
            y: e,
            id: i,
            tone: Math.abs(e) > 3.5 ? ('bad' as const) : ('default' as const),
          }))}
          hLine={{ y: 0, color: '#E67E22' }}
          xLabel="fitted value ŷ"
          yLabel="residual"
          height={175}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="R²" value={f.r2.toFixed(3)} tone={kind === 'curved' ? 'bad' : 'neutral'} />
        <StatChip
          label="spread high ÷ low"
          value={`${spreadRatio.toFixed(1)}×`}
          tone={spreadRatio > 2 ? 'bad' : 'good'}
          hint="residual SD in the top third of fitted values divided by the bottom third"
        />
        <StatChip
          label="assumption broken"
          value={active.broken}
          tone={active.broken === 'none' ? 'good' : 'bad'}
        />
      </div>

      <div
        className={`p-3 rounded-sm border-l-2 border-y border-r border-[#1A1A1A]/10 ${
          kind === 'none' ? 'bg-[#27AE60]/5 border-l-[#27AE60]' : 'bg-[#F5F2ED] border-l-[#E67E22]'
        }`}
      >
        <p className="text-[11px] text-[#333333] leading-relaxed">{active.verdict}</p>
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Notice that R² barely moves between the healthy case and the funnel. A good R² is not
        evidence that the assumptions hold — the residual plot is the diagnostic, and it is the one
        plot worth drawing every single time.
      </p>
    </WidgetCard>
  );
};
