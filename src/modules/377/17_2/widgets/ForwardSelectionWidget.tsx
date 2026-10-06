import React, { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { cvR2, FEATURE_LABELS } from '../stats';
import { ActionButton, BarList, Callout, Legend, LegendItem, SectionLabel } from '../ui';

const ALL = FEATURE_LABELS.map((_, i) => i);
/** Below this CV gain, a hire is not worth a column. */
const NEGLIGIBLE = 0.002;

/**
 * Forward selection on real Ames houses, one round per click. The dashed
 * outline is each candidate's solo audition; the bar is what it adds on top of
 * the features already hired. The distance between the two is redundancy.
 */
export const ForwardSelectionWidget: React.FC = () => {
  const [hired, setHired] = useState<number[]>([]);

  const solo = useMemo(() => Object.fromEntries(ALL.map((j) => [j, cvR2([j])])), []);
  const current = useMemo(() => cvR2(hired), [hired]);

  const auditions = useMemo(
    () =>
      ALL.filter((j) => !hired.includes(j))
        .map((j) => ({ j, gain: cvR2([...hired, j]) - current }))
        .sort((a, b) => b.gain - a.gain),
    [hired, current]
  );

  const history = useMemo(() => hired.map((_, i) => cvR2(hired.slice(0, i + 1))), [hired]);
  const best = auditions[0];
  const done = !best || best.gain < NEGLIGIBLE;

  return (
    <WidgetCard
      icon={UserPlus}
      title="Forward Selection, One Round at a Time"
      subtitle="Ames · 12 candidate features · log price · 5-fold CV R²"
      action={
        <div className="flex gap-1.5">
          <ActionButton onClick={() => best && setHired((h) => [...h, best.j])} disabled={!best}>
            Hire the best
          </ActionButton>
          <ActionButton onClick={() => setHired([])}>Reset</ActionButton>
        </div>
      }
    >
      <div>
        <SectionLabel>
          Round {hired.length + 1}: what each candidate adds to the model so far
        </SectionLabel>
        <BarList
          items={auditions.map((a, i) => ({
            label: FEATURE_LABELS[a.j],
            value: a.gain,
            ghost: hired.length > 0 ? solo[a.j] : undefined,
            tone: i === 0 ? 'accent' : a.gain < NEGLIGIBLE ? 'muted' : 'good',
            note: `${a.gain >= 0 ? '+' : ''}${a.gain.toFixed(3)}`,
          }))}
          domain={[-0.01, 0.7]}
          labelWidth={136}
        />
        <Legend>
          <LegendItem color="#E67E22">next hire</LegendItem>
          <LegendItem color="#B9B3A9">adds less than {NEGLIGIBLE}</LegendItem>
          {hired.length > 0 && <LegendItem color="#1A1A1A" shape="dash">its solo score in round 1</LegendItem>}
        </Legend>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="features hired" value={`${hired.length} of 12`} />
        <StatChip label="CV R² now" value={current.toFixed(3)} tone="accent" />
        <StatChip
          label="best gain left"
          value={best ? `+${Math.max(0, best.gain).toFixed(3)}` : '—'}
          tone={done ? 'bad' : 'neutral'}
        />
      </div>

      {hired.length > 0 && (
        <div>
          <SectionLabel>Hired so far, in order</SectionLabel>
          <ol className="mt-1 text-[11px] font-mono text-[#1A1A1A] space-y-0.5">
            {hired.map((j, i) => (
              <li key={j} className="flex justify-between gap-3">
                <span>
                  {i + 1}. {FEATURE_LABELS[j]}
                </span>
                <span className="text-[#767676]">
                  CV R² {history[i].toFixed(3)} ({i === 0 ? '+' + history[0].toFixed(3) : `+${(history[i] - history[i - 1]).toFixed(3)}`})
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Callout tone={done ? 'good' : 'accent'}>
        {done
          ? 'No remaining candidate adds enough to be worth a column. A stopping rule such as sklearn’s "auto" would end the search around here. Notice which strong solo performers were never hired: their information was already in the model.'
          : hired.length === 0
            ? 'Round 1 is a solo audition: each bar is the CV R² of a one-feature model. Hire the best, then watch how the bars change in round 2.'
            : 'The dashed outline is how well each feature did on its own. When a bar has shrunk far inside its outline, that feature is mostly repeating what the model already knows.'}
      </Callout>
    </WidgetCard>
  );
};
