import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { generateShoeHeightDataset, generateSampleA, generateSampleB, calculateOLS, calculateTSS, calculateVariance, calculateStandardDeviation, calculateRSS } from '../stats';
import { QUIZ_QUESTIONS } from '../quiz';
import { StudentDataPoint } from '../stats';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, Sliders, BarChart3, HelpCircle, ArrowRight } from 'lucide-react';

export const GrandSandboxWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'quiz'>('sandbox');

  // Sandbox State
  const [preset, setPreset] = useState<'sampleA' | 'sampleB' | 'realistic' | 'strong' | 'random'>('realistic');
  const [customNoise, setCustomNoise] = useState<number>(2.0);
  const [unseenPredictX, setUnseenPredictX] = useState<number>(10.0);

  const dataset: StudentDataPoint[] = useMemo(() => {
    if (preset === 'sampleA') return generateSampleA(100);
    if (preset === 'sampleB') return generateSampleB(100);
    if (preset === 'strong') {
      return Array.from({ length: 100 }, (_, i) => {
        const shoeSize = 6.0 + (i / 100) * 7.5;
        const height = 48 + 2.0 * shoeSize + (Math.sin(i) * 0.8);
        return { id: i + 1, shoeSize, height };
      });
    }
    if (preset === 'random') {
      return Array.from({ length: 100 }, (_, i) => {
        const shoeSize = 6.0 + (i / 100) * 7.5;
        const height = 56 + Math.random() * 22;
        return { id: i + 1, shoeSize, height };
      });
    }
    return generateShoeHeightDataset(100, 42);
  }, [preset]);

  const ols = useMemo(() => calculateOLS(dataset), [dataset]);
  const tss = useMemo(() => calculateTSS(dataset.map(d => d.height)), [dataset]);
  const variance = useMemo(() => calculateVariance(dataset.map(d => d.height), true), [dataset]);
  const sd = useMemo(() => calculateStandardDeviation(dataset.map(d => d.height), true), [dataset]);
  const rss = useMemo(() => calculateRSS(dataset, ols.slope, ols.intercept), [dataset, ols]);
  const r2 = ols.r2;

  const predictedUnseenY = ols.slope * unseenPredictX + ols.intercept;

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  const quizScore = useMemo(() => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  }, [quizAnswers]);

  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    if (submittedQuiz) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGradeQuiz = () => {
    setSubmittedQuiz(true);
    if (quizScore >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setSubmittedQuiz(false);
  };

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      {/* Top Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Comprehensive Statistical Hub
            </h3>
            <p className="text-xs text-[#666666]">
              Interactive sandbox calculation dashboard & 5-question mastery checkpoint
            </p>
          </div>
        </div>

        <div className="bg-[#F5F2ED] p-1 rounded-sm border border-[#1A1A1A]/10 flex text-xs">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1 rounded-sm transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'sandbox' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Interactive Sandbox</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1 rounded-sm transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'quiz' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mastery Quiz ({QUIZ_QUESTIONS.length} Qs)</span>
          </button>
        </div>
      </div>

      {activeTab === 'sandbox' ? (
        <div className="space-y-4">
          {/* Preset Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#1A1A1A] font-semibold">Load Preset Scenario:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'realistic', label: '100 Students (Realistic)' },
                { id: 'sampleB', label: 'Sample B (50@60", 50@72")' },
                { id: 'sampleA', label: 'Sample A (All 66")' },
                { id: 'strong', label: 'Near-Perfect Correlation' },
                { id: 'random', label: 'No Correlation (Random)' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id as any)}
                  className={`px-2.5 py-1 rounded-sm text-xs transition-colors font-medium border ${
                    preset === p.id ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xs' : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F2ED]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unified Master Metrics Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs font-mono">
            <div className="bg-[#F5F2ED] p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
              <span className="text-[9px] text-[#767676] block font-sans uppercase">Mean Height (ȳ)</span>
              <span className="text-sm font-bold text-[#1A1A1A]">{ols.meanY.toFixed(1)}"</span>
            </div>

            <div className="bg-[#F5F2ED] p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
              <span className="text-[9px] text-[#767676] block font-sans uppercase">Mean Shoe (x̄)</span>
              <span className="text-sm font-bold text-[#1A1A1A]">{ols.meanX.toFixed(1)}</span>
            </div>

            <div className="bg-[#F5F2ED] p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
              <span className="text-[9px] text-[#C0392B] block font-sans uppercase font-bold">TSS (Spread)</span>
              <span className="text-sm font-bold text-[#C0392B]">{tss.toFixed(0)}</span>
            </div>

            <div className="bg-[#F5F2ED] p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
              <span className="text-[9px] text-[#E67E22] block font-sans uppercase font-bold">Variance (s²)</span>
              <span className="text-sm font-bold text-[#E67E22]">{variance.toFixed(1)}</span>
            </div>

            <div className="bg-[#F5F2ED] p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
              <span className="text-[9px] text-[#1A1A1A] block font-sans uppercase font-bold">Std Dev (s)</span>
              <span className="text-sm font-bold text-[#1A1A1A]">{sd.toFixed(1)}"</span>
            </div>

            <div className="bg-[#F5F2ED] p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
              <span className="text-[9px] text-[#27AE60] block font-sans uppercase font-bold">Covariance</span>
              <span className="text-sm font-bold text-[#27AE60]">{ols.cov.toFixed(1)}</span>
            </div>

            <div className="bg-[#F5F2ED] p-2.5 rounded-sm border border-[#27AE60]/30 shadow-xs">
              <span className="text-[9px] text-[#27AE60] block font-sans uppercase font-bold">Pearson's r</span>
              <span className="text-sm font-bold text-[#27AE60]">{ols.r.toFixed(3)}</span>
            </div>

            <div className="bg-[#F5F2ED] p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
              <span className="text-[9px] text-[#1A1A1A] block font-sans uppercase font-bold">Line RSS</span>
              <span className="text-sm font-bold text-[#1A1A1A]">{rss.toFixed(0)}</span>
            </div>
          </div>

          {/* Interactive Scatter Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] mb-2">
                  Unseen Student Prediction:
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#1A1A1A] font-semibold">
                    <span>Target Shoe Size:</span>
                    <span className="font-mono text-[#E67E22] font-bold">Size {unseenPredictX.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={6.0}
                    max={14.0}
                    step={0.5}
                    value={unseenPredictX}
                    onChange={(e) => setUnseenPredictX(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-1 shadow-xs">
                <span className="text-[10px] text-[#767676] font-mono font-bold uppercase">Predicted Height (ŷ):</span>
                <div className="text-2xl font-serif font-black text-[#E67E22]">
                  {predictedUnseenY.toFixed(1)}"
                </div>
                <div className="text-[10px] text-[#555555] font-mono">
                  Line: ŷ = {ols.slope.toFixed(2)}x + {ols.intercept.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
              <div className="relative w-full h-56 bg-white rounded-sm border border-[#1A1A1A]/10 p-2 overflow-hidden shadow-inner">
                <svg viewBox="0 0 500 220" className="w-full h-full">
                  <line x1="40" y1="190" x2="480" y2="190" stroke="#E2DDD5" strokeWidth="1.5" />
                  <line x1="40" y1="20" x2="40" y2="190" stroke="#E2DDD5" strokeWidth="1.5" />

                  {/* Scatter points */}
                  {dataset.map(pt => {
                    const cx = 40 + ((pt.shoeSize - 5.5) / 8.5) * 440;
                    const cy = 190 - ((pt.height - 54) / 26) * 170;
                    return (
                      <circle
                        key={pt.id}
                        cx={cx}
                        cy={cy}
                        r="3"
                        fill="#1A1A1A"
                        opacity="0.4"
                      />
                    );
                  })}

                  {/* OLS Line */}
                  {(() => {
                    const x1 = 5.5;
                    const y1 = ols.slope * x1 + ols.intercept;
                    const x2 = 14.0;
                    const y2 = ols.slope * x2 + ols.intercept;

                    const cx1 = 40;
                    const cy1 = 190 - ((y1 - 54) / 26) * 170;
                    const cx2 = 480;
                    const cy2 = 190 - ((y2 - 54) / 26) * 170;

                    return (
                      <line
                        x1={cx1}
                        y1={cy1}
                        x2={cx2}
                        y2={cy2}
                        stroke="#27AE60"
                        strokeWidth="2.5"
                      />
                    );
                  })()}

                  {/* Target Prediction */}
                  {(() => {
                    const cx = 40 + ((unseenPredictX - 5.5) / 8.5) * 440;
                    const cy = 190 - ((predictedUnseenY - 54) / 26) * 170;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="6"
                        fill="#E67E22"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    );
                  })()}
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-[#555555] bg-white p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
                <span>Model R² = {r2.toFixed(3)} ({(r2 * 100).toFixed(1)}% variance explained)</span>
                <span className="text-[#27AE60] font-mono font-bold">Optimal OLS Line Active</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-[#1A1A1A]/10">
            <span className="text-[#555555]">
              Answer all 5 questions to test your understanding of Parts 1, 2, and 3.
            </span>
            {submittedQuiz && (
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#1A1A1A]">
                  Score: {quizScore} / {QUIZ_QUESTIONS.length}
                </span>
                <button
                  onClick={handleResetQuiz}
                  className="px-2.5 py-1 text-xs bg-[#ECE8E1] hover:bg-[#E2DDD5] text-[#1A1A1A] rounded-sm flex items-center gap-1 border border-[#1A1A1A]/10 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const selectedOpt = quizAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-sm border transition-all shadow-xs ${
                    submittedQuiz
                      ? isCorrect
                        ? 'bg-[#27AE60]/5 border-[#27AE60]/40'
                        : 'bg-[#C0392B]/5 border-[#C0392B]/40'
                      : 'bg-[#F5F2ED] border-[#1A1A1A]/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs md:text-sm font-semibold text-[#1A1A1A]">
                      {q.question}
                    </p>
                  </div>

                  <div className="space-y-1.5 pl-7">
                    {q.options.map((opt, optIdx) => {
                      const isThisSelected = selectedOpt === optIdx;
                      const isThisCorrect = q.correctIndex === optIdx;

                      let btnStyle = 'bg-white border-[#1A1A1A]/10 text-[#333333] hover:border-[#1A1A1A]/30 hover:bg-[#ECE8E1]/30';
                      if (submittedQuiz) {
                        if (isThisCorrect) {
                          btnStyle = 'bg-[#27AE60]/15 border-[#27AE60] text-[#27AE60] font-bold';
                        } else if (isThisSelected && !isThisCorrect) {
                          btnStyle = 'bg-[#C0392B]/15 border-[#C0392B] text-[#C0392B] line-through font-medium';
                        } else {
                          btnStyle = 'bg-white/50 border-[#1A1A1A]/5 text-[#767676] opacity-60';
                        }
                      } else if (isThisSelected) {
                        btnStyle = 'bg-[#1A1A1A] border-[#1A1A1A] text-white font-semibold shadow-xs';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submittedQuiz}
                          onClick={() => handleSelectQuizOption(q.id, optIdx)}
                          className={`w-full text-left p-2.5 rounded-sm border text-xs transition-colors flex items-center justify-between shadow-2xs ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {submittedQuiz && isThisCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-[#27AE60] shrink-0" />
                          )}
                          {submittedQuiz && isThisSelected && !isThisCorrect && (
                            <XCircle className="w-4 h-4 text-[#C0392B] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submittedQuiz && (
                    <div className="mt-3 ml-7 p-2.5 bg-white rounded-sm border border-[#1A1A1A]/10 text-[11px] text-[#555555] shadow-2xs leading-relaxed">
                      <strong className="text-[#1A1A1A]">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submittedQuiz && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleGradeQuiz}
                disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#333333] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Submit & Check Answers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
