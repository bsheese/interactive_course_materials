import React, { useMemo, useState } from 'react';
import { Code2 } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { PENGUINS } from '../data';
import { fit, predict } from '../stats';

type Paradigm = 'sklearn' | 'statsmodels';

/**
 * The same penguins fit, seen through both libraries. The point is that the
 * numbers never move — only the interface and what it chooses to report.
 */
export const TwoParadigmsWidget: React.FC = () => {
  const [paradigm, setParadigm] = useState<Paradigm>('sklearn');
  const [flipper, setFlipper] = useState(200);

  const f = useMemo(() => fit(PENGUINS), []);
  const prediction = predict(f, flipper);

  const points = useMemo(
    () => PENGUINS.map(([x, y], i) => ({ x, y, id: i, tone: 'default' as const })),
    []
  );

  return (
    <WidgetCard
      icon={Code2}
      title="Two Libraries, One Line"
      subtitle="Palmer Penguins · flipper length → body mass · n = 333"
      action={
        <div className="flex bg-[#F5F2ED] border border-[#1A1A1A]/15 rounded-sm p-0.5 text-[11px] font-sans">
          {(['sklearn', 'statsmodels'] as Paradigm[]).map((p) => (
            <button
              key={p}
              onClick={() => setParadigm(p)}
              className={`px-2.5 py-1 rounded-xs transition-colors font-medium ${
                paradigm === p ? 'bg-[#1A1A1A] text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      }
    >
      <ScatterPlot
        points={points}
        lines={[{ slope: f.slope, intercept: f.intercept, color: '#E67E22' }]}
        xLabel="flipper length (mm)"
        yLabel="body mass (g)"
        formatY={(v) => `${Math.round(v / 1000)}k`}
        height={230}
      />

      {paradigm === 'sklearn' ? (
        <div className="space-y-3">
          <pre className="bg-[#1A1A1A] text-[#ECE8E1] text-[10.5px] leading-relaxed p-3 rounded-sm overflow-x-auto font-mono">
{`from sklearn.linear_model import LinearRegression

X = df[["flipper_length_mm"]]     # 2D — the classic beginner trap
y = df["body_mass_g"]

model = LinearRegression().fit(X, y)
model.coef_       # -> [${f.slope.toFixed(4)}]
model.intercept_  # -> ${f.intercept.toFixed(2)}`}
          </pre>

          <div className="bg-[#F5F2ED] border border-[#1A1A1A]/10 rounded-sm p-3 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
              .predict() — the whole point of this library
            </span>
            <label className="block text-xs text-[#4A4A4A]">
              flipper_length_mm ={' '}
              <span className="font-mono font-bold text-[#1A1A1A]">{flipper}</span>
              <input
                type="range"
                min={172}
                max={231}
                value={flipper}
                onChange={(e) => setFlipper(Number(e.target.value))}
                className="w-full mt-1 accent-[#E67E22]"
              />
            </label>
            <p className="font-mono text-xs text-[#333333]">
              predicted body mass ={' '}
              <span className="font-bold text-[#E67E22]">{prediction.toFixed(0)} g</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <pre className="bg-[#1A1A1A] text-[#ECE8E1] text-[10.5px] leading-relaxed p-3 rounded-sm overflow-x-auto font-mono">
{`import statsmodels.api as sm

X = sm.add_constant(df["flipper_length_mm"])   # you add the intercept
y = df["body_mass_g"]

model = sm.OLS(y, X).fit()    # note the order: (y, X)
model.summary()`}
          </pre>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono border border-[#1A1A1A]/10">
              <thead className="bg-[#ECE8E1] text-[#4A4A4A]">
                <tr>
                  {['', 'coef', 'std err', 't', 'P>|t|'].map((h) => (
                    <th key={h} className="py-1.5 px-2 text-right font-sans font-bold text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/10">
                <tr>
                  <td className="py-1.5 px-2 text-left text-[#767676]">const</td>
                  <td className="py-1.5 px-2 text-right">{f.intercept.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">{f.seIntercept.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">
                    {(f.intercept / f.seIntercept).toFixed(2)}
                  </td>
                  <td className="py-1.5 px-2 text-right">0.000</td>
                </tr>
                <tr className="bg-[#E67E22]/5">
                  <td className="py-1.5 px-2 text-left text-[#767676]">flipper</td>
                  <td className="py-1.5 px-2 text-right font-bold text-[#E67E22]">
                    {f.slope.toFixed(4)}
                  </td>
                  <td className="py-1.5 px-2 text-right">{f.seSlope.toFixed(3)}</td>
                  <td className="py-1.5 px-2 text-right">{f.tStat.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">0.000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-[#555555] leading-relaxed">
            Same slope, same intercept — plus standard errors, t-statistics and p-values that
            sklearn simply never computes. Those extra columns are the next three slides.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="slope β₁" value={f.slope.toFixed(2)} tone="accent" hint="grams of body mass per mm of flipper" />
        <StatChip label="intercept β₀" value={f.intercept.toFixed(0)} hint="a zero-length flipper is not a penguin — don't over-read this" />
        <StatChip label="R²" value={f.r2.toFixed(3)} tone="good" />
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Both libraries minimise the same RSS, so both land on the same line — the one the
        closed-form formula from 17_0 already gave you. Choose sklearn to predict, statsmodels to
        explain.
      </p>
    </WidgetCard>
  );
};
