import React from 'react';
import { X, CheckCircle2, ExternalLink, Layers } from 'lucide-react';
import type { Slide } from '../types';
import { sectionColor } from '../sections';

interface SlideOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  /** Links back to the notebooks, glossary or quiz this deck accompanies. */
  resources?: { label: string; href: string }[];
}

export const SlideOverviewModal: React.FC<SlideOverviewModalProps> = ({
  isOpen,
  onClose,
  slides,
  currentIndex,
  onSelectSlide,
  resources = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-[#F5F2ED] border border-[#1A1A1A]/20 rounded-sm w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 bg-[#ECE8E1] border-b border-[#1A1A1A]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-sm border border-[#1A1A1A]/10">
              <Layers className="w-5 h-5 text-[#E67E22]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
                Deck Overview
              </h2>
              <p className="text-xs text-[#666666]">{slides.length} interactive steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#4A4A4A] hover:text-[#1A1A1A] bg-white hover:bg-[#E2DDD5] border border-[#1A1A1A]/15 transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#F5F2ED]">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            const color = sectionColor(slide.section ?? 1);

            return (
              <button
                key={slide.id}
                onClick={() => {
                  onSelectSlide(idx);
                  onClose();
                }}
                className={`text-left p-4 rounded-sm border transition-all flex flex-col justify-between group shadow-xs ${
                  isActive
                    ? 'bg-white border-[#E67E22] ring-1 ring-[#E67E22]'
                    : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 hover:bg-[#ECE8E1]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-2 font-sans">
                    {slide.section !== undefined ? (
                      <span
                        style={{ color, borderColor: `${color}4D`, backgroundColor: `${color}1A` }}
                        className="px-2 py-0.5 rounded-xs font-bold uppercase tracking-wider border"
                      >
                        Part 0{slide.section}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-[#888888] font-mono">
                      #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-serif font-bold leading-snug group-hover:text-[#E67E22] transition-colors ${
                      isActive ? 'text-[#E67E22]' : 'text-[#1A1A1A]'
                    }`}
                  >
                    {slide.title}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-xs text-[#555555] mt-1.5 line-clamp-2 leading-relaxed">
                      {slide.subtitle}
                    </p>
                  )}
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[10px]">
                  <span className="text-[#767676] font-mono capitalize">
                    {slide.widget ? slide.widget.replace(/-/g, ' ') : 'text only'}
                  </span>
                  {isActive && (
                    <span className="text-[#E67E22] font-bold flex items-center gap-1">
                      Current <CheckCircle2 className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {resources.length > 0 && (
          <div className="px-5 py-3 bg-[#ECE8E1] border-t border-[#1A1A1A]/10 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#767676]">
              Course materials
            </span>
            {resources.map((resource) => (
              <a
                key={resource.href}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#4A4A4A] hover:text-[#E67E22] flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {resource.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
