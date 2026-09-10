import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateMean } from '../stats';
import { Grid, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';

export const FourQuadrantsWidget: React.FC = () => {
  const dataset = useMemo(() => generateShoeHeightDataset(100, 42), []);
  const meanX = useMemo(() => calculateMean(dataset.map(d => d.shoeSize)), [dataset]);
  const meanY = useMemo(() => calculateMean(dataset.map(d => d.height)), [dataset]);

  const [hoveredQuadrant, setHoveredQuadrant] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | null>(null);

  // Classify points into 4 quadrants
  const quadrantStats = useMemo(() => {
    let q1 = 0; // Top-Right: + Shoe, + Height (Tall & Big Feet)
    let q2 = 0; // Top-Left: - Shoe, + Height (Tall & Small Feet)
    let q3 = 0; // Bottom-Left: - Shoe, - Height (Short & Small Feet)
    let q4 = 0; // Bottom-Right: + Shoe, - Height (Short & Big Feet)

    dataset.forEach(pt => {
      const devX = pt.shoeSize - meanX;
      const devY = pt.height - meanY;

      if (devX >= 0 && devY >= 0) q1++;
      else if (devX < 0 && devY >= 0) q2++;
      else if (devX < 0 && devY < 0) q3++;
      else if (devX >= 0 && devY < 0) q4++;
    });

    return { q1, q2, q3, q4 };
  }, [dataset, meanX, meanY]);

  const positiveDiagonalCount = quadrantStats.q1 + quadrantStats.q3;
  const negativeDiagonalCount = quadrantStats.q2 + quadrantStats.q4;

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              The 4 Centered Quadrants: Sign Arithmetic
            </h3>
            <p className="text-xs text-[#666666]">
              Centering axes at (x̄ = {meanX.toFixed(1)}, ȳ = {meanY.toFixed(1)}")
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 2D 4-Quadrant Visual Canvas */}
        <div className="md:col-span-2 bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
          <div className="relative w-full h-64 bg-white rounded-sm border border-[#1A1A1A]/10 overflow-hidden shadow-inner">
            <svg viewBox="0 0 400 240" className="w-full h-full">
              {/* Quadrant backgrounds */}
              {/* Q2: Top-Left */}
              <rect
                x="20"
                y="10"
                width="180"
                height="110"
                fill="#C0392B"
                fillOpacity={hoveredQuadrant === 'Q2' ? '0.18' : '0.06'}
                onMouseEnter={() => setHoveredQuadrant('Q2')}
                onMouseLeave={() => setHoveredQuadrant(null)}
                className="cursor-pointer transition-all"
              />
              {/* Q1: Top-Right */}
              <rect
                x="200"
                y="10"
                width="180"
                height="110"
                fill="#27AE60"
                fillOpacity={hoveredQuadrant === 'Q1' ? '0.18' : '0.06'}
                onMouseEnter={() => setHoveredQuadrant('Q1')}
                onMouseLeave={() => setHoveredQuadrant(null)}
                className="cursor-pointer transition-all"
              />
              {/* Q3: Bottom-Left */}
              <rect
                x="20"
                y="120"
                width="180"
                height="110"
                fill="#27AE60"
                fillOpacity={hoveredQuadrant === 'Q3' ? '0.18' : '0.06'}
                onMouseEnter={() => setHoveredQuadrant('Q3')}
                onMouseLeave={() => setHoveredQuadrant(null)}
                className="cursor-pointer transition-all"
              />
              {/* Q4: Bottom-Right */}
              <rect
                x="200"
                y="120"
                width="180"
                height="110"
                fill="#C0392B"
                fillOpacity={hoveredQuadrant === 'Q4' ? '0.18' : '0.06'}
                onMouseEnter={() => setHoveredQuadrant('Q4')}
                onMouseLeave={() => setHoveredQuadrant(null)}
                className="cursor-pointer transition-all"
              />

              {/* Centered Axis Lines at (Mean X, Mean Y) */}
              <line x1="200" y1="10" x2="200" y2="230" stroke="#1A1A1A" strokeWidth="1.5" />
              <line x1="20" y1="120" x2="380" y2="120" stroke="#1A1A1A" strokeWidth="1.5" />

              {/* Axis Centroid Labels */}
              <text x="205" y="22" fill="#1A1A1A" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                ȳ = {meanY.toFixed(1)}"
              </text>
              <text x="375" y="115" fill="#1A1A1A" fontSize="9" textAnchor="end" fontWeight="bold" fontFamily="sans-serif">
                x̄ = {meanX.toFixed(1)}
              </text>

              {/* Quadrant Sign Badges */}
              <text x="100" y="30" fill="#C0392B" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Top-Left [- × + = -]
              </text>
              <text x="300" y="30" fill="#27AE60" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Top-Right [+ × + = +]
              </text>
              <text x="100" y="225" fill="#27AE60" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Bottom-Left [- × - = +]
              </text>
              <text x="300" y="225" fill="#C0392B" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Bottom-Right [+ × - = -]
              </text>

              {/* Scatter Points colored by sign of product */}
              {dataset.map(pt => {
                const devX = pt.shoeSize - meanX;
                const devY = pt.height - meanY;
                const isPositiveProduct = (devX * devY) >= 0;

                const cx = 200 + (devX / 4.5) * 160;
                const cy = 120 - (devY / 14) * 100;

                return (
                  <circle
                    key={pt.id}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill={isPositiveProduct ? '#27AE60' : '#C0392B'}
                    stroke="#ffffff"
                    strokeWidth="0.75"
                    opacity="0.85"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-[#555555] bg-white p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            <span>Product of deviations is <strong className="text-[#27AE60]">Positive (+)</strong></span>
            <span>Product of deviations is <strong className="text-[#C0392B]">Negative (-)</strong></span>
          </div>
        </div>

        {/* Quadrant Counts & Balance Test */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] mb-3">
              Quadrant Distribution Census
            </div>

            <div className="space-y-2 text-xs">
              <div
                onMouseEnter={() => setHoveredQuadrant('Q1')}
                onMouseLeave={() => setHoveredQuadrant(null)}
                className={`p-2.5 rounded-sm border transition-colors cursor-pointer shadow-xs ${
                  hoveredQuadrant === 'Q1' ? 'bg-[#27AE60]/10 border-[#27AE60]' : 'bg-white border-[#1A1A1A]/10'
                }`}
              >
                <div className="flex justify-between font-mono font-bold text-[#27AE60]">
                  <span className="text-[#1A1A1A] font-sans font-medium">Top-Right (Tall/Big):</span>
                  <span>{quadrantStats.q1} students (+)</span>
                </div>
              </div>

              <div
                onMouseEnter={() => setHoveredQuadrant('Q3')}
                onMouseLeave={() => setHoveredQuadrant(null)}
                className={`p-2.5 rounded-sm border transition-colors cursor-pointer shadow-xs ${
                  hoveredQuadrant === 'Q3' ? 'bg-[#27AE60]/10 border-[#27AE60]' : 'bg-white border-[#1A1A1A]/10'
                }`}
              >
                <div className="flex justify-between font-mono font-bold text-[#27AE60]">
                  <span className="text-[#1A1A1A] font-sans font-medium">Bottom-Left (Short/Small):</span>
                  <span>{quadrantStats.q3} students (+)</span>
                </div>
              </div>

              <div
                onMouseEnter={() => setHoveredQuadrant('Q2')}
                onMouseLeave={() => setHoveredQuadrant(null)}
                className={`p-2.5 rounded-sm border transition-colors cursor-pointer shadow-xs ${
                  hoveredQuadrant === 'Q2' ? 'bg-[#C0392B]/10 border-[#C0392B]' : 'bg-white border-[#1A1A1A]/10'
                }`}
              >
                <div className="flex justify-between font-mono font-bold text-[#C0392B]">
                  <span className="text-[#1A1A1A] font-sans font-medium">Top-Left (Tall/Small):</span>
                  <span>{quadrantStats.q2} students (-)</span>
                </div>
              </div>

              <div
                onMouseEnter={() => setHoveredQuadrant('Q4')}
                onMouseLeave={() => setHoveredQuadrant(null)}
                className={`p-2.5 rounded-sm border transition-colors cursor-pointer shadow-xs ${
                  hoveredQuadrant === 'Q4' ? 'bg-[#C0392B]/10 border-[#C0392B]' : 'bg-white border-[#1A1A1A]/10'
                }`}
              >
                <div className="flex justify-between font-mono font-bold text-[#C0392B]">
                  <span className="text-[#1A1A1A] font-sans font-medium">Bottom-Right (Short/Big):</span>
                  <span>{quadrantStats.q4} students (-)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-sm border border-[#27AE60]/30 text-xs text-[#27AE60] space-y-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 font-serif font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#27AE60] shrink-0" />
              <span>Positive Association Confirmed!</span>
            </div>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              {positiveDiagonalCount} positive products vs only {negativeDiagonalCount} negative products. Taller people overwhelmingly have bigger feet!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
