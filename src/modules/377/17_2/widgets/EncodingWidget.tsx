import React, { useMemo, useState } from 'react';
import { Binary } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { seededRandom32 } from '@kit/stats';
import { AMES_HOUSES } from '../data';
import { fitOLS, mean, predict, r2Score, shuffledIndices } from '../linalg';
import { ActionButton, Callout, SectionLabel, Toggle } from '../ui';

const HOODS = ['CollgCr', 'Edwards', 'NAmes', 'NridgHt', 'OldTown'];
const HOUSES = AMES_HOUSES.filter((h) => HOODS.includes(h.n));

type Mode = 'codes' | 'onehot' | 'trap';

/** Small deterministic jitter so houses in one neighborhood do not stack. */
const JITTER = (() => {
  const r = seededRandom32(17);
  return HOUSES.map(() => (r() - 0.5) * 0.36);
})();

const k = (v: number) => `${Math.round(v / 1000)}k`;

/**
 * Category codes are labels, not quantities. With integer codes, the fitted
 * line and its R² depend on an arbitrary choice of which neighborhood is
 * called 1; one-hot columns give every neighborhood its own level, whatever
 * the order; keeping every column recreates perfect multicollinearity.
 */
export const EncodingWidget: React.FC = () => {
  const [mode, setMode] = useState<Mode>('codes');
  const [orderSeed, setOrderSeed] = useState(0);

  const groupMean = useMemo(
    () => Object.fromEntries(HOODS.map((h) => [h, mean(HOUSES.filter((x) => x.n === h).map((x) => x.p))])),
    []
  );

  // order[i] = neighborhood that gets code i + 1. Seed 0 is alphabetical.
  const order = useMemo(() => {
    if (orderSeed === 0) return HOODS;
    if (orderSeed === -1) return [...HOODS].sort((a, b) => groupMean[a] - groupMean[b]);
    return shuffledIndices(HOODS.length, orderSeed).map((i) => HOODS[i]);
  }, [orderSeed, groupMean]);

  const codeOf = (h: string) => order.indexOf(h) + 1;
  const prices = HOUSES.map((h) => h.p);

  const codeFit = useMemo(() => fitOLS(HOUSES.map((h) => [codeOf(h.n)]), prices), [order]);
  const codeR2 = r2Score(prices, predict(codeFit, HOUSES.map((h) => [codeOf(h.n)])));
  const groupR2 = r2Score(prices, HOUSES.map((h) => groupMean[h.n]));

  const xPos = mode === 'codes' ? (h: string) => codeOf(h) : (h: string) => HOODS.indexOf(h) + 1;
  const xNames = mode === 'codes' ? order : HOODS;

  const baseline = HOODS[0];
  const example = HOUSES.find((h) => h.n === 'NAmes')!;
  const dummyCols = mode === 'trap' ? HOODS : HOODS.slice(1);

  return (
    <WidgetCard
      icon={Binary}
      title="Turning Neighborhoods into Numbers"
      subtitle={`${HOUSES.length} Ames houses in five neighborhoods`}
      action={
        <Toggle
          options={[
            { value: 'codes' as Mode, label: 'Integer codes' },
            { value: 'onehot' as Mode, label: 'One-hot, drop first' },
            { value: 'trap' as Mode, label: 'One-hot, keep all' },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
    >
      <ScatterPlot
        points={HOUSES.map((h, i) => ({ x: xPos(h.n) + JITTER[i], y: h.p, id: i, tone: 'muted' as const, radius: 2.6 }))}
        lines={mode === 'codes' ? [{ slope: codeFit.coef[0], intercept: codeFit.intercept, color: '#E67E22', width: 2.2 }] : []}
        curves={
          mode === 'codes'
            ? []
            : HOODS.map((h) => ({
                points: [
                  [xPos(h) - 0.3, groupMean[h]],
                  [xPos(h) + 0.3, groupMean[h]],
                ] as [number, number][],
                color: '#E67E22',
                width: 3,
              }))
        }
        xDomain={[0.5, 5.5]}
        yDomain={[40000, 520000]}
        xLabel={mode === 'codes' ? 'code given to the neighborhood' : 'neighborhood'}
        yLabel="sale price"
        formatX={(v) => (Number.isInteger(v) && v >= 1 && v <= 5 ? `${mode === 'codes' ? `${v}=` : ''}${xNames[v - 1]}` : '')}
        formatY={k}
        height={215}
      />

      {mode === 'codes' && (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#4A4A4A] mr-1">Assign the codes</span>
            <ActionButton onClick={() => setOrderSeed(0)}>Alphabetically</ActionButton>
            <ActionButton onClick={() => setOrderSeed(-1)}>By price</ActionButton>
            <ActionButton onClick={() => setOrderSeed((s) => (s <= 0 ? 1 : s + 1))}>At random</ActionButton>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatChip label="R² with these codes" value={codeR2.toFixed(3)} tone={codeR2 < groupR2 - 0.05 ? 'bad' : 'neutral'} />
            <StatChip label="slope per code step" value={`${codeFit.coef[0] >= 0 ? '+' : '−'}$${Math.abs(Math.round(codeFit.coef[0])).toLocaleString()}`} />
          </div>
          <Callout>
            The model treats the codes as a quantity, so it believes neighborhood 4 is “one more”
            than neighborhood 3 and fits a single slope across them. Change who gets which code and
            the slope, the predictions and R² all change, even though not one house changed.
            Ordering by price helps, but the model still insists every step is worth the same amount.
          </Callout>
        </>
      )}

      {mode !== 'codes' && (
        <>
          <div>
            <SectionLabel>How the NAmes house in row 1 is encoded</SectionLabel>
            <div className="mt-1 overflow-x-auto">
              <table className="text-[10.5px] font-mono border-collapse">
                <thead>
                  <tr>
                    {mode === 'trap' && <th className="px-2 py-1 text-left text-[#767676] font-normal border-b border-[#1A1A1A]/10">intercept</th>}
                    {dummyCols.map((h) => (
                      <th key={h} className="px-2 py-1 text-left text-[#767676] font-normal border-b border-[#1A1A1A]/10">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {mode === 'trap' && <td className="px-2 py-1 text-[#C0392B] font-bold">1</td>}
                    {dummyCols.map((h) => (
                      <td key={h} className={`px-2 py-1 ${h === example.n ? 'text-[#E67E22] font-bold' : 'text-[#1A1A1A]'}`}>
                        {h === example.n ? 1 : 0}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatChip label="R², any order" value={groupR2.toFixed(3)} tone="good" />
            <StatChip
              label={mode === 'trap' ? 'unique coefficients?' : `baseline (${baseline})`}
              value={mode === 'trap' ? 'no — infinitely many' : k(groupMean[baseline])}
              tone={mode === 'trap' ? 'bad' : 'neutral'}
            />
          </div>

          {mode === 'onehot' ? (
            <Callout tone="good">
              Each neighborhood gets its own 0/1 column, so each gets its own price level, and the
              order of the columns no longer matters. {baseline} has no column; it is the baseline
              the intercept describes, and every other coefficient is a premium over it. NridgHt’s
              coefficient, for example, is {k(groupMean.NridgHt)} − {k(groupMean[baseline])} ={' '}
              {k(groupMean.NridgHt - groupMean[baseline])}.
            </Callout>
          ) : (
            <Callout>
              With all five columns, every row has exactly one 1 among them, so the five columns
              always add up to the intercept’s column of 1s. Two coefficient sets now give
              identical predictions: intercept 0 with each neighborhood’s own mean, or intercept
              100k with 100k subtracted from every neighborhood. For NAmes, 0 + {k(groupMean.NAmes)} and
              100k + {k(groupMean.NAmes - 100000)} are the same prediction. With no way to choose
              between them, the coefficients mean nothing. That is the dummy variable trap, and{' '}
              <code>drop='first'</code> exists to avoid it.
            </Callout>
          )}
        </>
      )}
    </WidgetCard>
  );
};
