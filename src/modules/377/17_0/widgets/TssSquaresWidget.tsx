import React, { useState } from 'react';
import { Square, HelpCircle, Layers, Check } from 'lucide-react';

export const TssSquaresWidget: React.FC = () => {
  const [selectedDeviation, setSelectedDeviation] = useState<number>(6);
  const [sampleView, setSampleView] = useState<'sampleB' | 'sampleA' | 'slider'>('sampleB');

  // Interactive single deviation penalty comparison
  const [testDeviation, setTestDeviation] = useState<number>(10);
  const absolutePenalty = Math.abs(testDeviation);
  const squaredPenalty = Math.pow(testDeviation, 2);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Square className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Squaring Penalty & Total Sum of Squares (TSS)
            </h3>
            <p className="text-xs text-[#666666]">
              Why statistics squares errors instead of just taking absolute values
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#ECE8E1] p-1 rounded-sm border border-[#1A1A1A]/10 flex text-xs shadow-xs">
            <button
              onClick={() => setSampleView('sampleB')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${sampleView === 'sampleB' ? 'bg-[#E67E22] text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Sample B TSS
            </button>
            <button
              onClick={() => setSampleView('sampleA')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${sampleView === 'sampleA' ? 'bg-[#1A1A1A] text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Sample A TSS
            </button>
            <button
              onClick={() => setSampleView('slider')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${sampleView === 'slider' ? 'bg-white text-[#1A1A1A] font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Penalty Simulator
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Box: Step-by-step arithmetic */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#767676] uppercase tracking-[0.2em] mb-3">
              {sampleView === 'sampleB' && 'Sample B TSS Calculation (100 Students)'}
              {sampleView === 'sampleA' && 'Sample A TSS Calculation (100 Students)'}
              {sampleView === 'slider' && 'Non-Linear Squaring Penalty Engine'}
            </div>

            {sampleView === 'sampleB' && (
              <div className="space-y-3 text-xs text-[#1A1A1A]">
                <div className="p-3 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-2 font-mono shadow-xs">
                  <div className="flex justify-between text-[#555555]">
                    <span>50 students at 60":</span>
                    <span className="text-[#E67E22] font-bold">(60 - 66) = -6" &rarr; (-6)² = 36 in²</span>
                  </div>
                  <div className="flex justify-between text-[#555555]">
                    <span>50 students at 72":</span>
                    <span className="text-[#E67E22] font-bold">(72 - 66) = +6" &rarr; (+6)² = 36 in²</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-1 shadow-xs">
                  <div className="text-[10px] font-bold text-[#E67E22] uppercase tracking-wider">TSS Formula Summation:</div>
                  <div className="font-mono text-xs text-[#555555]">
                    TSS = (50 × 36) + (50 × 36) = 1,800 + 1,800
                  </div>
                  <div className="text-2xl font-serif font-black text-[#1A1A1A] pt-1">
                    TSS = 3,600 inches²
                  </div>
                </div>
              </div>
            )}

            {sampleView === 'sampleA' && (
              <div className="space-y-3 text-xs text-[#1A1A1A]">
                <div className="p-3 bg-white rounded-sm border border-[#1A1A1A]/10 font-mono shadow-xs">
                  <div className="flex justify-between text-[#555555]">
                    <span>100 students at 66":</span>
                    <span className="text-[#1A1A1A] font-bold">(66 - 66) = 0" &rarr; 0² = 0 in²</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 space-y-1 shadow-xs">
                  <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">TSS Formula Summation:</div>
                  <div className="font-mono text-xs text-[#555555]">
                    TSS = 100 × (0)²
                  </div>
                  <div className="text-2xl font-serif font-black text-[#1A1A1A] pt-1">
                    TSS = 0 inches²
                  </div>
                </div>
              </div>
            )}

            {sampleView === 'slider' && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-xs text-[#1A1A1A] mb-1.5 font-medium">
                    <span>Adjust Error Deviation (d):</span>
                    <span className="font-mono font-bold text-[#E67E22] text-sm">{testDeviation} units</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={testDeviation}
                    onChange={(e) => setTestDeviation(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#ECE8E1] rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
                  />
                  <div className="flex justify-between text-[10px] text-[#767676] font-mono mt-1">
                    <span>1 unit</span>
                    <span>10 units (100)</span>
                    <span>100 units (10,000)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 bg-white rounded-sm border border-[#1A1A1A]/10 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#767676] block mb-1">Absolute |d|</span>
                    <span className="text-lg font-bold text-[#1A1A1A]">{absolutePenalty}</span>
                  </div>
                  <div className="p-3 bg-white rounded-sm border border-[#1A1A1A]/10 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#E67E22] block mb-1">Squared Penalty d²</span>
                    <span className="text-lg font-black text-[#E67E22]">{squaredPenalty.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white rounded-sm text-xs text-[#555555] border border-[#1A1A1A]/10 shadow-xs leading-relaxed">
            <strong>Statistical Intuition:</strong> An error of 100 is treated not just 10× worse than an error of 10, but <strong>100× worse</strong> (10,000 vs 100)!
          </div>
        </div>

        {/* Right Box: Geometric Square Area Graphic */}
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-bold text-[#767676] uppercase tracking-[0.2em] mb-4">
            Geometric Area of Squared Error
          </div>

          <div className="relative flex items-center justify-center w-full h-52 bg-white rounded-sm border border-[#1A1A1A]/10 overflow-hidden shadow-inner p-4">
            {/* Visual square representing deviation */}
            {sampleView === 'sampleB' && (
              <div className="flex flex-col items-center animate-fadeIn">
                <div className="w-24 h-24 bg-[#E67E22]/15 border-2 border-[#E67E22] rounded-sm flex flex-col items-center justify-center shadow-xs">
                  <span className="text-xs font-mono font-bold text-[#1A1A1A]">6" × 6"</span>
                  <span className="text-sm font-mono font-black text-[#E67E22]">= 36 in²</span>
                </div>
                <span className="text-[11px] text-[#666666] font-serif italic mt-3">
                  Each student in Sample B contributes 1 square of area 36 in²
                </span>
              </div>
            )}

            {sampleView === 'sampleA' && (
              <div className="flex flex-col items-center animate-fadeIn">
                <div className="w-3 h-3 bg-[#1A1A1A] rounded-full"></div>
                <span className="text-xs font-mono font-bold text-[#1A1A1A] mt-2">0" × 0" = 0 in²</span>
                <span className="text-[11px] text-[#666666] font-serif italic mt-1">Zero area for all 100 students in Sample A</span>
              </div>
            )}

            {sampleView === 'slider' && (
              <div className="flex flex-col items-center animate-fadeIn">
                <div
                  style={{
                    width: `${Math.min(130, Math.max(18, testDeviation * 1.3))}px`,
                    height: `${Math.min(130, Math.max(18, testDeviation * 1.3))}px`
                  }}
                  className="bg-[#E67E22]/15 border-2 border-[#E67E22] rounded-sm flex flex-col items-center justify-center transition-all duration-200 shadow-xs"
                >
                  <span className="text-[10px] font-mono font-bold text-[#1A1A1A]">
                    {testDeviation} × {testDeviation}
                  </span>
                  <span className="text-xs font-mono font-black text-[#E67E22]">
                    {squaredPenalty.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-[#666666] font-serif italic mt-2">Area scales quadratically with distance</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
