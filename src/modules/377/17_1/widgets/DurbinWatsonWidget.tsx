import React, { useMemo, useState } from 'react';
import { Waves } from 'lucide-react';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { autocorrelatedDataset, durbinWatson, fit, residuals } from '../stats';

/**
 * Independence is the one LINE assumption a scatter plot cannot show you —
 * it lives in the *order* of the rows. Plotting residuals against their index
 * makes it visible, and the Durbin-Watson statistic scores it.
 */
export const DurbinWatsonWidget: React.FC = () => {
  const [rho, setRho] = useState(0);

  const data = useMemo(() => autocorrelatedDataset(rho), [rho]);
  const f = useMemo(() => fit(data), [data]);
  const resid = useMemo(() => residuals(data, f).map((r) => r[1]), [data, f]);
  const dw = durbinWatson(resid);

  const verdict =
    dw < 1.7
      ? { text: 'positive autocorrelation', tone: 'bad' as const }
      : dw > 2.3
        ? { text: 'negative autocorrelation', tone: 'bad' as const }
        : { text: 'independence plausible', tone: 'good' as const };

  const W = 460;
  const H = 150;
  const maxAbs = Math.max(...resid.map(Math.abs), 1);
  const sx = (i: number) => 34 + (i / (resid.length - 1)) * (W - 48);
  const sy = (e: number) => H / 2 - (e / (maxAbs * 1.1)) * (H / 2 - 12);

  return (
    <WidgetCard
      icon={Waves}
      title="Independence Lives in the Row Order"
      subtitle="Residuals plotted in the sequence the data arrived"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="residuals in order">
        <line x1={34} x2={W - 14} y1={H / 2} y2={H / 2} stroke="#E67E22" strokeWidth={1.2} strokeDasharray="4 3" />
        <polyline
          fill="none"
          stroke="#1A1A1A"
          strokeOpacity={0.45}
          strokeWidth={1}
          points={resid.map((e, i) => `${sx(i)},${sy(e)}`).join(' ')}
        />
        {resid.map((e, i) => (
          <circle key={i} cx={sx(i)} cy={sy(e)} r={2.2} fill={e >= 0 ? '#27AE60' : '#C0392B'} fillOpacity={0.75} />
        ))}
        <text x={34} y={H - 2} className="fill-[#767676]" style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
          row 1
        </text>
        <text x={W - 14} y={H - 2} textAnchor="end" className="fill-[#767676]" style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
          row {resid.length}
        </text>
      </svg>

      <Slider
        label="autocorrelation ρ between consecutive errors"
        value={rho}
        min={-0.9}
        max={0.9}
        step={0.05}
        onChange={setRho}
        display={rho.toFixed(2)}
      />

      <div className="grid grid-cols-2 gap-2">
        <StatChip label="Durbin–Watson" value={dw.toFixed(3)} tone={verdict.tone} hint="2 means no autocorrelation" />
        <StatChip label="verdict" value={verdict.text} tone={verdict.tone} />
      </div>

      {/* The DW scale, drawn to scale */}
      <div className="space-y-1">
        <div className="relative h-6 bg-[#F5F2ED] border border-[#1A1A1A]/10 rounded-sm overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-[#C0392B]/15" style={{ width: '42.5%' }} />
          <div className="absolute inset-y-0 bg-[#27AE60]/20" style={{ left: '42.5%', width: '15%' }} />
          <div className="absolute inset-y-0 right-0 bg-[#C0392B]/15" style={{ width: '42.5%' }} />
          <div
            className="absolute inset-y-0 w-0.5 bg-[#1A1A1A]"
            style={{ left: `${Math.min(100, Math.max(0, (dw / 4) * 100))}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-[#767676]">
          <span>0</span>
          <span>1.7</span>
          <span>2.3</span>
          <span>4</span>
        </div>
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Positive ρ makes residuals cluster in runs — long stretches above the line, then long
        stretches below — and DW falls toward 0. Negative ρ makes them alternate, pushing DW toward
        4. One caution from the notebook: the Auto MPG data scores 0.926, which looks alarming but
        is an artifact of the rows being sorted by model year, not evidence of real autocorrelation.
        Always ask what the row order <em>means</em> before believing this statistic.
      </p>
    </WidgetCard>
  );
};
