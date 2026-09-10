import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateOLS, calculateResiduals } from '../stats';
import { GitCommit, AlertCircle, RefreshCw } from 'lucide-react';

export const ResidualsBalanceWidget: React.FC = () => {
  const dataset = useMemo(() => generateShoeHeightDataset(100, 42), []);
  const ols = useMemo(() => calculateOLS(dataset), [dataset]);

  // Rotatable line passing through (meanX, meanY)
  const [slope, setSlope] = useState<number>(1.88);
  const intercept = useMemo(() => ols.meanY - slope * ols.meanX, [ols.meanY, ols.meanX, slope]);

  const residualsData = useMemo(() => {
    return calculateResiduals(dataset, slope, intercept);
  }, [dataset, slope, intercept]);

  const sumPositiveResiduals = useMemo(() => {
    return residualsData.filter(r => r.residual > 0).reduce((sum, r) => sum + r.residual, 0);
  }, [residualsData]);

  const sumNegativeResiduals = useMemo(() => {
    return residualsData.filter(r => r.residual < 0).reduce((sum, r) => sum + r.residual, 0);
  }, [residualsData]);

  const sumAllResiduals = useMemo(() => {
    return residualsData.reduce((sum, r) => sum + r.residual, 0);
  }, [residualsData]);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Residuals (y - ŷ) & Centroid Balance
            </h3>
            <p className="text-xs text-[#666666]">
              Drop lines from points to line & the zero-cancellation proof
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: Slope Adjuster & Residual Cancellation Stats */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">
              Line passing through centroid (x̄, ȳ):
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#1A1A1A] mb-1 font-semibold">
                <span>Rotate Slope (m):</span>
                <span className="font-mono text-[#E67E22] font-bold">{slope.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={-1.5}
                max={4.5}
                step={0.05}
                value={slope}
                onChange={(e) => setSlope(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
              />
              <div className="flex justify-between text-[10px] text-[#767676] font-mono">
                <span>Inverse (-1.5)</span>
                <span>Flat (0.0)</span>
                <span>Steep (+4.5)</span>
              </div>
            </div>

            {/* Summation metrics */}
            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 bg-white rounded-sm border border-[#1A1A1A]/10 text-[#27AE60] shadow-xs">
                <span className="font-sans font-medium text-[#1A1A1A]">Positive Residuals (&sum; e_i &gt; 0):</span>
                <span className="font-bold">+{sumPositiveResiduals.toFixed(1)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-white rounded-sm border border-[#1A1A1A]/10 text-[#C0392B] shadow-xs">
                <span className="font-sans font-medium text-[#1A1A1A]">Negative Residuals (&sum; e_i &lt; 0):</span>
                <span className="font-bold">{sumNegativeResiduals.toFixed(1)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#ECE8E1] rounded-sm border border-[#1A1A1A]/15 text-[#1A1A1A] font-bold shadow-xs">
                <span className="font-sans font-medium">Total Sum &sum;(y_i - ŷ_i):</span>
                <span className="font-mono">{Math.abs(sumAllResiduals) < 0.05 ? '0.00' : sumAllResiduals.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-sm text-[11px] text-[#555555] border border-[#1A1A1A]/10 shadow-xs leading-relaxed">
            <span className="text-[#E67E22] font-semibold">Important Rule:</span> Any line passing through the centroid (x̄, ȳ) balances residuals to exactly 0, regardless of how badly it tilts!
          </div>
        </div>

        {/* Right Column: Scatter Plot with Drop Lines */}
        <div className="md:col-span-2 bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
          <div className="relative w-full h-64 bg-white rounded-sm border border-[#1A1A1A]/10 p-2 overflow-hidden shadow-inner">
            <svg viewBox="0 0 500 240" className="w-full h-full">
              {/* Axes */}
              <line x1="40" y1="210" x2="480" y2="210" stroke="#E2DDD5" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="210" stroke="#E2DDD5" strokeWidth="1.5" />

              {/* Residual Vertical Drop-Lines */}
              {residualsData.map(r => {
                const cx = 40 + ((r.x - 5.5) / 8.5) * 440;
                const cyActual = 210 - ((r.y - 54) / 26) * 190;
                const cyPredicted = 210 - ((r.yHat - 54) / 26) * 190;
                const isUnderPrediction = r.residual >= 0; // Actual point is above line

                return (
                  <line
                    key={r.id}
                    x1={cx}
                    y1={cyActual}
                    x2={cx}
                    y2={cyPredicted}
                    stroke={isUnderPrediction ? '#27AE60' : '#C0392B'}
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    opacity="0.85"
                  />
                );
              })}

              {/* Regression Line */}
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
                  />
                );
              })()}

              {/* Data points */}
              {residualsData.map(r => {
                const cx = 40 + ((r.x - 5.5) / 8.5) * 440;
                const cy = 210 - ((r.y - 54) / 26) * 190;
                const isUnder = r.residual >= 0;

                return (
                  <circle
                    key={r.id}
                    cx={cx}
                    cy={cy}
                    r="3"
                    fill={isUnder ? '#27AE60' : '#C0392B'}
                    stroke="#ffffff"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Centroid Anchor (x̄, ȳ) */}
              {(() => {
                const cx = 40 + ((ols.meanX - 5.5) / 8.5) * 440;
                const cy = 210 - ((ols.meanY - 54) / 26) * 190;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="6"
                    fill="#1A1A1A"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-[#555555] bg-white p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            <span className="text-[#27AE60] font-medium">Positive residual (Point above line)</span>
            <span className="text-[#C0392B] font-medium">Negative residual (Point below line)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
