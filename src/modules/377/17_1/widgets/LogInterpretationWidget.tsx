import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';

type Flavor = 'level-log' | 'log-level' | 'log-log';

const FLAVORS: Record<
  Flavor,
  { label: string; model: string; rule: string; example: string }
> = {
  'level-log': {
    label: 'Level–log',
    model: 'y = β₀ + β₁ · log(x)',
    rule: '+1% in x → +β₁/100 units of y',
    example: 'Gapminder: +1% GDP per capita buys about β₁/100 extra years of life expectancy.',
  },
  'log-level': {
    label: 'Log–level',
    model: 'log(y) = β₀ + β₁ · x',
    rule: '+1 unit of x → +100·β₁ % change in y',
    example: 'Wages: one more year of schooling raises pay by roughly 100·β₁ percent.',
  },
  'log-log': {
    label: 'Log–log',
    model: 'log(y) = β₀ + β₁ · log(x)',
    rule: '+1% in x → +β₁ % in y (an elasticity)',
    example: 'Demand: β₁ = −1.4 means a 1% price rise cuts quantity sold by 1.4%.',
  },
};

/**
 * The interpretation rules are where students actually lose the thread, so
 * this computes both sides: the exact change and the rule-of-thumb
 * approximation, side by side, with the approximation's error shown.
 */
export const LogInterpretationWidget: React.FC = () => {
  const [flavor, setFlavor] = useState<Flavor>('level-log');
  const [beta, setBeta] = useState(7.2); // Gapminder's log(GDP) slope.
  const [pctChange, setPctChange] = useState(1);

  const spec = FLAVORS[flavor];
  const ratio = 1 + pctChange / 100;

  // Exact vs. approximate effect of a pctChange% move in x.
  let exact: number;
  let approx: number;
  let unit: string;

  if (flavor === 'level-log') {
    exact = beta * Math.log(ratio);
    approx = (beta * pctChange) / 100;
    unit = 'units of y';
  } else if (flavor === 'log-level') {
    // Here the slider is a 1-unit move in x, not a percentage.
    exact = (Math.exp(beta) - 1) * 100;
    approx = 100 * beta;
    unit = '% change in y';
  } else {
    exact = (ratio ** beta - 1) * 100;
    approx = beta * pctChange;
    unit = '% change in y';
  }

  const error = approx === 0 ? 0 : ((approx - exact) / Math.abs(exact || 1)) * 100;

  return (
    <WidgetCard
      icon={Calculator}
      title="What Does a Log Slope Mean?"
      subtitle="Three flavors, three sentences — and the approximation behind each"
      action={
        <div className="flex gap-1 text-[10px] font-sans">
          {(Object.keys(FLAVORS) as Flavor[]).map((key) => (
            <button
              key={key}
              onClick={() => setFlavor(key)}
              className={`px-2 py-0.5 rounded-xs border transition-colors ${
                flavor === key
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                  : 'bg-white text-[#4A4A4A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
              }`}
            >
              {FLAVORS[key].label}
            </button>
          ))}
        </div>
      }
    >
      <div className="bg-[#1A1A1A] rounded-sm p-4 text-center">
        <div className="font-mono text-sm text-[#ECE8E1] mb-1">{spec.model}</div>
        <div className="font-sans text-[11px] text-[#E67E22] font-bold">{spec.rule}</div>
      </div>

      <Slider
        label="slope β₁"
        value={beta}
        min={-5}
        max={12}
        step={0.1}
        onChange={setBeta}
        display={beta.toFixed(2)}
      />

      {flavor !== 'log-level' && (
        <Slider
          label="change in x"
          value={pctChange}
          min={1}
          max={100}
          step={1}
          onChange={setPctChange}
          display={`+${pctChange}%`}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <StatChip
          label="rule of thumb"
          value={`${approx >= 0 ? '+' : ''}${approx.toFixed(3)}`}
          tone="accent"
          hint="the shortcut you quote in a sentence"
        />
        <StatChip
          label="exact"
          value={`${exact >= 0 ? '+' : ''}${exact.toFixed(3)}`}
          hint="computed without the small-change approximation"
        />
      </div>

      <div className="bg-[#F5F2ED] border border-[#1A1A1A]/10 rounded-sm px-3 py-2">
        <p className="text-[11px] text-[#4A4A4A]">
          Both figures are in <span className="font-mono">{unit}</span>. The shortcut is off by{' '}
          <span
            className={`font-mono font-bold ${
              Math.abs(error) > 5 ? 'text-[#C0392B]' : 'text-[#27AE60]'
            }`}
          >
            {error >= 0 ? '+' : ''}
            {error.toFixed(1)}%
          </span>
          {flavor === 'log-level'
            ? ' — this one drifts fast, because e^β is only ≈ 1 + β for small β.'
            : Math.abs(error) > 5
              ? ' — the approximation is only good for small changes. Past ~10% you should use the exact form.'
              : ' — comfortably accurate at this size of change.'}
        </p>
      </div>

      <div className="p-3 bg-white border-l-2 border-l-[#E67E22] border-y border-r border-[#1A1A1A]/10 rounded-sm">
        <p className="text-[11px] text-[#555555] leading-relaxed">{spec.example}</p>
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed">
        Why β₁/100 works, without calculus: a 1% rise in x multiplies it by 1.01, and log(1.01) ≈
        0.00995 ≈ 1/100. So the model's prediction moves by β₁ · log(1.01) ≈ β₁/100. One more
        warning worth carrying forward — if you fit log(y) and need a prediction in original units,
        exponentiating alone <em>underestimates</em> the mean. That is Jensen's inequality, and the
        fix is a correction term based on the residual variance.
      </p>
    </WidgetCard>
  );
};
