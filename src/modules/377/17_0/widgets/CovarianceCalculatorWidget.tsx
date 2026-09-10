import React, { useState, useMemo } from 'react';
import { generateShoeHeightDataset, calculateMean, calculateCovariance } from '../stats';
import { Sigma, ArrowRightLeft, Layers, Sliders } from 'lucide-react';

export const CovarianceCalculatorWidget: React.FC = () => {
  // Preset correlation slope slider to simulate positive, zero, or negative covariance
  const [relationshipType, setRelationshipType] = useState<'positive' | 'zero' | 'negative'>('positive');

  const dataset = useMemo(() => {
    const raw = generateShoeHeightDataset(100, 42);
    if (relationshipType === 'positive') return raw;
    if (relationshipType === 'zero') {
      // Shuffle heights randomly to eliminate correlation
      return raw.map((d, i) => ({
        ...d,
        height: 56 + ((i * 17) % 22) + Math.random() * 2,
      }));
    }
    // Negative relationship
    return raw.map(d => ({
      ...d,
      height: 80 - (d.shoeSize - 6) * 2.2 + (Math.random() * 3 - 1.5),
    }));
  }, [relationshipType]);

  const meanX = useMemo(() => calculateMean(dataset.map(d => d.shoeSize)), [dataset]);
  const meanY = useMemo(() => calculateMean(dataset.map(d => d.height)), [dataset]);
  const cov = useMemo(() => calculateCovariance(dataset, true), [dataset]);

  // Sample of individual cross-products for table preview
  const previewRows = useMemo(() => {
    return dataset.slice(0, 5).map(pt => {
      const devX = pt.shoeSize - meanX;
      const devY = pt.height - meanY;
      const crossProduct = devX * devY;
      return {
        id: pt.id,
        x: pt.shoeSize,
        y: pt.height,
        devX,
        devY,
        crossProduct,
      };
    });
  }, [dataset, meanX, meanY]);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECE8E1] text-[#E67E22] rounded-sm border border-[#1A1A1A]/10">
            <Sigma className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Covariance & The Cross-Product Engine
            </h3>
            <p className="text-xs text-[#666666]">
              Sum of Cross-Products divided by (N - 1)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#F5F2ED] p-1 rounded-sm border border-[#1A1A1A]/10 flex text-xs">
            <button
              onClick={() => setRelationshipType('positive')}
              className={`px-3 py-1 rounded-sm transition-colors font-medium ${relationshipType === 'positive' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
            >
              Positive Trend
            </button>
            <button
              onClick={() => setRelationshipType('zero')}
              className={`px-3 py-1 rounded-sm transition-colors font-medium ${relationshipType === 'zero' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
            >
              Zero Trend (Random)
            </button>
            <button
              onClick={() => setRelationshipType('negative')}
              className={`px-3 py-1 rounded-sm transition-colors font-medium ${relationshipType === 'negative' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
            >
              Negative Trend
            </button>
          </div>
        </div>
      </div>

      {/* Covariance Result Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 flex flex-col justify-between">
          <span className="text-[10px] text-[#1A1A1A] font-bold uppercase tracking-[0.15em]">Computed Covariance:</span>
          <div className="text-3xl font-serif font-black text-[#E67E22] my-2">
            {cov > 0 ? `+${cov.toFixed(2)}` : cov.toFixed(2)}
          </div>
          <span className="text-[10px] font-mono text-[#555555] bg-white p-1.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
            Units: inches × shoe-sizes
          </span>
        </div>

        <div className="md:col-span-2 bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] flex flex-col justify-between">
          <div className="font-serif font-bold text-sm text-[#1A1A1A] mb-1">
            Interpretation of Sign:
          </div>
          <p className="text-[#666666] leading-relaxed text-xs">
            {cov > 1 && "Strong positive covariance: As shoe size increases above average, height also consistently increases above average."}
            {cov < -1 && "Negative covariance: As shoe size increases, height decreases (an inverse association)."}
            {Math.abs(cov) <= 1 && "Near-zero covariance: Points cancel out evenly across all 4 quadrants; no linear trend exists."}
          </p>
          <div className="mt-2.5 text-[11px] text-[#444444] bg-white p-2.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs leading-relaxed">
            <strong className="text-[#1A1A1A]">The Limitation:</strong> What does "{cov.toFixed(1)} inches × shoe-sizes" actually mean? We cannot easily compare this to other studies without standardizing!
          </div>
        </div>
      </div>

      {/* Micro table of cross products */}
      <div className="bg-[#F5F2ED] p-5 rounded-sm border border-[#1A1A1A]/10 space-y-3">
        <div className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          Sample Student Cross-Product Breakdown (First 5 of 100 students):
        </div>

        <div className="overflow-x-auto bg-white rounded-sm border border-[#1A1A1A]/10 p-3 shadow-xs">
          <table className="w-full text-xs text-left font-mono">
            <thead>
              <tr className="border-b border-[#1A1A1A]/10 text-[10px] text-[#767676] uppercase">
                <th className="pb-2">Student</th>
                <th className="pb-2">Shoe (X)</th>
                <th className="pb-2">Dev (X - x̄)</th>
                <th className="pb-2">Height (Y)</th>
                <th className="pb-2">Dev (Y - ȳ)</th>
                <th className="pb-2 text-right">Cross-Product (DevX × DevY)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/5 text-[#1A1A1A]">
              {previewRows.map(r => (
                <tr key={r.id} className="hover:bg-[#F5F2ED]/50 transition-colors">
                  <td className="py-2 text-[#767676]">Student #{r.id}</td>
                  <td className="py-2 font-medium">{r.x.toFixed(1)}</td>
                  <td className={`py-2 font-semibold ${r.devX >= 0 ? 'text-[#27AE60]' : 'text-[#C0392B]'}`}>
                    {r.devX >= 0 ? `+${r.devX.toFixed(2)}` : r.devX.toFixed(2)}
                  </td>
                  <td className="py-2 font-medium">{r.y.toFixed(1)}"</td>
                  <td className={`py-2 font-semibold ${r.devY >= 0 ? 'text-[#27AE60]' : 'text-[#C0392B]'}`}>
                    {r.devY >= 0 ? `+${r.devY.toFixed(2)}` : r.devY.toFixed(2)}
                  </td>
                  <td className={`py-2 text-right font-bold ${r.crossProduct >= 0 ? 'text-[#27AE60]' : 'text-[#C0392B]'}`}>
                    {r.crossProduct >= 0 ? `+${r.crossProduct.toFixed(2)}` : r.crossProduct.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
