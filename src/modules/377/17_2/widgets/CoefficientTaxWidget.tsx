import React, { useMemo, useState } from 'react';
import { Scale } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { fitPolyRidge, polyMse, wiggleWorld } from '../stats';
import { BarList, Callout, Legend, LegendItem, SectionLabel } from '../ui';

export const POLY_DEGREE = 12;
export const POLY_N = 30;
export const POLY_NOISE = 0.3;
export const POLY_SEED = 1;

const XS = Array.from({ length: 200 }, (_, i) => (i / 199) * 2 * Math.PI);
const TRUTH = XS.map((x) => [x, Math.sin(x)] as [number, number]);

/** Alphas span ten orders of magnitude; print them the way sklearn users read them. */
export const fmtAlpha = (logA: number) => {
  const a = 10 ** logA;
  if (a >= 1) return a.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (a >= 1e-3) return String(Number(a.toPrecision(2)));
  return a.toExponential(0);
};

/**
 * Regularization on the 17_1_6 overfitting world. The model keeps all twelve
 * polynomial columns at every setting; only the tax on coefficient size moves,
 * and with it the wiggle.
 */
export const CoefficientTaxWidget: React.FC = () => {
  const [logA, setLogA] = useState(-8);

  const train = useMemo(() => wiggleWorld(POLY_N, POLY_NOISE, POLY_SEED), []);
  const fresh = useMemo(() => wiggleWorld(400, POLY_NOISE, POLY_SEED + 100), []);

  const model = useMemo(() => fitPolyRidge(train, POLY_DEGREE, 10 ** logA), [train, logA]);
  const curve = XS.map((x) => [x, model.predict(x)] as [number, number]);
  const size = model.coef.reduce((s, c) => s + c * c, 0);
  const maxAbs = Math.max(...model.coef.map(Math.abs));

  return (
    <WidgetCard
      icon={Scale}
      title="A Tax on Coefficient Size"
      subtitle={`sin(x) + noise · ${POLY_N} training points · degree-${POLY_DEGREE} polynomial · Ridge`}
    >
      <ScatterPlot
        points={train.map(([x, y], i) => ({ x, y, id: i }))}
        curves={[
          { points: TRUTH, color: '#27AE60', dashed: true, width: 1.4 },
          { points: curve, color: '#E67E22', width: 2.2 },
        ]}
        xDomain={[0, 2 * Math.PI]}
        yDomain={[-2.2, 2.2]}
        xLabel="x"
        yLabel="y"
        height={210}
      />
      <Legend>
        <LegendItem color="#1A1A1A">training points</LegendItem>
        <LegendItem color="#E67E22" shape="line">fitted curve</LegendItem>
        <LegendItem color="#27AE60" shape="dash">the true sin(x)</LegendItem>
      </Legend>

      <Slider
        label="penalty strength α (log scale)"
        value={logA}
        min={-8}
        max={2}
        step={0.25}
        onChange={setLogA}
        display={`α = ${fmtAlpha(logA)}`}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="training MSE" value={polyMse(model, train).toFixed(3)} />
        <StatChip label="MSE on new data" value={polyMse(model, fresh).toFixed(3)} tone="accent" />
        <StatChip label="Σ β² (the taxed bill)" value={size >= 1000 ? size.toExponential(1) : size.toFixed(1)} />
      </div>

      <div>
        <SectionLabel>The twelve coefficients, x through x¹², on standardized columns</SectionLabel>
        <BarList
          items={model.coef.map((c, i) => ({
            label: i === 0 ? 'x' : `x^${i + 1}`,
            value: c / (maxAbs || 1),
            tone: c >= 0 ? 'accent' : 'muted',
            note: Math.abs(c) >= 1000 ? c.toExponential(1) : c.toFixed(2),
          }))}
          domain={[-1, 1]}
          labelWidth={40}
        />
        <p className="text-[10px] text-[#767676]">
          Bars are scaled to the largest coefficient so their shape stays visible; the numbers on
          the right are the actual values.
        </p>
      </div>

      <Callout>
        At α ≈ 0 this is ordinary least squares, and it buys its tiny training error with enormous
        coefficients of opposite sign that cancel at the training points and swing wildly between
        them. Raising α makes large coefficients expensive. The wiggles go first, because they are
        the costliest thing the model owns, and the curve settles onto the sine. Push α to the far
        right and the tax flattens even the real signal: the model drifts toward predicting the mean.
      </Callout>
    </WidgetCard>
  );
};
