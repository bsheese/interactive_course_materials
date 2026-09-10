import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DeckSection } from '../sections';
import { sectionColor } from '../sections';

interface SlideControlsProps {
  currentIndex: number;
  totalSlides: number;
  sections: DeckSection[];
  onPrev: () => void;
  onNext: () => void;
  onJumpToSlide: (index: number) => void;
}

export const SlideControls: React.FC<SlideControlsProps> = ({
  currentIndex,
  totalSlides,
  sections,
  onPrev,
  onNext,
  onJumpToSlide,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSlides - 1;

  return (
    <footer className="bg-[#ECE8E1] border-t border-[#1A1A1A]/10 py-3 px-4 sticky bottom-0 z-30 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white hover:bg-[#1A1A1A] hover:text-white border-[#1A1A1A]/15 text-[#1A1A1A] shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Section jump pills, derived from the deck */}
          {sections.length > 1 && (
            <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-sm border border-[#1A1A1A]/10 text-xs shadow-xs">
              {sections.map((section, idx) => {
                const isActive =
                  currentIndex >= section.startIndex && currentIndex <= section.endIndex;

                return (
                  <React.Fragment key={`${section.number}-${section.startIndex}`}>
                    {idx > 0 && <span className="text-[#1A1A1A]/20">&bull;</span>}
                    <button
                      onClick={() => onJumpToSlide(section.startIndex)}
                      style={isActive ? { backgroundColor: sectionColor(section.number) } : undefined}
                      className={`px-2.5 py-0.5 rounded-xs transition-colors font-medium ${
                        isActive ? 'text-white font-bold' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
                      }`}
                    >
                      Part {section.number}: {section.title}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className="text-xs font-mono text-[#4A4A4A] px-2.5 py-1 bg-white rounded-sm border border-[#1A1A1A]/15 font-medium shadow-xs">
            <span className="text-[#E67E22] font-bold">{currentIndex + 1}</span>
            <span className="text-[#888]"> / </span>
            <span>{totalSlides}</span>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={isLast}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#E67E22] hover:bg-[#D35400] border-[#E67E22] text-white shadow-xs"
        >
          <span className="hidden sm:inline">{isLast ? 'Completed' : 'Next Step'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
