import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateOLS } from '../stats';
import { Sparkles, Calculator, UserCheck, ArrowRight } from 'lucide-react';

export const BestFitRegressionWidget: React.FC = () => {
  const dataset = useMemo(() => generateShoeHeightDataset(100, 42), []);
  const ols = useMemo(() => calculateOLS(dataset), [dataset]);

  // Unseen student shoe size input
  const [unseenShoe, setUnseenShoe] = useState<number>(10.5);

  const predictedHeight = ols.slope * unseenShoe + ols.intercept;
  const standardErrorOfEstimate = Math.sqrt(
    dataset.reduce((sum, d) => sum + Math.pow(d.height - (ols.slope * d.shoeSize + ols.intercept), 2), 0) / (dataset.length - 2)
  );

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Ordinary Least Squares (OLS): Closed-Form Solution
            </h3>
            <p className="text-xs text-[#666666]">
              Optimal Slope: m = r &times; (s_y / s_x) & Intercept: b = ȳ - m&times;x̄
            </p>
          </div>
        </div>
      </div>

      {/* Assembly of Components Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#F5F2ED] p-3.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
          <span className="text-[10px] text-[#767676] block font-sans font-bold uppercase tracking-wider">1. Pearson's r</span>
          <span className="text-xl font-serif font-black text-[#27AE60]">{ols.r.toFixed(3)}</span>
          <span className="text-[10px] text-[#767676] block font-sans">Correlation strength</span>
        </div>

        <div className="bg-[#F5F2ED] p-3.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
          <span className="text-[10px] text-[#767676] block font-sans font-bold uppercase tracking-wider">2. Spread Ratio (s_y / s_x)</span>
          <span className="text-xl font-serif font-black text-[#1A1A1A]">
            {(ols.sdY / ols.sdX).toFixed(2)}
          </span>
          <span className="text-[10px] text-[#767676] block font-sans">{ols.sdY.toFixed(1)}" / {ols.sdX.toFixed(1)} sizes</span>
        </div>

        <div className="bg-[#F5F2ED] p-3.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
          <span className="text-[10px] text-[#E67E22] block font-sans font-bold uppercase tracking-wider">3. Optimal Slope (m)</span>
          <span className="text-xl font-serif font-black text-[#E67E22]">+{ols.slope.toFixed(2)}</span>
          <span className="text-[10px] text-[#767676] block font-sans">in. height per shoe size</span>
        </div>

        <div className="bg-[#F5F2ED] p-3.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
          <span className="text-[10px] text-[#E67E22] block font-sans font-bold uppercase tracking-wider">4. Intercept (b)</span>
          <span className="text-xl font-serif font-black text-[#E67E22]">{ols.intercept.toFixed(1)}"</span>
          <span className="text-[10px] text-[#767676] block font-sans">ȳ - m·x̄</span>
        </div>
      </div>

      {/* Live Forecast Engine for Unseen Student */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] mb-3">
              Forecast Unseen Subject Height:
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#1A1A1A]">
                <span className="font-semibold">Enter Shoe Size (x):</span>
                <span className="font-mono text-[#E67E22] font-bold text-base">Size {unseenShoe.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={6.0}
                max={14.0}
                step={0.5}
                value={unseenShoe}
                onChange={(e) => setUnseenShoe(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
              />
              <div className="flex justify-between text-[10px] text-[#767676] font-mono">
                <span>Size 6.0</span>
                <span>Size 10.0</span>
                <span>Size 14.0</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-1 shadow-xs">
            <span className="text-[10px] text-[#27AE60] font-mono uppercase font-bold">Optimal OLS Forecast (ŷ):</span>
            <div className="text-2xl font-serif font-black text-[#1A1A1A]">
              {predictedHeight.toFixed(1)}" <span className="text-xs text-[#767676] font-normal font-sans">({(predictedHeight / 12).toFixed(1)} ft)</span>
            </div>
            <div className="text-[10px] text-[#666666] font-mono">
              Confidence Range: ±{standardErrorOfEstimate.toFixed(1)}" [{(predictedHeight - standardErrorOfEstimate).toFixed(1)}", {(predictedHeight + standardErrorOfEstimate).toFixed(1)}"]
            </div>
          </div>
        </div>

        {/* Scatter Canvas with Best Fit Line and Forecast Marker */}
        <div className="md:col-span-2 bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
          <div className="relative w-full h-56 bg-white rounded-sm border border-[#1A1A1A]/10 p-2 overflow-hidden shadow-inner">
            <svg viewBox="0 0 500 220" className="w-full h-full">
              <line x1="40" y1="190" x2="480" y2="190" stroke="#E2DDD5" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="190" stroke="#E2DDD5" strokeWidth="1.5" />

              {/* Data points */}
              {dataset.map((pt) => {
                const cx = 40 + ((pt.shoeSize - 5.5) / 8.5) * 440;
                const cy = 190 - ((pt.height - 54) / 26) * 170;
                return (
                  <circle
                    key={pt.id}
                    cx={cx}
                    cy={cy}
                    r="2.5"
                    fill="#1A1A1A"
                    opacity="0.4"
                  />
                );
              })}

              {/* OLS Best fit Line */}
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
                    stroke="#E67E22"
                    strokeWidth="2.5"
                  />
                );
              })()}

              {/* Target prediction point */}
              {(() => {
                const targetX = 40 + ((unseenShoe - 5.5) / 8.5) * 440;
                const targetY = 190 - ((predictedHeight - 54) / 26) * 170;

                return (
                  <g>
                    <line x1={targetX} y1="20" x2={targetX} y2="190" stroke="#1A1A1A" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="40" y1={targetY} x2="480" y2={targetY} stroke="#1A1A1A" strokeDasharray="3 3" strokeWidth="1" />
                    <circle cx={targetX} cy={targetY} r="6" fill="#E67E22" stroke="#ffffff" strokeWidth="2" />
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-[#555555] bg-white p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            <span className="text-[#E67E22] font-mono font-bold">Best Fit Equation: ŷ = {ols.slope.toFixed(2)}x + {ols.intercept.toFixed(1)}</span>
            <span className="text-[#1A1A1A] font-mono font-medium">Predicted Point: ({unseenShoe.toFixed(1)}, {predictedHeight.toFixed(1)}")</span>
          </div>
        </div>
      </div>
    </div>
  );
};
