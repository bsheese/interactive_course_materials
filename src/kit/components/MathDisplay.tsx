import React, { useState, useMemo } from 'react';
import { HelpCircle, Calculator } from 'lucide-react';
import katex from 'katex';

interface MathDisplayProps {
  latex: string;
  explanation: string;
  terms?: { symbol: string; meaning: string }[];
}

export const MathDisplay: React.FC<MathDisplayProps> = ({ latex, explanation, terms }) => {
  const [showDetails, setShowDetails] = useState(false);

  const renderedFormulaHtml = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return `<span class="font-mono text-base">${latex}</span>`;
    }
  }, [latex]);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-5 shadow-sm transition-all">
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#1A1A1A]/10 font-sans">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E67E22]">
          <Calculator className="w-3.5 h-3.5" />
          <span>Core Formula</span>
        </div>
        {terms && terms.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-[#4A4A4A] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors px-2 py-0.5 rounded-sm bg-[#ECE8E1] hover:bg-[#E2DDD5] border border-[#1A1A1A]/10 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-[#E67E22]" />
            <span>{showDetails ? 'Hide Breakdown' : 'Breakdown Terms'}</span>
          </button>
        )}
      </div>

      <div className="py-4 px-4 bg-[#1A1A1A] text-[#F5F2ED] rounded-sm text-center overflow-x-auto border border-[#1A1A1A] shadow-xs flex items-center justify-center min-h-[64px]">
        <div
          className="text-base sm:text-lg md:text-xl font-normal tracking-wide leading-relaxed selection:bg-[#E67E22]"
          dangerouslySetInnerHTML={{ __html: renderedFormulaHtml }}
        />
      </div>

      <p className="text-xs text-[#4A4A4A] mt-3 leading-relaxed font-sans">
        {explanation}
      </p>

      {showDetails && terms && terms.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-[#1A1A1A]/10 space-y-2">
          <div className="text-[10px] font-bold text-[#767676] uppercase tracking-[0.2em] mb-1 font-sans">
            Variable Definitions:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {terms.map((t, idx) => {
              let termHtml = t.symbol;
              try {
                termHtml = katex.renderToString(t.symbol, {
                  throwOnError: false,
                  displayMode: false,
                });
              } catch {
                termHtml = t.symbol;
              }

              return (
                <div key={idx} className="flex items-start gap-2 bg-[#F5F2ED] p-2 rounded-sm border border-[#1A1A1A]/10">
                  <span
                    className="text-[#E67E22] font-semibold shrink-0"
                    dangerouslySetInnerHTML={{ __html: termHtml }}
                  />
                  <span className="text-[#333333] text-[11px] leading-snug">{t.meaning}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
