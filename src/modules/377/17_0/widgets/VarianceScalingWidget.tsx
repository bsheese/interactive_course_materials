import React, { useState } from 'react';
import { Users, TrendingUp, HelpCircle, CheckCircle2 } from 'lucide-react';

export const VarianceScalingWidget: React.FC = () => {
  // Sample size multiplier: N = 50, 100, 200, 300, 500
  const [sampleSize, setSampleSize] = useState<number>(100);
  const [useBessels, setUseBessels] = useState<boolean>(false);
  const [showBesselDetails, setShowBesselDetails] = useState<boolean>(false);

  // For Sample B: half are 60", half are 72", so every student has deviation squared = 36
  const tss = sampleSize * 36;
  const divisor = useBessels ? sampleSize - 1 : sampleSize;
  const variance = divisor > 0 ? tss / divisor : 0;
  const standardDeviation = Math.sqrt(variance);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Sample Size Scaler: TSS vs. Variance
            </h3>
            <p className="text-xs text-[#666666]">
              Watch how TSS blows up with larger N, while Variance stays rock-solid
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseBessels(!useBessels)}
            className={`px-3 py-1 text-xs rounded-sm border transition-all flex items-center gap-1.5 font-medium shadow-xs ${
              useBessels
                ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                : 'bg-white border-[#1A1A1A]/15 text-[#4A4A4A] hover:text-[#1A1A1A]'
            }`}
          >
            <span className="font-mono">{useBessels ? 'Divisor: N - 1 (Sample)' : 'Divisor: N (Population)'}</span>
          </button>
        </div>
      </div>

      {/* Slider for Sample Size */}
      <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#1A1A1A] font-semibold">
            Number of Sample B Students (<span className="font-mono font-bold">N</span>):
          </span>
          <span className="font-mono text-[#E67E22] font-bold text-sm bg-white px-2.5 py-0.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            N = {sampleSize} students
          </span>
        </div>

        <input
          type="range"
          min={10}
          max={500}
          step={10}
          value={sampleSize}
          onChange={(e) => setSampleSize(Number(e.target.value))}
          className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
        />

        <div className="flex justify-between text-[10px] text-[#767676] font-mono">
          <span>N = 10 (Small)</span>
          <span className={sampleSize === 100 ? 'text-[#E67E22] font-bold' : ''}>N = 100 (Original)</span>
          <span className={sampleSize === 200 ? 'text-[#E67E22] font-bold' : ''}>N = 200 (Doubled)</span>
          <span>N = 500 (Large)</span>
        </div>
      </div>

      {/* Metric comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TSS Card */}
        <div className="bg-[#F5F2ED] p-4.5 rounded-sm border border-[#1A1A1A]/10 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs text-[#C0392B] font-semibold mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Sum of Squares (TSS)</span>
              <span className="text-[9px] font-mono bg-white text-[#C0392B] px-1.5 py-0.5 rounded-sm border border-[#C0392B]/30 font-bold">
                Unnormalized
              </span>
            </div>
            <div className="text-2xl font-serif font-black text-[#C0392B] my-2">
              {tss.toLocaleString()} <span className="text-xs text-[#767676] font-normal font-sans">in²</span>
            </div>
            <p className="text-[11px] text-[#555555] leading-relaxed font-mono">
              = {sampleSize} × 36 sq in
            </p>
          </div>
          <div className="mt-3 text-[10px] text-[#C0392B] bg-white p-2 rounded-sm border border-[#C0392B]/20">
            ⚠️ Triples if N triples! Flawed for comparing spread across datasets.
          </div>
        </div>

        {/* Variance Card */}
        <div className="bg-[#F5F2ED] p-4.5 rounded-sm border border-[#1A1A1A]/10 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs text-[#27AE60] font-semibold mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Variance (Average Spread)</span>
              <span className="text-[9px] font-mono bg-white text-[#27AE60] px-1.5 py-0.5 rounded-sm border border-[#27AE60]/30 font-bold">
                Normalized
              </span>
            </div>
            <div className="text-2xl font-serif font-black text-[#27AE60] my-2">
              {variance.toFixed(2)} <span className="text-xs text-[#767676] font-normal font-sans">in²</span>
            </div>
            <p className="text-[11px] text-[#555555] leading-relaxed font-mono">
              = {tss.toLocaleString()} / {divisor}
            </p>
          </div>
          <div className="mt-3 text-[10px] text-[#27AE60] bg-white p-2 rounded-sm border border-[#27AE60]/20 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Remains {sampleSize > 1 && !useBessels ? '36.00' : 'constant'} regardless of N!</span>
          </div>
        </div>

        {/* Standard Deviation Card */}
        <div className="bg-[#F5F2ED] p-4.5 rounded-sm border border-[#1A1A1A]/10 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs text-[#1A1A1A] font-semibold mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Standard Deviation (s / &sigma;)</span>
              <span className="text-[9px] font-mono bg-white text-[#1A1A1A] px-1.5 py-0.5 rounded-sm border border-[#1A1A1A]/20 font-bold">
                Original Units
              </span>
            </div>
            <div className="text-2xl font-serif font-black text-[#1A1A1A] my-2">
              {standardDeviation.toFixed(2)}" <span className="text-xs text-[#767676] font-normal font-sans">inches</span>
            </div>
            <p className="text-[11px] text-[#555555] leading-relaxed font-mono">
              = &radic;({variance.toFixed(2)})
            </p>
          </div>
          <div className="mt-3 text-[10px] text-[#555555] bg-white p-2 rounded-sm border border-[#1A1A1A]/10">
            Average spread is 6 inches from mean 66".
          </div>
        </div>
      </div>

      {/* Bessel's correction educational accordion */}
      <div className="bg-[#F5F2ED] rounded-sm p-3.5 border border-[#1A1A1A]/10 text-xs">
        <button
          onClick={() => setShowBesselDetails(!showBesselDetails)}
          className="flex items-center justify-between w-full text-[#1A1A1A] hover:text-[#E67E22] text-left font-medium"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#E67E22]" />
            <span className="font-semibold">Why divide by (N - 1) instead of N? (Bessel's Correction Note)</span>
          </span>
          <span className="text-[#767676] text-[11px]">{showBesselDetails ? '▲ Hide' : '▼ Read Note'}</span>
        </button>

        {showBesselDetails && (
          <div className="mt-2.5 pt-2.5 border-t border-[#1A1A1A]/10 text-[#555555] space-y-1.5 leading-relaxed text-[11px]">
            <p>
              When we calculate variance on a <em>sample</em> rather than the entire universe of students, the sample mean ȳ tends to be slightly closer to our sample points than the true population mean &mu; is.
            </p>
            <p>
              Dividing by N slightly <em>underestimates</em> the true population spread. Using (N - 1) in the denominator corrects for this sample bias (known as Bessel's correction). For large sample sizes (like N=100), 3600/100 = 36 vs 3600/99 = 36.36, the difference is tiny, but the concept is identical: <strong>we are computing the average squared deviation</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
