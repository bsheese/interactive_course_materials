import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateMean, calculateOLS } from '../stats';
import { Footprints, UserCheck, Sparkles, Filter } from 'lucide-react';

export const ShoeHeightScatterWidget: React.FC = () => {
  const dataset = useMemo(() => generateShoeHeightDataset(100, 77), []);
  const ols = useMemo(() => calculateOLS(dataset), [dataset]);

  const [unseenShoeSize, setUnseenShoeSize] = useState<number>(11.5);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'small' | 'large'>('all');

  // Conditional subset near the target shoe size
  const similarStudents = useMemo(() => {
    return dataset.filter(d => Math.abs(d.shoeSize - unseenShoeSize) <= 0.5);
  }, [dataset, unseenShoeSize]);

  const conditionalMeanHeight = useMemo(() => {
    if (similarStudents.length === 0) return ols.meanY;
    return calculateMean(similarStudents.map(s => s.height));
  }, [similarStudents, ols.meanY]);

  // Model predicted height using regression formula
  const modelPredictedHeight = ols.slope * unseenShoeSize + ols.intercept;

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Auxiliary Predictor: Shoe Size & Height
            </h3>
            <p className="text-xs text-[#666666]">
              100 students surveyed for both Shoe Size (barleycorns) & Height (inches)
            </p>
          </div>
        </div>
      </div>

      {/* Target Student Shoe Size Slider & Conditional Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left column: Unseen Student Input */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>Unseen Subject Target</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#1A1A1A]">
                <span className="font-semibold">Known Shoe Size:</span>
                <span className="font-mono text-[#E67E22] font-bold text-base">
                  US Size {unseenShoeSize.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={6.0}
                max={13.5}
                step={0.5}
                value={unseenShoeSize}
                onChange={(e) => setUnseenShoeSize(Number(e.target.value))}
                className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
              />
              <div className="flex justify-between text-[10px] text-[#767676] font-mono">
                <span>Size 6.0</span>
                <span>Avg: 9.5</span>
                <span>Size 13.5</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-1 shadow-xs">
            <span className="text-[10px] text-[#767676] font-mono uppercase font-bold">Conditional Height Prediction:</span>
            <div className="text-2xl font-serif font-black text-[#1A1A1A]">
              {modelPredictedHeight.toFixed(1)}"
            </div>
            <p className="text-[11px] text-[#666666] font-serif italic">
              (vs unconditional school mean of {ols.meanY.toFixed(1)}")
            </p>
          </div>
        </div>

        {/* Middle & Right columns: Scatter Visualization */}
        <div className="md:col-span-2 bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1A1A1A]/10">
            <span className="text-[#555555] font-medium">
              Scatter Cloud (100 Students) &bull; Size {unseenShoeSize} Subgroup Highlighted
            </span>
            <span className="text-[11px] font-mono text-[#27AE60] font-bold bg-white px-2 py-0.5 rounded-sm border border-[#1A1A1A]/10">
              {similarStudents.length} matching students in sample
            </span>
          </div>

          {/* SVG 2D Scatter plot */}
          <div className="relative w-full h-52 bg-white rounded-sm border border-[#1A1A1A]/10 p-2 overflow-hidden shadow-inner">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="40" y1="170" x2="480" y2="170" stroke="#E2DDD5" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="170" stroke="#E2DDD5" strokeWidth="1.5" />

              {/* Mean height horizontal line */}
              <line
                x1="40"
                y1={170 - ((ols.meanY - 55) / 25) * 150}
                x2="480"
                y2={170 - ((ols.meanY - 55) / 25) * 150}
                stroke="#1A1A1A"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x="475"
                y={170 - ((ols.meanY - 55) / 25) * 150 - 4}
                fill="#767676"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                Mean Height ({ols.meanY.toFixed(1)}")
              </text>

              {/* Target shoe size vertical highlight column */}
              {(() => {
                const xTarget = 40 + ((unseenShoeSize - 5.5) / 8.5) * 440;
                return (
                  <>
                    <rect
                      x={xTarget - 16}
                      y="20"
                      width="32"
                      height="150"
                      fill="#E67E22"
                      fillOpacity="0.12"
                      stroke="#E67E22"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <line x1={xTarget} y1="20" x2={xTarget} y2="170" stroke="#E67E22" strokeWidth="1.5" />
                    <circle
                      cx={xTarget}
                      cy={170 - ((modelPredictedHeight - 55) / 25) * 150}
                      r="6"
                      fill="#E67E22"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                );
              })()}

              {/* Data points */}
              {dataset.map((pt) => {
                const cx = 40 + ((pt.shoeSize - 5.5) / 8.5) * 440;
                const cy = 170 - ((pt.height - 55) / 25) * 150;
                const isMatch = Math.abs(pt.shoeSize - unseenShoeSize) <= 0.5;

                return (
                  <circle
                    key={pt.id}
                    cx={cx}
                    cy={cy}
                    r={isMatch ? 4.5 : 2.5}
                    fill={isMatch ? '#E67E22' : '#1A1A1A'}
                    stroke={isMatch ? '#ffffff' : 'none'}
                    strokeWidth={isMatch ? 1.5 : 0}
                    opacity={isMatch ? 1 : 0.4}
                  />
                );
              })}

              {/* Axis labels */}
              <text x="260" y="195" fill="#767676" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                Shoe Size (US Men's) &rarr;
              </text>
              <text x="15" y="100" fill="#767676" fontSize="10" textAnchor="middle" transform="rotate(-90 15 100)" fontFamily="sans-serif">
                Height (Inches) &rarr;
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#555555] bg-white p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            <span>
              If shoe size is <strong>{unseenShoeSize}</strong>, heights cluster around <strong>{conditionalMeanHeight.toFixed(1)}"</strong> instead of the broad school average.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
