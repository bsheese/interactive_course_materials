import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Home,
  Keyboard,
  LayoutGrid,
  Presentation,
} from 'lucide-react';
import type { Slide } from '../types';

interface SlideHeaderProps {
  moduleTitle: string;
  /** Short glyph or code shown in the title chip, e.g. 'Σ' or '17_0'. */
  badge?: string;
  slide: Slide;
  currentSlideIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenOverview: () => void;
  onOpenDataset?: () => void;
  onOpenShortcuts: () => void;
  presentationMode: boolean;
  onTogglePresentationMode: () => void;
}

export const SlideHeader: React.FC<SlideHeaderProps> = ({
  moduleTitle,
  badge = 'Σ',
  slide,
  currentSlideIndex,
  totalSlides,
  onPrev,
  onNext,
  onOpenOverview,
  onOpenDataset,
  onOpenShortcuts,
  presentationMode,
  onTogglePresentationMode,
}) => {
  const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;
  const canPrev = currentSlideIndex > 0;
  const canNext = currentSlideIndex < totalSlides - 1;

  return (
    <header className="bg-[#ECE8E1] border-b border-[#1A1A1A]/10 sticky top-0 z-30 px-3 sm:px-5 py-2 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: home link, module title, current section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            title="All interactive modules"
            className="p-1 text-[#4A4A4A] hover:text-[#1A1A1A] bg-white hover:bg-[#E2DDD5] rounded-sm border border-[#1A1A1A]/15 transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-1.5">
            <span className="font-serif text-sm font-bold text-[#1A1A1A] bg-white px-1.5 py-0.5 border border-[#1A1A1A]/15 rounded-sm shadow-xs">
              {badge}
            </span>
            <span className="font-serif text-sm font-bold tracking-tight text-[#1A1A1A]">
              {moduleTitle}
            </span>
          </div>

          {slide.section !== undefined && (
            <div className="hidden sm:flex items-center">
              <span className="text-[9px] uppercase tracking-[0.18em] font-sans font-bold text-[#E67E22] bg-white px-2 py-0.5 rounded-sm border border-[#1A1A1A]/10 shadow-xs">
                Part 0{slide.section}
                {slide.sectionTitle ? ` — ${slide.sectionTitle}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Center: step navigation */}
        <div className="flex items-center gap-1.5 font-sans order-3 sm:order-2">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs bg-white hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-[#1A1A1A] rounded-sm border border-[#1A1A1A]/15 font-medium transition-colors shadow-xs"
            title="Previous step (Left Arrow)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Prev Step</span>
          </button>

          <span className="font-mono text-xs text-[#555555] px-1.5 font-semibold bg-white/70 py-0.5 rounded-sm border border-[#1A1A1A]/10">
            {currentSlideIndex + 1} <span className="text-[#999999]">/</span> {totalSlides}
          </span>

          <button
            onClick={onNext}
            disabled={!canNext}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs bg-[#1A1A1A] hover:bg-[#333333] disabled:opacity-30 disabled:pointer-events-none text-white rounded-sm border border-[#1A1A1A] font-semibold transition-colors shadow-xs"
            title="Next step (Right Arrow or Space)"
          >
            <span className="hidden xs:inline">Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: tools */}
        <div className="flex items-center gap-1.5 font-sans order-2 sm:order-3">
          {onOpenDataset && (
            <button
              onClick={onOpenDataset}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs bg-white hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] rounded-sm border border-[#1A1A1A]/15 font-medium transition-colors shadow-xs"
              title="Inspect the raw dataset"
            >
              <Database className="w-3 h-3 text-[#E67E22]" />
              <span className="hidden md:inline">Dataset</span>
            </button>
          )}

          <button
            onClick={onOpenOverview}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs bg-white hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] rounded-sm border border-[#1A1A1A]/15 font-medium transition-colors shadow-xs"
            title="View all slides"
          >
            <LayoutGrid className="w-3 h-3" />
            <span className="hidden md:inline">Deck</span>
          </button>

          <button
            onClick={onTogglePresentationMode}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs rounded-sm border transition-colors shadow-xs ${
              presentationMode
                ? 'bg-[#E67E22] border-[#E67E22] text-white font-bold'
                : 'bg-white hover:bg-[#1A1A1A] hover:text-white border-[#1A1A1A]/15 text-[#1A1A1A] font-medium'
            }`}
            title="Toggle presentation mode (widget only)"
          >
            <Presentation className="w-3 h-3" />
            <span className="hidden md:inline">{presentationMode ? 'Full' : 'Present'}</span>
          </button>

          <button
            onClick={onOpenShortcuts}
            className="p-1 text-[#4A4A4A] hover:text-[#1A1A1A] bg-white hover:bg-[#ECE8E1] rounded-sm border border-[#1A1A1A]/15 transition-colors shadow-xs"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full bg-[#1A1A1A]/10 h-[2px] mt-2 overflow-hidden">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-[#E67E22] transition-all duration-300 ease-out"
        />
      </div>
    </header>
  );
};
