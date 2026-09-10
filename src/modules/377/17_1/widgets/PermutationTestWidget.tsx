import React, { useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { Histogram } from '@kit/components/Histogram';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { PENGUINS } from '../data';
import { empiricalPValue, fit, permutationSlopes } from '../stats';
import { seededRandom32 } from '@kit/stats';

const REP_CHOICES = [200, 1000, 5000];

/**
 * Builds the null distribution by hand: shuffle y against x, refit, repeat.
 * Students see that a slope of 50 is not merely unlikely under H0 — in 5000
 * shuffles nothing comes close.
 */
export const PermutationTestWidget: React.FC = () => {
  const [reps, setReps] = useState(1000);
  const [showShuffled, setShowShuffled] = useState(false);

  const observed = useMemo(() => fit(PENGUINS), []);
  const nullSlopes = useMemo(() => permutationSlopes(PENGUINS, reps), [reps]);

  const pValue = empiricalPValue(nullSlopes, observed.slope);
  const maxNull = Math.max(...nullSlopes.map(Math.abs));

  // One shuffled dataset, to make "destroying the relationship" concrete.
  const shuffled = useMemo(() => {
    const random = seededRandom32(23);
    const ys = PENGUINS.map((p) => p[1]);
    for (let i = ys.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [ys[i], ys[j]] = [ys[j], ys[i]];
    }
    return PENGUINS.map(([x], i) => [x, ys[i]] as [number, number]);
  }, []);

  const shuffledFit = useMemo(() => fit(shuffled), [shuffled]);
  const shown = showShuffled ? shuffled : PENGUINS;
  const shownFit = showShuffled ? shuffledFit : observed;

  return (
    <WidgetCard
      icon={Shuffle}
      title="The Null World"
      subtitle="Shuffle y against x, refit, repeat — what slopes does pure chance produce?"
      action={
        <button
          onClick={() => setShowShuffled((prev) => !prev)}
          className="text-[11px] font-sans font-medium px-2.5 py-1 bg-[#F5F2ED] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 rounded-sm transition-colors"
        >
          {showShuffled ? 'Show real data' : 'Show one shuffle'}
        </button>
      }
    >
      <ScatterPlot
        points={shown.map(([x, y], i) => ({
          x,
          y,
          id: i,
          tone: showShuffled ? ('muted' as const) : ('default' as const),
        }))}
        lines={[{ slope: shownFit.slope, intercept: shownFit.intercept, color: showShuffled ? '#767676' : '#E67E22' }]}
        xLabel="flipper length (mm)"
        yLabel="body mass (g)"
        xDomain={[170, 233]}
        yDomain={[2600, 6500]}
        formatY={(v) => `${Math.round(v / 1000)}k`}
        height={200}
      />

      <p className="text-[11px] text-[#555555] leading-relaxed">
        {showShuffled ? (
          <>
            Same x values, same y values — only the pairing is broken. The fitted slope collapses
            to <span className="font-mono font-bold">{shuffledFit.slope.toFixed(2)}</span>. That is
            one draw from the null world.
          </>
        ) : (
          <>
            The real pairing gives a slope of{' '}
            <span className="font-mono font-bold text-[#E67E22]">{observed.slope.toFixed(2)}</span>.
            Now do the shuffle {reps.toLocaleString()} times and see where that lands.
          </>
        )}
      </p>

      <div className="flex items-center gap-1 text-[11px] font-sans">
        <span className="text-[#767676] mr-1">shuffles:</span>
        {REP_CHOICES.map((choice) => (
          <button
            key={choice}
            onClick={() => setReps(choice)}
            className={`px-2 py-0.5 rounded-xs border transition-colors ${
              reps === choice
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
            }`}
          >
            {choice.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="bg-[#F5F2ED] border border-[#1A1A1A]/10 rounded-sm p-2">
        <Histogram
          values={nullSlopes}
          xLabel="slope under H₀ (shuffled y)"
          domain={[-Math.max(6, maxNull * 1.15), Math.max(6, maxNull * 1.15)]}
          markers={[{ value: 0, color: '#767676', dashed: true }]}
          formatX={(v) => v.toFixed(1)}
          height={170}
        />
        <p className="text-[10px] text-[#767676] text-center leading-snug px-2">
          The observed slope of {observed.slope.toFixed(1)} is so far off this axis that drawing it
          would compress the null distribution to a single bar. The widest shuffle reached only
          ±{maxNull.toFixed(2)}.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="observed β₁" value={observed.slope.toFixed(2)} tone="accent" />
        <StatChip label="most extreme null" value={`±${maxNull.toFixed(2)}`} />
        <StatChip
          label="empirical p"
          value={pValue === 0 ? `< ${(1 / reps).toFixed(4)}` : pValue.toFixed(4)}
          tone="good"
          hint="fraction of shuffles at least as extreme as the observed slope"
        />
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Zero of {reps.toLocaleString()} shuffles came near 50, so the empirical p-value is reported
        as &lt; 1/{reps.toLocaleString()} — simulation can only resolve p down to one over the
        number of repetitions. It can never return an exact zero.
      </p>
    </WidgetCard>
  );
};
