import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateOLS } from '../stats';
import { Percent, Check, HelpCircle, Activity } from 'lucide-react';

export const PearsonsRWidget: React.FC = () => {
  const [noiseLevel, setNoiseLevel] = useState<number>(2.0); // 0 (perfect line r=1.0) to 10 (random r=0.0)

  const dataset = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const shoeSize = 6.0 + (i / 100) * 7.5;
      const noise = (Math.sin(i * 13) * 1.5 + Math.cos(i * 7) * 1.5) * (noiseLevel / 2);
      const height = 48 + 1.9 * shoeSize + noise;
      return {
        id: i + 1,
        shoeSize,
        height,
      };
    });
  }, [noiseLevel]);

  const ols = useMemo(() => calculateOLS(dataset), [dataset]);
  const r = ols.r;
  const cov = ols.cov;
  const sdX = ols.sdX;
  const sdY = ols.sdY;
  const denominator = sdX * sdY;

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Pearson's Correlation Coefficient (r)
            </h3>
            <p className="text-xs text-[#666666]">
              Unitless standardization: Cov(X,Y) / (s_x &times; s_y)
            </p>
          </div>
        </div>
      </div>

      {/* Unit Cancellation Equation Breakdown */}
      <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
        <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">
          Unit Cancellation in Action:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs font-mono">
          <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 shadow-xs space-y-1">
            <span className="text-[10px] text-[#767676] block uppercase font-sans">Numerator: Covariance</span>
            <span className="text-lg font-serif font-bold text-[#1A1A1A] block">{cov.toFixed(2)}</span>
            <span className="text-[10px] text-[#E67E22] font-semibold block">inches × shoe-sizes</span>
          </div>

          <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 shadow-xs space-y-1">
            <span className="text-[10px] text-[#767676] block uppercase font-sans">Denominator: (s_x × s_y)</span>
            <span className="text-sm font-serif font-bold text-[#1A1A1A] block mt-1">
              {sdX.toFixed(2)} × {sdY.toFixed(2)} = {denominator.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#E67E22] font-semibold block">shoe-sizes × inches</span>
          </div>

          <div className="p-3.5 bg-white rounded-sm border border-[#27AE60]/40 shadow-xs space-y-1">
            <span className="text-[10px] text-[#27AE60] font-bold block uppercase font-sans">Pearson's r</span>
            <span className="text-2xl font-serif font-black text-[#27AE60] block">{r.toFixed(3)}</span>
            <span className="text-[10px] text-[#27AE60] font-bold block">100% UNITLESS</span>
          </div>
        </div>
      </div>

      {/* Interactive Noise Slider & Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Noise Slider */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-xs text-[#1A1A1A] mb-1 font-semibold">
              <span>Adjust Scatter Noise / Spread:</span>
              <span className="font-mono text-[#E67E22] font-bold">
                {noiseLevel === 0 ? 'Pure Deterministic Line' : `Noise: ${noiseLevel.toFixed(1)}`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(Number(e.target.value))}
              className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
            />
            <div className="flex justify-between text-[10px] text-[#767676] font-mono mt-1">
              <span>0 (Perfect r = 1.0)</span>
              <span>Moderate noise</span>
              <span>High noise (r &rarr; 0)</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-sm text-[11px] text-[#555555] border border-[#1A1A1A]/10 shadow-xs leading-relaxed">
            <strong className="text-[#1A1A1A]">Key Rule:</strong> Pearson's <em>r</em> is bounded strictly between <strong>-1.0 and +1.0</strong>. An <em>r</em> of {r.toFixed(2)} indicates a <strong>{r > 0.7 ? 'Strong Positive' : r > 0.3 ? 'Moderate Positive' : 'Weak'}</strong> linear association.
          </div>
        </div>

        {/* Right: Real-time Gauge Meter */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] mb-4">
            Correlation Gauge (-1.0 to +1.0)
          </span>

          <div className="w-full max-w-xs relative py-4">
            {/* Horizontal Track */}
            <div className="h-3.5 bg-[#ECE8E1] border border-[#1A1A1A]/15 rounded-full relative shadow-inner">
              {/* Zero Marker */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#1A1A1A]/40 -translate-x-1/2"></div>
              {/* Current pointer */}
              <div
                style={{ left: `${((r + 1) / 2) * 100}%` }}
                className="absolute -top-2.5 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1A1A1A] text-white border-2 border-white shadow-md flex items-center justify-center transition-all duration-150"
              >
                <span className="text-[9px] font-mono font-bold">
                  {r.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-[#767676] font-mono mt-3">
              <span className="text-[#C0392B] font-semibold">-1.0 (Inverse)</span>
              <span>0.0 (None)</span>
              <span className="text-[#27AE60] font-semibold">+1.0 (Direct)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
