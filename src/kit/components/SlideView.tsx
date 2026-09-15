import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Info, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Slide } from '../types';
import { MathDisplay } from './MathDisplay';

interface SlideViewProps {
  slide: Slide;
  slideNumber: number;
  totalSlides: number;
  /** The module's widget map; `slide.widget` keys into it. */
  widgets: Record<string, ComponentType>;
  /** Hides the narrative column and gives the widget the full stage. */
  presentationMode?: boolean;
}

export const SlideView: React.FC<SlideViewProps> = ({
  slide,
  slideNumber,
  totalSlides,
  widgets,
  presentationMode = false,
}) => {
  const Widget = slide.widget ? widgets[slide.widget] : undefined;
  const missingWidget = Boolean(slide.widget && !Widget);
  const widgetOnly = presentationMode && Boolean(Widget);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Header section with section marker and titles */}
          <div className="border-b border-[#1A1A1A]/10 pb-3 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-3xl">
                {slide.section !== undefined && (
                  <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#E67E22] font-bold block mb-1">
                    Part 0{slide.section}
                    {slide.sectionTitle ? ` — ${slide.sectionTitle}` : ''}
                  </span>
                )}

                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A] tracking-tight leading-snug mb-1">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="text-xs sm:text-sm font-serif italic text-[#555555] leading-relaxed">
                    "{slide.subtitle}"
                  </p>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-1.5 shrink-0 pt-1">
                <span className="font-mono text-xs font-bold text-[#1A1A1A] bg-[#ECE8E1] px-2 py-0.5 rounded-sm border border-[#1A1A1A]/10">
                  Step {slideNumber < 10 ? `0${slideNumber}` : slideNumber} / {totalSlides}
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              widgetOnly
                ? 'grid grid-cols-1 gap-8 items-start'
                : 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
            }
          >
            {/* Left: narrative, formula, note */}
            {!widgetOnly && (
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white border border-[#1A1A1A]/10 rounded-sm p-6 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#767676] pb-2 border-b border-[#1A1A1A]/10">
                    <BookOpen className="w-3.5 h-3.5 text-[#E67E22]" />
                    <span>Pedagogical Exposition</span>
                  </div>

                  {slide.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm text-[#333333] leading-relaxed font-sans">
                      {p}
                    </p>
                  ))}
                </div>

                {slide.formula && (
                  <MathDisplay
                    latex={slide.formula.latex}
                    explanation={slide.formula.explanation}
                    terms={slide.formula.terms}
                  />
                )}

                {slide.note && (
                  <div className="p-4 bg-white border-l-2 border-l-[#E67E22] border-y border-r border-[#1A1A1A]/10 rounded-sm text-xs text-[#4A4A4A] space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[#1A1A1A] font-bold text-[10px] uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5 text-[#E67E22]" />
                      <span>Editorial Note</span>
                    </div>
                    <p className="text-xs text-[#555555] leading-relaxed font-sans">{slide.note}</p>
                  </div>
                )}
              </div>
            )}

            {/* Right: the live widget, then the takeaways. Keeping the
                summary out of the left column leaves the exposition room to
                breathe; readers meet it after they have played with the widget. */}
            <div className={widgetOnly ? 'space-y-4' : 'lg:col-span-7 space-y-4'}>
              {Widget && <Widget />}
              {missingWidget && (
                <div className="p-4 bg-white border border-dashed border-[#C0392B]/40 rounded-sm text-xs text-[#C0392B] font-mono">
                  No widget registered under "{slide.widget}" — add it to this module's
                  <span className="font-bold"> widgets</span> map.
                </div>
              )}

              {!widgetOnly && slide.keyTakeaways && slide.keyTakeaways.length > 0 && (
                <div className="bg-[#ECE8E1]/80 border border-[#1A1A1A]/10 rounded-sm p-5 space-y-3 shadow-xs">
                  <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] flex items-center gap-1.5 pb-1 border-b border-[#1A1A1A]/10">
                    <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
                    Key Takeaways
                  </span>
                  <ul className="space-y-2 text-xs text-[#333333]">
                    {slide.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22] shrink-0 mt-1.5"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
