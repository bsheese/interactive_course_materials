import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, RotateCcw, Sliders, XCircle } from 'lucide-react';
import { ScatterPlot } from '@kit/components/ScatterPlot';
import { Slider, StatChip, WidgetCard } from '@kit/components/WidgetCard';
import { seededGaussian, seededRandom32 } from '@kit/stats';
import { QUIZ_QUESTIONS } from '../quiz';
import { T_STAR_95, durbinWatson, fit, residuals, scoreOn, trainTestSplit, tToP } from '../stats';
import type { XY } from '../data';

type Tab = 'sandbox' | 'quiz';

/**
 * The capstone: one synthetic world whose true slope, noise, sample size and
 * curvature are all under the student's control, wired to every diagnostic the
 * unit introduced — then the quiz.
 */
export const SlrSandboxWidget: React.FC = () => {
  const [tab, setTab] = useState<Tab>('sandbox');

  const [trueSlope, setTrueSlope] = useState(1.5);
  const [noise, setNoise] = useState(2);
  const [n, setN] = useState(80);
  const [curvature, setCurvature] = useState(0);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [celebrated, setCelebrated] = useState(false);

  const data = useMemo<XY[]>(() => {
    const random = seededRandom32(77);
    return Array.from({ length: n }, (_, i) => {
      const x = 1 + (i / Math.max(1, n - 1)) * 9;
      const signal = 5 + trueSlope * x + curvature * (x - 5.5) ** 2;
      return [x, signal + seededGaussian(random) * noise] as XY;
    });
  }, [n, trueSlope, noise, curvature]);

  const f = useMemo(() => fit(data), [data]);
  const resid = useMemo(() => residuals(data, f), [data, f]);
  const dw = useMemo(() => durbinWatson(resid.map((r) => r[1])), [resid]);

  const p = tToP(f.tStat);
  const ciLo = f.slope - T_STAR_95 * f.seSlope;
  const ciHi = f.slope + T_STAR_95 * f.seSlope;

  const { train, test } = useMemo(() => trainTestSplit(data, 0.25, 4), [data]);
  const trainModel = useMemo(() => fit(train), [train]);
  const testR2 = scoreOn(test, trainModel);

  const answered = Object.keys(answers).length;
  const correct = QUIZ_QUESTIONS.filter((q) => answers[q.id] === q.correctIndex).length;
  const complete = answered === QUIZ_QUESTIONS.length;

  const answer = (id: string, choice: number) => {
    if (answers[id] !== undefined) return;
    const next = { ...answers, [id]: choice };
    setAnswers(next);

    const nowCorrect = QUIZ_QUESTIONS.filter((q) => next[q.id] === q.correctIndex).length;
    if (Object.keys(next).length === QUIZ_QUESTIONS.length && nowCorrect >= 7 && !celebrated) {
      setCelebrated(true);
      confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 } });
    }
  };

  return (
    <WidgetCard
      icon={tab === 'sandbox' ? Sliders : Award}
      title={tab === 'sandbox' ? 'The SLR Sandbox' : 'Check Yourself'}
      subtitle={
        tab === 'sandbox'
          ? 'Build a world, then read every diagnostic from this unit at once'
          : `${QUIZ_QUESTIONS.length} questions across the whole SLR arc`
      }
      action={
        <div className="flex bg-[#F5F2ED] border border-[#1A1A1A]/15 rounded-sm p-0.5 text-[11px] font-sans">
          {(['sandbox', 'quiz'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-xs transition-colors font-medium capitalize ${
                tab === t ? 'bg-[#1A1A1A] text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      }
    >
      {tab === 'sandbox' ? (
        <>
          <ScatterPlot
            points={data.map(([x, y], i) => ({ x, y, id: i }))}
            lines={[
              { slope: f.slope, intercept: f.intercept, color: '#E67E22' },
              ...(curvature === 0
                ? [{ slope: trueSlope, intercept: 5, color: '#27AE60', dashed: true }]
                : []),
            ]}
            showResiduals={n <= 60}
            xLabel="x"
            yLabel="y"
            height={195}
          />

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Slider label="true slope" value={trueSlope} min={-2} max={4} step={0.1} onChange={setTrueSlope} display={trueSlope.toFixed(1)} />
            <Slider label="noise SD" value={noise} min={0.2} max={8} step={0.2} onChange={setNoise} display={noise.toFixed(1)} />
            <Slider label="sample size n" value={n} min={15} max={400} step={5} onChange={setN} display={String(n)} />
            <Slider label="curvature" value={curvature} min={-0.4} max={0.4} step={0.02} onChange={setCurvature} display={curvature.toFixed(2)} />
          </div>

          {curvature !== 0 && (
            <div className="flex items-center justify-between gap-3 text-[11px] font-sans text-[#4A4A4A]">
              <span className="leading-relaxed">
                Curvature is on, so the world is a curve with no single true slope, and "CI covers truth?" reads n/a.
              </span>
              <button
                onClick={() => setCurvature(0)}
                className="flex items-center gap-1 shrink-0 px-2 py-1 bg-[#F5F2ED] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 rounded-sm transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset curvature to 0
              </button>
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#767676] font-bold">
              Residuals vs. fitted
            </span>
            <ScatterPlot
              points={resid.map(([fitted, e], i) => ({ x: fitted, y: e, id: i }))}
              hLine={{ y: 0, color: '#E67E22' }}
              xLabel="fitted ŷ"
              yLabel="residual"
              height={140}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatChip label="β̂₁" value={f.slope.toFixed(3)} tone="accent" />
            <StatChip label="SE" value={f.seSlope.toFixed(3)} />
            <StatChip label="t" value={f.tStat.toFixed(2)} />
            <StatChip label="p" value={p < 0.0001 ? '<0.0001' : p.toFixed(4)} tone={p < 0.05 ? 'good' : 'bad'} />
            <StatChip label="R²" value={f.r2.toFixed(3)} />
            <StatChip label="Durbin–Watson" value={dw.toFixed(2)} tone={dw > 1.7 && dw < 2.3 ? 'good' : 'bad'} />
            <StatChip label="95% CI" value={`[${ciLo.toFixed(2)}, ${ciHi.toFixed(2)}]`} />
            <StatChip label="test R²" value={testR2.toFixed(3)} tone={testR2 > 0 ? 'good' : 'bad'} />
            <StatChip
              label="CI covers truth?"
              value={curvature !== 0 ? 'n/a' : ciLo <= trueSlope && trueSlope <= ciHi ? 'yes' : 'no'}
              tone={curvature !== 0 ? 'neutral' : ciLo <= trueSlope && trueSlope <= ciHi ? 'good' : 'bad'}
              hint={
                curvature !== 0
                  ? 'n/a: curvature is on, so there is no single true slope to cover. Reset curvature to 0 to check coverage.'
                  : 'Does the 95% CI for the slope contain the true slope you set?'
              }
            />
          </div>

          <div className="p-3 bg-[#F5F2ED] border-l-2 border-l-[#E67E22] border-y border-r border-[#1A1A1A]/10 rounded-sm">
            <p className="text-[11px] text-[#333333] leading-relaxed">
              {curvature !== 0
                ? 'Curvature is on, so the straight line is now the wrong model — watch the residual plot arc while R² stays deceptively respectable. This is the case no amount of extra data will fix.'
                : noise > 5 && n < 60
                  ? 'High noise and a small sample: the estimate is unbiased but imprecise, so the CI is wide and p may drift above 0.05 even though the effect is real.'
                  : 'Crank the noise up, then push n up to compensate — the same true slope moves from undetectable to unmistakable without the world changing at all.'}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-sans text-[#4A4A4A]">
              {answered} of {QUIZ_QUESTIONS.length} answered ·{' '}
              <span className="font-bold text-[#27AE60]">{correct} correct</span>
            </span>
            {answered > 0 && (
              <button
                onClick={() => {
                  setAnswers({});
                  setCelebrated(false);
                }}
                className="flex items-center gap-1 text-[11px] font-sans px-2 py-1 bg-[#F5F2ED] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 rounded-sm transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          <div className="space-y-4">
            {QUIZ_QUESTIONS.map((q, qi) => {
              const chosen = answers[q.id];
              const done = chosen !== undefined;

              return (
                <div key={q.id} className="border border-[#1A1A1A]/10 rounded-sm overflow-hidden">
                  <div className="bg-[#F5F2ED] px-3 py-2 border-b border-[#1A1A1A]/10">
                    <p className="text-[11px] text-[#1A1A1A] font-medium leading-relaxed">
                      <span className="font-mono text-[#767676] mr-1.5">{qi + 1}.</span>
                      {q.question}
                    </p>
                  </div>
                  <div className="p-2 space-y-1">
                    {q.options.map((option, oi) => {
                      const isCorrect = oi === q.correctIndex;
                      const isChosen = chosen === oi;
                      const style = !done
                        ? 'bg-white border-[#1A1A1A]/10 hover:border-[#E67E22] text-[#333333]'
                        : isCorrect
                          ? 'bg-[#27AE60]/10 border-[#27AE60]/40 text-[#1A1A1A]'
                          : isChosen
                            ? 'bg-[#C0392B]/10 border-[#C0392B]/40 text-[#1A1A1A]'
                            : 'bg-white border-[#1A1A1A]/10 text-[#999999]';

                      return (
                        <button
                          key={oi}
                          onClick={() => answer(q.id, oi)}
                          disabled={done}
                          className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-sm border transition-colors flex items-start gap-2 ${style}`}
                        >
                          {done && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-[#27AE60] shrink-0 mt-px" />}
                          {done && isChosen && !isCorrect && <XCircle className="w-3.5 h-3.5 text-[#C0392B] shrink-0 mt-px" />}
                          <span className="leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                  {done && (
                    <p className="text-[11px] text-[#555555] leading-relaxed px-3 py-2 bg-[#ECE8E1]/60 border-t border-[#1A1A1A]/10">
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {complete && (
            <div
              className={`p-4 rounded-sm border-l-2 border-y border-r border-[#1A1A1A]/10 ${
                correct >= 7 ? 'bg-[#27AE60]/5 border-l-[#27AE60]' : 'bg-[#F5F2ED] border-l-[#E67E22]'
              }`}
            >
              <p className="text-xs font-bold text-[#1A1A1A] mb-1">
                {correct} / {QUIZ_QUESTIONS.length}
                {correct >= 7 ? ' — the SLR arc is yours.' : ' — worth another pass.'}
              </p>
              <p className="text-[11px] text-[#555555] leading-relaxed">
                {correct >= 7
                  ? 'Everything here scales straight into multiple regression: the same fit, the same diagnostics, the same generalization test — just more columns. That is 17_2.'
                  : 'Re-read the explanations above, then revisit the slides for the ones that slipped. The distinctions that trip people up are bootstrap vs. permutation, and leverage vs. outlier vs. influence.'}
              </p>
            </div>
          )}
        </>
      )}
    </WidgetCard>
  );
};
