import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateOLS, calculateRSS } from '../stats';
import { Compass, RotateCw, Sliders, Check } from 'lucide-react';

export const ScatterLineRulerWidget: React.FC = () => {
  const dataset = useMemo(() => generateShoeHeightDataset(100, 42), []);
  const ols = useMemo(() => calculateOLS(dataset), [dataset]);

  // User draggable slope and intercept
  const [slope, setSlope] = useState<number>(1.2);
  const [intercept, setIntercept] = useState<number>(54.0);

  const rss = useMemo(() => calculateRSS(dataset, slope, intercept), [dataset, slope, intercept]);
  const olsRss = useMemo(() => calculateRSS(dataset, ols.slope, ols.intercept), [dataset, ols]);

  const snapToBestFit = () => {
    setSlope(Number(ols.slope.toFixed(2)));
    setIntercept(Number(ols.intercept.toFixed(2)));
  };

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Drawing Lines Through Noisy Clouds
            </h3>
            <p className="text-xs text-[#666666]">
              Manually steer the line y = mx + b with your virtual ruler
            </p>
          </div>
        </div>

        <button
          onClick={snapToBestFit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-[#1A1A1A] hover:bg-[#333333] text-white rounded-sm transition-colors font-medium shadow-xs"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Snap to Best Fit Line</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Controls Column */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">
              Line Parameters (ŷ = mx + b):
            </div>

            {/* Slope Slider */}
            <div>
              <div className="flex justify-between text-xs text-[#1A1A1A] mb-1">
                <span className="font-semibold">Slope (m):</span>
                <span className="font-mono text-[#E67E22] font-bold">{slope.toFixed(2)} in/size</span>
              </div>
              <input
                type="range"
                min={-1.5}
                max={4.0}
                step={0.05}
                value={slope}
                onChange={(e) => setSlope(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
              />
              <div className="flex justify-between text-[10px] text-[#767676] font-mono">
                <span>-1.5</span>
                <span>0.0</span>
                <span>+4.0</span>
              </div>
            </div>

            {/* Intercept Slider */}
            <div>
              <div className="flex justify-between text-xs text-[#1A1A1A] mb-1">
                <span className="font-semibold">Y-Intercept (b):</span>
                <span className="font-mono text-[#E67E22] font-bold">{intercept.toFixed(1)}"</span>
              </div>
              <input
                type="range"
                min={30.0}
                max={75.0}
                step={0.5}
                value={intercept}
                onChange={(e) => setIntercept(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
              />
              <div className="flex justify-between text-[10px] text-[#767676] font-mono">
                <span>30.0"</span>
                <span>52.0"</span>
                <span>75.0"</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-1 shadow-xs">
            <span className="text-[10px] text-[#767676] font-mono uppercase font-bold">Current Error Score (RSS):</span>
            <div className="text-xl font-serif font-black text-[#C0392B]">
              {rss.toFixed(0)} <span className="text-xs font-normal text-[#767676] font-sans">in²</span>
            </div>
            <div className="text-[10px] text-[#555555] font-mono">
              Optimal Best Fit RSS: <span className="text-[#27AE60] font-bold">{olsRss.toFixed(0)} in²</span>
            </div>
          </div>
        </div>

        {/* Scatter Canvas Column */}
        <div className="md:col-span-2 bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
          <div className="relative w-full h-60 bg-white rounded-sm border border-[#1A1A1A]/10 p-2 overflow-hidden shadow-inner">
            <svg viewBox="0 0 500 240" className="w-full h-full">
              {/* Axes */}
              <line x1="40" y1="210" x2="480" y2="210" stroke="#E2DDD5" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="210" stroke="#E2DDD5" strokeWidth="1.5" />

              {/* Data points */}
              {dataset.map((pt) => {
                const cx = 40 + ((pt.shoeSize - 5.5) / 8.5) * 440;
                const cy = 210 - ((pt.height - 54) / 26) * 190;
                return (
                  <circle
                    key={pt.id}
                    cx={cx}
                    cy={cy}
                    r="3"
                    fill="#1A1A1A"
                    opacity="0.45"
                  />
                );
              })}

              {/* Current User Line */}
              {(() => {
                const x1 = 5.5;
                const y1 = slope * x1 + intercept;
                const x2 = 14.0;
                const y2 = slope * x2 + intercept;

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
                    stroke="#E67E22"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                );
              })()}

              {/* Centroid Point (x̄, ȳ) */}
              {(() => {
                const cx = 40 + ((ols.meanX - 5.5) / 8.5) * 440;
                const cy = 210 - ((ols.meanY - 54) / 26) * 190;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill="#1A1A1A"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })()}

              <text x="260" y="235" fill="#767676" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                Shoe Size &rarr;
              </text>
              <text x="15" y="115" fill="#767676" fontSize="10" textAnchor="middle" transform="rotate(-90 15 115)" fontFamily="sans-serif">
                Height (Inches) &rarr;
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#555555] bg-white p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] inline-block"></span>
              Point of Means Centroid: ({ols.meanX.toFixed(1)}, {ols.meanY.toFixed(1)}")
            </span>
            <span className="text-[#E67E22] font-mono font-bold">
              Line equation: ŷ = {slope.toFixed(2)}x + {intercept.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
