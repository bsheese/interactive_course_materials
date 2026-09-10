import React, { useState } from 'react';
import { Ruler, ArrowDownUp, Sparkles, Check } from 'lucide-react';

export const StandardDeviationWidget: React.FC = () => {
  const [sdValue, setSdValue] = useState<number>(6); // Default 6" for Sample B
  const mean = 66;

  const variance = sdValue * sdValue;

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Unit Recovery: Variance &rarr; Standard Deviation
            </h3>
            <p className="text-xs text-[#666666]">
              Transforming "squared inches" back into readable "inches" via square root
            </p>
          </div>
        </div>
      </div>

      {/* Dimensional analysis pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F5F2ED] p-4 rounded-sm border border-[#1A1A1A]/10 flex flex-col items-center text-center shadow-xs">
          <span className="text-[10px] text-[#767676] font-bold uppercase tracking-wider mb-1">Step 1: Deviations</span>
          <div className="text-xl font-mono font-bold text-[#1A1A1A] my-1">±6.0"</div>
          <span className="text-[10px] text-[#767676] font-mono">Unit: Inches</span>
          <span className="text-[10px] text-[#C0392B] mt-1 font-medium">Cancels to 0 if summed</span>
        </div>

        <div className="bg-[#F5F2ED] p-4 rounded-sm border border-[#1A1A1A]/10 flex flex-col items-center text-center shadow-xs">
          <span className="text-[10px] text-[#767676] font-bold uppercase tracking-wider mb-1">Step 2: Variance (s²)</span>
          <div className="text-xl font-mono font-bold text-[#E67E22] my-1">{variance.toFixed(0)} in²</div>
          <span className="text-[10px] text-[#E67E22] font-mono font-medium">Unit: Squared Inches</span>
          <span className="text-[10px] text-[#767676] mt-1">Average squared distance</span>
        </div>

        <div className="bg-[#ECE8E1] p-4 rounded-sm border border-[#1A1A1A]/20 flex flex-col items-center text-center shadow-xs">
          <span className="text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wider mb-1">Step 3: Standard Deviation (s)</span>
          <div className="text-xl font-serif font-black text-[#1A1A1A] my-1">
            &radic;({variance}) = {sdValue.toFixed(1)}"
          </div>
          <span className="text-[10px] text-[#27AE60] font-mono font-bold">Unit: Inches (Restored!)</span>
          <span className="text-[10px] text-[#555555] mt-1">Directly comparable to height</span>
        </div>
      </div>

      {/* Interactive Height Ruler with SD Bands */}
      <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#1A1A1A] font-semibold">
            Inspect Height Distribution Range around Mean ȳ = 66":
          </span>
          <span className="text-[#E67E22] font-mono font-bold bg-white px-2 py-0.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            &plusmn;1s = [{mean - sdValue}", {mean + sdValue}"]
          </span>
        </div>

        {/* Ruler visualization */}
        <div className="relative pt-6 pb-8 px-4">
          {/* Main ruler line */}
          <div className="w-full h-3 bg-white rounded-full relative overflow-visible border border-[#1A1A1A]/20 shadow-inner">
            {/* 1 SD Band */}
            <div
              style={{
                left: `${((mean - sdValue - 48) / 36) * 100}%`,
                width: `${((sdValue * 2) / 36) * 100}%`
              }}
              className="absolute top-0 bottom-0 bg-[#E67E22]/20 border-x-2 border-[#E67E22] flex items-center justify-center"
            >
              <span className="text-[9px] font-mono text-[#1A1A1A] font-bold bg-white/90 px-1.5 py-0.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
                ±1 Standard Deviation ({sdValue}")
              </span>
            </div>

            {/* Mean marker */}
            <div
              style={{ left: `${((mean - 48) / 36) * 100}%` }}
              className="absolute -top-3 bottom-0 -translate-x-1/2 flex flex-col items-center z-10"
            >
              <div className="w-1 h-9 bg-[#1A1A1A] rounded-full shadow-xs"></div>
              <span className="text-[10px] font-mono font-bold text-white bg-[#1A1A1A] px-1.5 py-0.5 rounded-sm mt-1 shadow-xs">
                Mean: 66"
              </span>
            </div>

            {/* Lower Bound */}
            <div
              style={{ left: `${((mean - sdValue - 48) / 36) * 100}%` }}
              className="absolute -bottom-6 -translate-x-1/2 flex flex-col items-center"
            >
              <span className="text-[10px] font-mono text-[#E67E22] font-bold">
                {mean - sdValue}" (60")
              </span>
            </div>

            {/* Upper Bound */}
            <div
              style={{ left: `${((mean + sdValue - 48) / 36) * 100}%` }}
              className="absolute -bottom-6 -translate-x-1/2 flex flex-col items-center"
            >
              <span className="text-[10px] font-mono text-[#E67E22] font-bold">
                {mean + sdValue}" (72")
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-sm border border-[#1A1A1A]/10 text-xs text-[#555555] flex items-start gap-2.5 shadow-xs leading-relaxed">
          <Sparkles className="w-4 h-4 text-[#E67E22] shrink-0 mt-0.5" />
          <span>
            <strong>Summary for Sample B:</strong> Mean is <strong>66 inches</strong> with a Standard Deviation of <strong>6 inches</strong>. This succinctly describes that our students typically fall 6 inches away from the 66-inch center.
          </span>
        </div>
      </div>
    </div>
  );
};
