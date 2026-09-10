import React, { useMemo, useState } from 'react';
import { Sliders } from 'lucide-react';
import { calculateMean } from '@kit/stats';

/**
 * Widget template.
 *
 * Conventions worth keeping:
 *  - Self-contained: a widget owns its own state and needs no props, so slides
 *    stay declarative and a widget can be reused on more than one slide.
 *  - Deterministic data: seed anything random (see @kit/stats seededRandom) so
 *    the numbers on the projector match the numbers on a student's laptop.
 *  - The card chrome below matches the rest of the site; keep it for
 *    consistency and put your visual inside it.
 */
export const ExampleWidget: React.FC = () => {
  const [n, setN] = useState(10);

  const values = useMemo(() => Array.from({ length: n }, (_, i) => i + 1), [n]);
  const mean = calculateMean(values);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#1A1A1A]/10 flex items-center gap-2.5">
        <div className="p-2 bg-[#ECE8E1] rounded-sm border border-[#1A1A1A]/10">
          <Sliders className="w-4 h-4 text-[#E67E22]" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">Example Widget</h3>
          <p className="text-xs text-[#666666]">Replace this with the real interaction.</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <label className="block text-xs font-sans text-[#4A4A4A]">
          n = <span className="font-mono font-bold text-[#1A1A1A]">{n}</span>
          <input
            type="range"
            min={1}
            max={50}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full mt-2 accent-[#E67E22]"
          />
        </label>

        <p className="text-xs font-mono text-[#333333]">
          mean(1…{n}) = <span className="font-bold text-[#E67E22]">{mean.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
};
