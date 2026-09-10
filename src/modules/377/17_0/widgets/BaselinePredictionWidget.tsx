import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateMean } from '../stats';
import { Target, RefreshCw, AlertCircle, Award, CheckCircle2 } from 'lucide-react';

export const BaselinePredictionWidget: React.FC = () => {
  const dataset = useMemo(() => generateShoeHeightDataset(100, 101), []);
  const meanHeight = useMemo(() => calculateMean(dataset.map(d => d.height)), [dataset]);

  const [unseenStudentIndex, setUnseenStudentIndex] = useState(14);
  const [userGuess, setUserGuess] = useState<number>(66);
  const [hasGuessed, setHasGuessed] = useState(false);

  const unseenStudent = dataset[unseenStudentIndex];
  const actualHeight = unseenStudent.height;

  const guessError = Math.abs(userGuess - actualHeight);
  const meanError = Math.abs(meanHeight - actualHeight);

  // Statistical error metrics across all students
  const rmseUserGuess = useMemo(() => {
    const totalSqErr = dataset.reduce((sum, d) => sum + Math.pow(d.height - userGuess, 2), 0);
    return Math.sqrt(totalSqErr / dataset.length).toFixed(2);
  }, [dataset, userGuess]);

  const rmseMeanGuess = useMemo(() => {
    const totalSqErr = dataset.reduce((sum, d) => sum + Math.pow(d.height - meanHeight, 2), 0);
    return Math.sqrt(totalSqErr / dataset.length).toFixed(2);
  }, [dataset, meanHeight]);

  // Directional bias: sum(y - guess) / N. At the mean, this is mathematically 0.00!
  const biasUserGuess = useMemo(() => {
    const sumDiff = dataset.reduce((sum, d) => sum + (d.height - userGuess), 0);
    const b = sumDiff / dataset.length;
    return b >= 0 ? `+${b.toFixed(2)}"` : `${b.toFixed(2)}"`;
  }, [dataset, userGuess]);

  const biasMeanGuess = useMemo(() => {
    const sumDiff = dataset.reduce((sum, d) => sum + (d.height - meanHeight), 0);
    const b = sumDiff / dataset.length;
    return Math.abs(b) < 0.005 ? '0.00"' : `${b.toFixed(2)}"`;
  }, [dataset, meanHeight]);

  const pickNewStudent = () => {
    const nextIdx = Math.floor(Math.random() * dataset.length);
    setUnseenStudentIndex(nextIdx);
    setHasGuessed(false);
  };

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Interactive Experiment: Height Guesser
            </h3>
            <p className="text-xs text-[#666666]">
              Test your intuition against the 100-student Mean Baseline (<span className="font-mono font-bold text-[#1A1A1A]">{meanHeight.toFixed(1)}"</span>)
            </p>
          </div>
        </div>
        <button
          onClick={pickNewStudent}
          className="flex items-center gap-1.5 px-3 py-1 text-xs bg-[#ECE8E1] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] rounded-sm transition-colors border border-[#1A1A1A]/15 font-medium shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Draw New Student</span>
        </button>
      </div>

      {/* Target Unseen Student Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-[#666666] mb-3">
              <span className="font-semibold text-[#1A1A1A]">Subject: Student #{unseenStudent.id}</span>
              <span className="bg-white text-[#E67E22] px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border border-[#1A1A1A]/10">
                Unseen Height
              </span>
            </div>
            <div className="text-center py-5 bg-white rounded-sm border border-dashed border-[#1A1A1A]/20 shadow-inner">
              <div className="text-3xl font-serif font-bold text-[#1A1A1A] mb-1">
                {hasGuessed ? `${actualHeight.toFixed(1)}"` : '??.? "'}
              </div>
              <p className="text-xs text-[#767676] font-serif italic">
                {hasGuessed ? `True height of Student #${unseenStudent.id}` : 'Mystery student drawn from school roster'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[#1A1A1A] font-semibold">Your Predicted Height:</label>
              <span className="font-mono text-[#E67E22] font-bold text-sm">{userGuess.toFixed(1)}"</span>
            </div>
            <input
              type="range"
              min={54}
              max={78}
              step={0.5}
              value={userGuess}
              onChange={(e) => {
                setUserGuess(parseFloat(e.target.value));
                setHasGuessed(true);
              }}
              className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
            />
            <div className="flex justify-between text-[10px] text-[#767676] font-mono">
              <span>54" (4'6")</span>
              <span className="text-[#E67E22] font-bold">Mean: {meanHeight.toFixed(1)}"</span>
              <span>78" (6'6")</span>
            </div>
          </div>
        </div>

        {/* Feedback & Error Minimization Engine */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 flex flex-col justify-between space-y-4">
          <div className="text-[10px] font-bold text-[#767676] uppercase tracking-[0.2em]">
            Forecaster vs. Gambler Metric
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666666]">Your Guess Error on this student:</span>
                <span className="font-mono font-bold text-[#1A1A1A]">
                  {hasGuessed ? `${guessError.toFixed(1)}"` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666666]">Baseline Mean ({meanHeight.toFixed(1)}") Error:</span>
                <span className="font-mono font-bold text-[#E67E22]">
                  {hasGuessed ? `${meanError.toFixed(1)}"` : '—'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-2">
              <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Population Error Over 100 Students:
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Directional Bias ({userGuess.toFixed(1)}" vs Mean):</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">{biasUserGuess}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Directional Bias (Mean Baseline):</span>
                  <span className="font-mono font-bold text-[#27AE60]">{biasMeanGuess} (Zero Bias)</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#1A1A1A]/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Root Mean Sq. Error (Guess {userGuess.toFixed(1)}"):</span>
                  <span className={`font-mono font-bold ${parseFloat(rmseUserGuess) > parseFloat(rmseMeanGuess) ? 'text-[#C0392B]' : 'text-[#27AE60]'}`}>
                    {rmseUserGuess}"
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Root Mean Sq. Error (Mean {meanHeight.toFixed(1)}"):</span>
                  <span className="font-mono font-bold text-[#27AE60]">
                    {rmseMeanGuess}" (Minimizes Squared Error)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-[#555555] bg-white p-3 rounded-sm border border-[#1A1A1A]/10 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-[#E67E22] shrink-0 mt-0.5" />
            <span>
              <strong>Key Principle:</strong> Guessing the mean does NOT guarantee zero error for one person; it guarantees <em>minimizing the expected penalty</em> over the entire population.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
