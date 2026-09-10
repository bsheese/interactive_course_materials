import React, { useMemo, useState } from 'react';
import { Spline } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { GAPMINDER_2007 } from '../data';
import { fit, residuals } from '../stats';
import type { XY } from '../data';

/**
 * The 17_1_5 fix, live: the same 142 countries plotted against GDP and against
 * log(GDP). The scatter improves, but the argument is in the residual plot —
 * the U-shape flattens out.
 */
export const LogTransformWidget: React.FC = () => {
  const [logX, setLogX] = useState(false);

  const raw = useMemo<XY[]>(
    () => GAPMINDER_2007.map((d) => [d.gdp, d.lifeExp] as XY),
    []
  );
  const logged = useMemo<XY[]>(
    () => GAPMINDER_2007.map((d) => [Math.log(d.gdp), d.lifeExp] as XY),
    []
  );

  const data = logX ? logged : raw;
  const f = useMemo(() => fit(data), [data]);
  const resid = useMemo(() => residuals(data, f), [data, f]);

  // Mean residual in each third of fitted values — the U-shape as numbers.
  const thirds = useMemo(() => {
    const sorted = [...resid].sort((a, b) => a[0] - b[0]);
    const size = Math.floor(sorted.length / 3);
    const mean = (rows: XY[]) => rows.reduce((s, r) => s + r[1], 0) / Math.max(1, rows.length);
    return [
      mean(sorted.slice(0, size)),
      mean(sorted.slice(size, 2 * size)),
      mean(sorted.slice(2 * size)),
    ];
  }, [resid]);

  const labelled = useMemo(
    () =>
      data.map(([x, y], i) => ({
        x,
        y,
        id: i,
        label: `${GAPMINDER_2007[i].country}: $${Math.round(GAPMINDER_2007[i].gdp).toLocaleString()}, ${GAPMINDER_2007[i].lifeExp.toFixed(1)} yrs`,
      })),
    [data]
  );

  return (
    <WidgetCard
      icon={Spline}
      title="Bend the Data, Not the Line"
      subtitle="Gapminder 2007 · GDP per capita → life expectancy · n = 142"
      action={
        <button
          onClick={() => setLogX((prev) => !prev)}
          className={`text-[11px] font-sans font-bold px-2.5 py-1 rounded-sm border transition-colors ${
            logX
              ? 'bg-[#27AE60] text-white border-[#27AE60]'
              : 'bg-[#F5F2ED] text-[#1A1A1A] border-[#1A1A1A]/15 hover:bg-[#1A1A1A] hover:text-white'
          }`}
        >
          {logX ? 'x = log(GDP)' : 'x = GDP'}
        </button>
      }
    >
      <ScatterPlot
        points={labelled}
        lines={[{ slope: f.slope, intercept: f.intercept, color: '#E67E22' }]}
        xLabel={logX ? 'log(GDP per capita)' : 'GDP per capita (intl $)'}
        yLabel="life expectancy (years)"
        formatX={(v) => (logX ? v.toFixed(1) : `${Math.round(v / 1000)}k`)}
        height={200}
      />

      <div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
          Residuals — the plot that decides
        </span>
        <ScatterPlot
          points={resid.map(([fitted, e], i) => ({ x: fitted, y: e, id: i }))}
          hLine={{ y: 0, color: '#E67E22' }}
          xLabel="fitted life expectancy"
          yLabel="residual"
          yDomain={[-30, 22]}
          height={160}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="R²" value={f.r2.toFixed(3)} tone={logX ? 'good' : 'bad'} />
        <StatChip
          label="slope"
          value={logX ? `${f.slope.toFixed(2)} yr / log$` : `${(f.slope * 1000).toFixed(2)} yr / $1k`}
          tone="accent"
        />
        <StatChip
          label="residual means (low/mid/high)"
          value={thirds.map((t) => t.toFixed(1)).join(' / ')}
          tone={Math.max(...thirds.map(Math.abs)) > 2 ? 'bad' : 'good'}
          hint="a U-shape shows up as negative, positive, negative (or the reverse)"
        />
      </div>

      <div
        className={`p-3 rounded-sm border-l-2 border-y border-r border-[#1A1A1A]/10 ${
          logX ? 'bg-[#27AE60]/5 border-l-[#27AE60]' : 'bg-[#C0392B]/5 border-l-[#C0392B]'
        }`}
      >
        <p className="text-[11px] text-[#333333] leading-relaxed">
          {logX ? (
            <>
              The residual band is roughly flat now and the U-shape is gone. Why log specifically?
              Because the data shows diminishing returns — the first $1,000 of income buys enormous
              gains in life expectancy, the ten-thousandth buys almost none — and d/dx log(x) = 1/x
              has exactly that shape. Log is the principled choice here, not a lucky guess.
            </>
          ) : (
            <>
              The straight line cuts a curve: it sits below the poorest countries, above the middle,
              and below the richest again. That arc in the residuals breaks <strong>L</strong>, and
              the spread narrows as fitted values rise, which strains <strong>E</strong>. Two of the
              four assumptions are already gone.
            </>
          )}
        </p>
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Linear regression requires linearity in the <em>parameters</em>, not in the variables — so
        transforming x is entirely fair game. And note the honest caveat: R² rose here, but R² is
        not the test. Had we logged <em>y</em> instead, R² would not even be comparable, because it
        would be measured on a different scale. The residual plot is the referee.
      </p>
    </WidgetCard>
  );
};
