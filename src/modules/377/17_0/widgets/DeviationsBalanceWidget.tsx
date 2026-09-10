import React, { useState, useMemo } from 'react';
import { Scale, RotateCcw, Plus, Trash2, ArrowRight } from 'lucide-react';

export const DeviationsBalanceWidget: React.FC = () => {
  // Preset datasets: Sample A, Sample B, or Custom points
  const [selectedPreset, setSelectedPreset] = useState<'sampleB' | 'sampleA' | 'custom'>('sampleB');
  const [customPoints, setCustomPoints] = useState<number[]>([58, 62, 66, 70, 74]);
  const [newPointValue, setNewPointValue] = useState<number>(68);

  const activePoints = useMemo(() => {
    if (selectedPreset === 'sampleA') {
      return Array(10).fill(66);
    }
    if (selectedPreset === 'sampleB') {
      return [...Array(5).fill(60), ...Array(5).fill(72)];
    }
    return customPoints;
  }, [selectedPreset, customPoints]);

  const mean = useMemo(() => {
    if (activePoints.length === 0) return 0;
    return activePoints.reduce((s, v) => s + v, 0) / activePoints.length;
  }, [activePoints]);

  const deviations = useMemo(() => {
    return activePoints.map(v => Number((v - mean).toFixed(2)));
  }, [activePoints, mean]);

  const sumNegativeDeviations = useMemo(() => {
    return deviations.filter(d => d < 0).reduce((s, d) => s + d, 0);
  }, [deviations]);

  const sumPositiveDeviations = useMemo(() => {
    return deviations.filter(d => d > 0).reduce((s, d) => s + d, 0);
  }, [deviations]);

  const totalSumOfDeviations = useMemo(() => {
    return Number(deviations.reduce((s, d) => s + d, 0).toFixed(4));
  }, [deviations]);

  const addPoint = () => {
    if (customPoints.length >= 12) return;
    setCustomPoints([...customPoints, newPointValue].sort((a, b) => a - b));
    setSelectedPreset('custom');
  };

  const removePoint = (index: number) => {
    if (customPoints.length <= 2) return;
    setCustomPoints(customPoints.filter((_, i) => i !== index));
    setSelectedPreset('custom');
  };

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              The Deviations Balance Scale
            </h3>
            <p className="text-xs text-[#666666]">
              Visualizing why the sum of raw deviations &sum;(y_i - ȳ) always equals 0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#ECE8E1] p-1 rounded-sm border border-[#1A1A1A]/10 flex text-xs shadow-xs">
            <button
              onClick={() => setSelectedPreset('sampleB')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${selectedPreset === 'sampleB' ? 'bg-[#E67E22] text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Sample B (50@60", 50@72")
            </button>
            <button
              onClick={() => setSelectedPreset('sampleA')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${selectedPreset === 'sampleA' ? 'bg-[#1A1A1A] text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Sample A (All 66")
            </button>
            <button
              onClick={() => setSelectedPreset('custom')}
              className={`px-3 py-1 rounded-xs transition-colors font-medium ${selectedPreset === 'custom' ? 'bg-white text-[#1A1A1A] font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
            >
              Custom Values
            </button>
          </div>
        </div>
      </div>

      {/* Interactive See-Saw Fulcrum */}
      <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-4">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1A1A1A]/10">
          <span className="text-[#666666]">Sample Mean (Center Fulcrum ȳ):</span>
          <span className="font-mono text-[#E67E22] font-bold text-sm bg-white px-2.5 py-0.5 rounded-sm border border-[#1A1A1A]/10">
            {mean.toFixed(2)} inches
          </span>
        </div>

        {/* See-Saw Graphic */}
        <div className="py-6 px-4 relative flex flex-col items-center">
          {/* Points lying on horizontal balance line */}
          <div className="w-full h-1.5 bg-[#1A1A1A]/20 rounded-full relative mb-10 flex items-center">
            {/* Center Fulcrum Indicator */}
            <div className="absolute left-1/2 -top-4 -translate-x-1/2 flex flex-col items-center z-10">
              <span className="text-[10px] font-mono font-bold text-[#E67E22] bg-white px-1.5 py-0.5 rounded-sm border border-[#1A1A1A]/15 shadow-xs">
                Fulcrum ȳ = {mean.toFixed(1)}"
              </span>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#E67E22] mt-0.5"></div>
            </div>

            {/* Render Point Pins */}
            {activePoints.map((pt, idx) => {
              const dev = pt - mean;
              // Map height 50..82 onto 5%..95% width
              const leftPercent = Math.max(5, Math.min(95, 50 + (dev / 18) * 45));
              const isNegative = dev < 0;
              const isPositive = dev > 0;

              return (
                <div
                  key={idx}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute -top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shadow-xs transition-transform group-hover:scale-125 ${
                      isNegative
                        ? 'bg-[#C0392B] text-white'
                        : isPositive
                        ? 'bg-[#27AE60] text-white'
                        : 'bg-[#1A1A1A] text-white'
                    }`}
                  >
                    {pt}
                  </div>
                  <span
                    className={`text-[9px] font-mono mt-1 font-bold ${
                      isNegative ? 'text-[#C0392B]' : isPositive ? 'text-[#27AE60]' : 'text-[#767676]'
                    }`}
                  >
                    {dev > 0 ? `+${dev.toFixed(1)}` : dev.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Fulcrum Triangle */}
          <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-[#E67E22]"></div>
            <div className="w-24 h-2 bg-[#1A1A1A] rounded-sm mt-1"></div>
          </div>
        </div>

        {/* Sum of Negative vs Positive Deviations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-sm border border-[#1A1A1A]/10 text-center shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C0392B] block mb-1">
              Negative Deviations (y &lt; ȳ)
            </span>
            <span className="font-mono text-xl text-[#C0392B] font-bold">
              {sumNegativeDeviations.toFixed(1)}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-sm border border-[#1A1A1A]/10 text-center shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#27AE60] block mb-1">
              Positive Deviations (y &gt; ȳ)
            </span>
            <span className="font-mono text-xl text-[#27AE60] font-bold">
              +{sumPositiveDeviations.toFixed(1)}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-sm border border-[#1A1A1A]/10 text-center shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1A1A1A] block mb-1">
              Total Sum &sum;(y_i - ȳ)
            </span>
            <span className="font-mono text-xl text-[#E67E22] font-black">
              {Math.abs(totalSumOfDeviations) < 0.001 ? '0.00' : totalSumOfDeviations}
            </span>
          </div>
        </div>

        {/* Custom Point Builder if custom selected */}
        {selectedPreset === 'custom' && (
          <div className="pt-3 border-t border-[#1A1A1A]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#666666]">Add value:</span>
              <input
                type="number"
                min={50}
                max={85}
                value={newPointValue}
                onChange={(e) => setNewPointValue(Number(e.target.value))}
                className="w-16 bg-white border border-[#1A1A1A]/15 px-2 py-1 rounded-sm text-[#1A1A1A] font-mono shadow-xs"
              />
              <button
                onClick={addPoint}
                className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#E67E22] text-white rounded-sm font-medium flex items-center gap-1 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              {customPoints.map((pt, i) => (
                <span
                  key={i}
                  className="bg-white text-[#1A1A1A] px-2 py-0.5 rounded-sm font-mono flex items-center gap-1 text-[11px] border border-[#1A1A1A]/10 shadow-xs"
                >
                  {pt}"
                  <button
                    onClick={() => removePoint(i)}
                    className="text-[#888888] hover:text-[#C0392B]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
