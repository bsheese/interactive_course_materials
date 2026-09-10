import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateOLS, calculateResiduals, calculateRSS } from '../stats';
import { Square, CheckCircle, RotateCcw } from 'lucide-react';

export const ResidualSquaresWidget: React.FC = () => {
  const dataset = useMemo(() => generateShoeHeightDataset(100, 42), []);
  const ols = useMemo(() => calculateOLS(dataset), [dataset]);

  // Two candidate lines for comparison: Line 1 (Manual) vs Line 2 (OLS Optimal)
  const [lineMode, setLineMode] = useState<'compare' | 'manual'>('compare');
  const [manualSlope, setManualSlope] = useState<number>(0.8);
  const [manualIntercept, setManualIntercept] = useState<number>(58.0);

  const olsSlope = ols.slope;
  const olsIntercept = ols.intercept;

  const activeSlope = lineMode === 'compare' ? olsSlope : manualSlope;
  const activeIntercept = lineMode === 'compare' ? olsIntercept : manualIntercept;

  const residualsData = useMemo(() => {
    return calculateResiduals(dataset, activeSlope, activeIntercept);
  }, [dataset, activeSlope, activeIntercept]);

  const currentRss = useMemo(() => {
    return calculateRSS(dataset, activeSlope, activeIntercept);
  }, [dataset, activeSlope, activeIntercept]);

  const olsRss = useMemo(() => {
    return calculateRSS(dataset, olsSlope, olsIntercept);
  }, [dataset, olsSlope, olsIntercept]);

  const manualRss = useMemo(() => {
    return calculateRSS(dataset, manualSlope, manualIntercept);
  }, [dataset, manualSlope, manualIntercept]);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Square className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Residual Sum of Squares (RSS): Area of Error Squares
            </h3>
            <p className="text-xs text-[#666666]">
              The line with the smallest total square area wins!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#F5F2ED] p-1 rounded-sm border border-[#1A1A1A]/10 flex text-xs">
            <button
              onClick={() => setLineMode('compare')}
              className={`px-3 py-1 rounded-sm transition-colors font-medium ${lineMode === 'compare' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
            >
              OLS Best Fit Line
            </button>
            <button
              onClick={() => setLineMode('manual')}
              className={`px-3 py-1 rounded-sm transition-colors font-medium ${lineMode === 'manual' ? 'bg-[#E67E22] text-white shadow-xs' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
            >
              Manual Line Tweaker
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: RSS Scoreboard */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">
              Error Scoreboard (RSS = &sum; e_i&sup2;):
            </div>

            <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-1 shadow-xs">
              <span className="text-[10px] text-[#767676] font-mono font-bold uppercase">Current Displayed Line RSS:</span>
              <div className={`text-2xl font-serif font-black ${lineMode === 'compare' ? 'text-[#27AE60]' : 'text-[#E67E22]'}`}>
                {currentRss.toFixed(1)} <span className="text-xs font-normal text-[#767676] font-sans">in²</span>
              </div>
            </div>

            {lineMode === 'manual' && (
              <div className="space-y-3 pt-3 border-t border-[#1A1A1A]/10 text-xs">
                <div>
                  <div className="flex justify-between text-[#1A1A1A] mb-1 font-semibold">
                    <span>Manual Slope:</span>
                    <span className="font-mono text-[#E67E22] font-bold">{manualSlope.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={-0.5}
                    max={3.5}
                    step={0.05}
                    value={manualSlope}
                    onChange={(e) => setManualSlope(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#1A1A1A] mb-1 font-semibold">
                    <span>Manual Intercept:</span>
                    <span className="font-mono text-[#E67E22] font-bold">{manualIntercept.toFixed(1)}"</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={70}
                    step={0.5}
                    value={manualIntercept}
                    onChange={(e) => setManualIntercept(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white rounded-sm text-[11px] text-[#27AE60] border border-[#27AE60]/30 shadow-xs leading-relaxed">
            <strong>Optimal Minimum RSS:</strong> {olsRss.toFixed(1)} in². No line on earth can beat this minimum!
          </div>
        </div>

        {/* Right Column: Scatter Plot with Geometric Error Squares */}
        <div className="md:col-span-2 bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
          <div className="relative w-full h-64 bg-white rounded-sm border border-[#1A1A1A]/10 p-2 overflow-hidden shadow-inner">
            <svg viewBox="0 0 500 240" className="w-full h-full">
              {/* Axes */}
              <line x1="40" y1="210" x2="480" y2="210" stroke="#E2DDD5" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="210" stroke="#E2DDD5" strokeWidth="1.5" />

              {/* Draw Geometric Squares for a subset of points to keep visual clean & clear */}
              {residualsData.slice(0, 30).map(r => {
                const cx = 40 + ((r.x - 5.5) / 8.5) * 440;
                const cyActual = 210 - ((r.y - 54) / 26) * 190;
                const cyPredicted = 210 - ((r.yHat - 54) / 26) * 190;

                const side = Math.abs(cyActual - cyPredicted);
                const top = Math.min(cyActual, cyPredicted);
                const left = cx;

                return (
                  <rect
                    key={r.id}
                    x={left}
                    y={top}
                    width={side}
                    height={side}
                    fill={lineMode === 'compare' ? '#27AE60' : '#E67E22'}
                    fillOpacity="0.15"
                    stroke={lineMode === 'compare' ? '#27AE60' : '#E67E22'}
                    strokeWidth="0.8"
                  />
                );
              })}

              {/* Regression Line */}
              {(() => {
                const x1 = 5.5;
                const y1 = activeSlope * x1 + activeIntercept;
                const x2 = 14.0;
                const y2 = activeSlope * x2 + activeIntercept;

                const cx1 = 40;
                const cy1 = 210 - ((y1 - 54) / 26) * 190;
                const cx2 = 480;
                const cy2 = 210 - ((y2 - 54) / 26) * 190;

                return (
                  <line
                    x1={cx1}
                    y1={cy1}
                    x2={cx2}
                    y2={cy2}
                    stroke={lineMode === 'compare' ? '#27AE60' : '#E67E22'}
                    strokeWidth="2.5"
                  />
                );
              })()}

              {/* Data points */}
              {residualsData.map(r => {
                const cx = 40 + ((r.x - 5.5) / 8.5) * 440;
                const cy = 210 - ((r.y - 54) / 26) * 190;

                return (
                  <circle
                    key={r.id}
                    cx={cx}
                    cy={cy}
                    r="2.5"
                    fill="#1A1A1A"
                    opacity="0.5"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-[#555555] bg-white p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            <span>Geometric area of each square represents (y_i - ŷ_i)&sup2;</span>
            <span className="font-mono text-[#E67E22] font-bold">Total RSS = Combined area of all squares</span>
          </div>
        </div>
      </div>
    </div>
  );
};
