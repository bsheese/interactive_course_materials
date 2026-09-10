import React, { useState, useMemo } from 'react';
import { generateSampleA, generateSampleB, calculateMean } from '../stats';
import { BarChart2, Eye, Info } from 'lucide-react';

export const SampleComparisonWidget: React.FC = () => {
  const [activeSample, setActiveSample] = useState<'A' | 'B' | 'both'>('both');
  const [highlightMean, setHighlightMean] = useState(true);

  const sampleA = useMemo(() => generateSampleA(100), []);
  const sampleB = useMemo(() => generateSampleB(100), []);

  const meanA = calculateMean(sampleA.map(d => d.height));
  const meanB = calculateMean(sampleB.map(d => d.height));

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Distribution Comparison (N = 100 students each)
            </h3>
            <p className="text-xs text-[#666666]">
              Sample A (Homogeneous) vs. Sample B (Bimodal)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#ECE8E1] p-1 rounded-sm border border-[#1A1A1A]/10 flex text-xs shadow-xs">
            <button
              onClick={() => setActiveSample('A')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${activeSample === 'A' ? 'bg-[#1A1A1A] text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Sample A Only
            </button>
            <button
              onClick={() => setActiveSample('B')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${activeSample === 'B' ? 'bg-[#E67E22] text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Sample B Only
            </button>
            <button
              onClick={() => setActiveSample('both')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${activeSample === 'both' ? 'bg-white text-[#1A1A1A] font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Side-by-Side
            </button>
          </div>
        </div>
      </div>

      {/* Visual Dot / Frequency Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sample A Box */}
        {(activeSample === 'A' || activeSample === 'both') && (
          <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]/10">
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-[#1A1A1A]"></span>
                Sample A (100 Students)
              </span>
              <span className="text-xs font-mono bg-white text-[#1A1A1A] px-2 py-0.5 rounded-sm border border-[#1A1A1A]/10 font-bold">
                Mean: {meanA.toFixed(1)}" (5'6")
              </span>
            </div>

            <p className="text-xs text-[#555555] leading-relaxed">
              Every single student is exactly <strong>66 inches</strong> tall. Zero variance, zero spread.
            </p>

            {/* Dot plot representation */}
            <div className="bg-white p-3 rounded-sm border border-[#1A1A1A]/10">
              <div className="h-28 flex items-end justify-center relative border-b border-[#1A1A1A]/20 pb-1">
                {/* 60 inches */}
                <div className="absolute left-[20%] bottom-2 flex flex-col items-center">
                  <span className="text-[10px] text-[#767676] font-mono">0 students</span>
                  <div className="w-8 h-1 bg-[#ECE8E1] rounded"></div>
                  <span className="text-[10px] text-[#4A4A4A] mt-1 font-mono">60"</span>
                </div>

                {/* 66 inches stack */}
                <div className="absolute left-[50%] -translate-x-1/2 bottom-2 flex flex-col items-center">
                  <span className="text-[10px] text-[#1A1A1A] font-mono font-bold mb-1">100 students</span>
                  <div className="w-12 h-20 bg-[#1A1A1A] rounded-sm flex flex-wrap gap-0.5 p-1 overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <span key={i} className="w-1 h-1 bg-amber-400 rounded-full inline-block"></span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#1A1A1A] mt-1 font-mono font-bold">66" (Mean)</span>
                </div>

                {/* 72 inches */}
                <div className="absolute right-[20%] bottom-2 flex flex-col items-center">
                  <span className="text-[10px] text-[#767676] font-mono">0 students</span>
                  <div className="w-8 h-1 bg-[#ECE8E1] rounded"></div>
                  <span className="text-[10px] text-[#4A4A4A] mt-1 font-mono">72"</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-sm border border-[#1A1A1A]/10 text-xs text-[#27AE60] font-medium">
              <strong>Guessing 66" for Sample A:</strong> Confidence is 100%. Guaranteed 0 error!
            </div>
          </div>
        )}

        {/* Sample B Box */}
        {(activeSample === 'B' || activeSample === 'both') && (
          <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]/10">
              <span className="text-xs font-bold text-[#E67E22] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-[#E67E22]"></span>
                Sample B (100 Students)
              </span>
              <span className="text-xs font-mono bg-white text-[#E67E22] px-2 py-0.5 rounded-sm border border-[#1A1A1A]/10 font-bold">
                Mean: {meanB.toFixed(1)}" (5'6")
              </span>
            </div>

            <p className="text-xs text-[#555555] leading-relaxed">
              50 students are <strong>60 inches</strong> (5'0") and 50 students are <strong>72 inches</strong> (6'0").
            </p>

            {/* Dot plot representation */}
            <div className="bg-white p-3 rounded-sm border border-[#1A1A1A]/10">
              <div className="h-28 flex items-end justify-center relative border-b border-[#1A1A1A]/20 pb-1">
                {/* 60 inches stack */}
                <div className="absolute left-[20%] -translate-x-1/2 bottom-2 flex flex-col items-center">
                  <span className="text-[10px] text-[#E67E22] font-mono font-bold mb-1">50 students</span>
                  <div className="w-10 h-14 bg-[#E67E22] rounded-sm flex flex-wrap gap-0.5 p-1 overflow-hidden">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <span key={i} className="w-1 h-1 bg-white rounded-full inline-block"></span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#E67E22] mt-1 font-mono font-bold">60"</span>
                </div>

                {/* 66 inches (0 students!) */}
                <div className="absolute left-[50%] -translate-x-1/2 bottom-2 flex flex-col items-center">
                  <span className="text-[10px] text-[#C0392B] font-mono font-bold mb-1">0 students!</span>
                  <div className="w-8 h-1 bg-rose-100 rounded border border-dashed border-[#C0392B]"></div>
                  <span className="text-[10px] text-[#C0392B] mt-1 font-mono font-bold">66" (Mean)</span>
                </div>

                {/* 72 inches stack */}
                <div className="absolute right-[20%] translate-x-1/2 bottom-2 flex flex-col items-center">
                  <span className="text-[10px] text-[#E67E22] font-mono font-bold mb-1">50 students</span>
                  <div className="w-10 h-14 bg-[#E67E22] rounded-sm flex flex-wrap gap-0.5 p-1 overflow-hidden">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <span key={i} className="w-1 h-1 bg-white rounded-full inline-block"></span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#E67E22] mt-1 font-mono font-bold">72"</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-sm border border-[#1A1A1A]/10 text-xs text-[#C0392B] font-medium">
              <strong>Guessing 66" for Sample B:</strong> 100% of guesses will be off by ±6 inches. 0 observed at mean!
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 p-3.5 bg-[#F5F2ED] rounded-sm border border-[#1A1A1A]/10 text-xs text-[#4A4A4A]">
        <Info className="w-4 h-4 text-[#E67E22] shrink-0" />
        <span>
          <strong>The Core Dilemma:</strong> Identical mean (<span className="font-serif italic font-bold">ȳ = 66"</span>), but completely different real-world confidence. We need a mathematical tool to capture the spread!
        </span>
      </div>
    </div>
  );
};
