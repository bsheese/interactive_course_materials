import React, { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { fitElasticNet, fitOLS, fitPipeline, mae, mean, rows } from '../linalg';
import { AMES_FOLDS, AMES_LOG_PRICE, AMES_PRICE, AMES_X, FEATURE_LABELS, featureIndex, standardizeColumns } from '../stats';
import { BarList, Callout, Legend, LegendItem, SectionLabel } from '../ui';

const XS = standardizeColumns(AMES_X);
const LOG_ALPHAS = Array.from({ length: 31 }, (_, i) => -4 + (i * 5.5) / 30);

/** The twin features get their own colours so you can watch them share or split credit. */
const STYLE: Record<number, { color: string; dashed?: boolean }> = {
  [featureIndex('garageCars')]: { color: '#E67E22' },
  [featureIndex('garageArea')]: { color: '#E67E22', dashed: true },
  [featureIndex('totalSF')]: { color: '#1A1A1A' },
  [featureIndex('grLivArea')]: { color: '#1A1A1A', dashed: true },
};

/** Honest dollar error: 5-fold CV, scaler inside each fold, predictions exp()'d back to dollars. */
function cvDollarMae(fit: (Xs: number[][], y: number[]) => ReturnType<typeof fitOLS>): number {
  return mean(
    AMES_FOLDS.map(({ train, test }) => {
      const pipe = fitPipeline(rows(AMES_X, train), rows(AMES_LOG_PRICE, train), fit);
      const pred = pipe.predict(rows(AMES_X, test)).map(Math.exp);
      return mae(rows(AMES_PRICE, test), pred);
    })
  );
}

const fmtA = (logA: number) => {
  const a = 10 ** logA;
  return a >= 1 ? a.toFixed(1) : String(Number(a.toPrecision(2)));
};

/**
 * Elastic Net on real Ames features, with l1_ratio as the dial between the
 * two penalties: 0 is Ridge-style shrinkage, 1 is Lasso. The coefficient
 * path shows the whole story at once; the bars show the model at one α.
 */
export const RegularizationPathWidget: React.FC = () => {
  const [l1, setL1] = useState(1);
  const [logA, setLogA] = useState(-2);

  const path = useMemo(() => {
    let warm: number[] | undefined;
    // Walk from strong to weak penalty so each fit starts near the next one's answer.
    const out = [...LOG_ALPHAS].reverse().map((la) => {
      const m = fitElasticNet(XS, AMES_LOG_PRICE, 10 ** la, l1, warm);
      warm = m.coef;
      return { la, coef: m.coef };
    });
    return out.reverse();
  }, [l1]);

  const model = useMemo(() => fitElasticNet(XS, AMES_LOG_PRICE, 10 ** logA, l1), [logA, l1]);
  const kept = model.coef.filter((c) => c !== 0).length;

  const olsMae = useMemo(() => cvDollarMae(fitOLS), []);
  const enMae = useMemo(() => cvDollarMae((X, y) => fitElasticNet(X, y, 10 ** logA, l1)), [logA, l1]);

  return (
    <WidgetCard
      icon={SlidersHorizontal}
      title="Ridge, Lasso and the Dial Between Them"
      subtitle="Ames · 12 standardized features · log price · ElasticNet(alpha, l1_ratio)"
    >
      <div className="grid grid-cols-2 gap-3">
        <Slider
          label="l1_ratio (0 = Ridge, 1 = Lasso)"
          value={l1}
          min={0}
          max={1}
          step={0.1}
          onChange={setL1}
          display={l1 === 0 ? '0 · Ridge' : l1 === 1 ? '1 · Lasso' : l1.toFixed(1)}
        />
        <Slider label="α (log scale)" value={logA} min={-4} max={1.5} step={0.1} onChange={setLogA} display={fmtA(logA)} />
      </div>

      <div>
        <SectionLabel>Coefficient paths: every feature's coefficient as α grows</SectionLabel>
        <ScatterPlot
          points={[]}
          curves={[
            ...FEATURE_LABELS.map((_, j) => ({
              points: path.map((p) => [p.la, p.coef[j]] as [number, number]),
              color: STYLE[j]?.color ?? '#B9B3A9',
              dashed: STYLE[j]?.dashed,
              width: STYLE[j] ? 2 : 1.2,
            })),
            { points: [[logA, -0.05], [logA, 0.16]], color: '#C0392B', dashed: true, width: 1 },
          ]}
          hLine={{ y: 0, color: '#767676' }}
          xDomain={[-4, 1.5]}
          yDomain={[-0.04, 0.15]}
          xLabel="log₁₀ α"
          yLabel="coefficient"
          formatX={(v) => v.toFixed(0)}
          formatY={(v) => v.toFixed(2)}
          height={190}
        />
        <Legend>
          <LegendItem color="#E67E22" shape="line">Garage Cars</LegendItem>
          <LegendItem color="#E67E22" shape="dash">Garage Area</LegendItem>
          <LegendItem color="#1A1A1A" shape="line">Total_Square_Footage</LegendItem>
          <LegendItem color="#1A1A1A" shape="dash">Gr Liv Area</LegendItem>
          <LegendItem color="#C0392B" shape="dash">current α</LegendItem>
        </Legend>
      </div>

      <div>
        <SectionLabel>The model at this α — beta weights on log price</SectionLabel>
        <BarList
          items={model.coef.map((c, j) => ({
            label: FEATURE_LABELS[j],
            value: c,
            tone: c === 0 ? 'muted' : STYLE[j] ? 'accent' : 'good',
            note: c === 0 ? 'dropped' : c.toFixed(3),
          }))}
          domain={[-0.03, 0.14]}
          labelWidth={136}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="features kept" value={`${kept} of 12`} tone={kept < 12 ? 'accent' : 'neutral'} />
        <StatChip label="CV error, this model" value={`$${Math.round(enMae).toLocaleString()}`} tone={enMae <= olsMae ? 'good' : 'bad'} />
        <StatChip label="CV error, plain OLS" value={`$${Math.round(olsMae).toLocaleString()}`} />
      </div>

      <Callout>
        Set l1_ratio to 0 and raise α: every bar shrinks, smoothly and together, and none reaches
        zero. Set it to 1 and do the same: bars hit zero one at a time and stay there. Watch the
        twins. Ridge keeps Garage Cars and Garage Area side by side; Lasso keeps one and drops the
        other. The dollar error is cross-validated with the scaler inside each fold, exactly as the
        notebook's <code>run_evaluation_pipeline</code> does it.
      </Callout>
    </WidgetCard>
  );
};
