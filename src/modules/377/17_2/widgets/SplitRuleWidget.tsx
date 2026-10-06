import React, { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { ActionButton } from '../ui';

type Placement = 'before' | 'after';

const STEPS: { step: string; answer: Placement | 'either'; why: string }[] = [
  {
    step: 'Drop the houses with Gr Liv Area over 4,000 sq ft',
    answer: 'before',
    why: 'A fixed rule taken from the dataset’s documentation. It would give the same verdict on one house as on all of them, so it computes nothing from the data.',
  },
  {
    step: 'Fill a blank Bsmt Qual with the text "None"',
    answer: 'before',
    why: 'A blank here means “no basement”. Writing that down is a fixed rule applied to each row on its own, so it is safe on the full dataset.',
  },
  {
    step: 'Replace SalePrice with log(SalePrice)',
    answer: 'before',
    why: 'log(x) needs nothing but x. Each house is transformed by itself, and no other row influences the result.',
  },
  {
    step: 'Fill a missing Lot Frontage with the column’s median',
    answer: 'after',
    why: 'The median is computed from the data. Computed on all rows, it would carry information from the test houses into the training houses.',
  },
  {
    step: 'Standardize every feature with StandardScaler',
    answer: 'after',
    why: 'The scaler learns a mean and a standard deviation for every column. That is two statistics per column, so it is fitted on training rows only, inside the Pipeline.',
  },
  {
    step: 'Keep only the 40 features most correlated with log price',
    answer: 'after',
    why: 'A correlation with the target is about as statistical as a step can be. The next slide shows how much damage this one does when it is done before the split.',
  },
  {
    step: 'One-hot encode Neighborhood',
    answer: 'after',
    why: 'The encoder learns its list of categories from the rows it is shown. Fitted on training rows, a neighborhood that appears only in the test set comes out as all zeros, as it would for a genuinely new house.',
  },
  {
    step: 'Add Total_Square_Footage = 1st Flr SF + 2nd Flr SF + Total Bsmt SF',
    answer: 'either',
    why: 'Adding three numbers in the same row is a fixed formula, so this one is safe either way. The notebook does it after the split anyway, as a habit, because the steps around it do learn from the data.',
  },
];

/**
 * The organising question of 17_2_1_1, practised: does this step compute
 * anything from the data? Each card reveals its reasoning once answered.
 */
export const SplitRuleWidget: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, Placement>>({});

  const answered = Object.keys(answers).length;
  const correct = Object.entries(answers).filter(([i, a]) => {
    const want = STEPS[Number(i)].answer;
    return want === 'either' || want === a;
  }).length;

  return (
    <WidgetCard
      icon={ListChecks}
      title="Before the Split, or After?"
      subtitle="Does this step compute anything from the data?"
      action={<ActionButton onClick={() => setAnswers({})}>Reset</ActionButton>}
    >
      <div className="space-y-2">
        {STEPS.map((s, i) => {
          const picked = answers[i];
          const right = picked && (s.answer === 'either' || s.answer === picked);
          return (
            <div
              key={s.step}
              className={`p-2.5 rounded-sm border ${
                !picked
                  ? 'border-[#1A1A1A]/10 bg-white'
                  : right
                    ? 'border-[#27AE60]/40 bg-[#27AE60]/5'
                    : 'border-[#C0392B]/40 bg-[#C0392B]/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11.5px] text-[#1A1A1A] leading-snug font-mono">{s.step}</span>
                <div className="flex gap-1 shrink-0 text-[10px] font-sans">
                  {(['before', 'after'] as Placement[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: p }))}
                      className={`px-2 py-0.5 rounded-xs border transition-colors ${
                        picked === p
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                          : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
                      }`}
                    >
                      {p === 'before' ? 'Before split' : 'After, train only'}
                    </button>
                  ))}
                </div>
              </div>
              {picked && (
                <p className="mt-1.5 text-[11px] text-[#444444] leading-relaxed">
                  <span className={`font-bold ${right ? 'text-[#27AE60]' : 'text-[#C0392B]'}`}>
                    {s.answer === 'either'
                      ? 'Either is safe. '
                      : right
                        ? 'Right. '
                        : s.answer === 'before'
                          ? 'This one is safe before the split. '
                          : 'This one has to wait for the split. '}
                  </span>
                  {s.why}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatChip label="answered" value={`${answered} of ${STEPS.length}`} />
        <StatChip
          label="placed safely"
          value={`${correct} of ${answered || 0}`}
          tone={answered === 0 ? 'neutral' : correct === answered ? 'good' : 'bad'}
        />
      </div>
    </WidgetCard>
  );
};
