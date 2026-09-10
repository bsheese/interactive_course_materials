import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ModuleDefinition } from '../types';
import { deriveSections } from '../sections';
import { SlideHeader } from './SlideHeader';
import { SlideView } from './SlideView';
import { SlideControls } from './SlideControls';
import { SlideOverviewModal } from './SlideOverviewModal';
import { DatasetViewerModal } from './DatasetViewerModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

interface DeckShellProps {
  moduleTitle: string;
  badge?: string;
  module: ModuleDefinition;
}

/**
 * Renders any module: navigation, keyboard control, overlays and slide state.
 * A module supplies data and widgets; none of this file knows about a subject.
 *
 * The current step lives in the URL (`?step=3`, 1-based) so a notebook can link
 * students straight to the visual it is talking about.
 */
export const DeckShell: React.FC<DeckShellProps> = ({ moduleTitle, badge, module }) => {
  const { slides, widgets, dataset, sectionTitles, resources } = module;
  const totalSlides = slides.length;

  const [searchParams, setSearchParams] = useSearchParams();
  const [showOverview, setShowOverview] = useState(false);
  const [showDataset, setShowDataset] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  const sections = useMemo(
    () => deriveSections(slides, sectionTitles),
    [slides, sectionTitles]
  );

  const stepParam = Number(searchParams.get('step'));
  const currentSlideIndex = Number.isFinite(stepParam)
    ? Math.min(Math.max(stepParam - 1, 0), Math.max(totalSlides - 1, 0))
    : 0;

  const jumpToSlide = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), totalSlides - 1);
      setSearchParams(
        clamped === 0 ? {} : { step: String(clamped + 1) },
        { replace: false }
      );
    },
    [setSearchParams, totalSlides]
  );

  const goToNextSlide = useCallback(
    () => jumpToSlide(currentSlideIndex + 1),
    [jumpToSlide, currentSlideIndex]
  );
  const goToPrevSlide = useCallback(
    () => jumpToSlide(currentSlideIndex - 1),
    [jumpToSlide, currentSlideIndex]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't steal keys from widget inputs and sliders.
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      } else if (/^[1-9]$/.test(e.key)) {
        const section = sections[Number(e.key) - 1];
        if (section) jumpToSlide(section.startIndex);
      } else if (e.key === 'Home') {
        jumpToSlide(0);
      } else if (e.key === 'End') {
        jumpToSlide(totalSlides - 1);
      } else if (e.key.toLowerCase() === 'p') {
        setPresentationMode((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowOverview(false);
        setShowDataset(false);
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, jumpToSlide, sections, totalSlides]);

  const currentSlide = slides[currentSlideIndex];
  if (!currentSlide) return null;

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] flex flex-col selection:bg-[#E67E22] selection:text-white font-sans">
      {/* Editorial paper ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-[#E67E22]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#ECE8E1] rounded-full blur-3xl" />
      </div>

      <SlideHeader
        moduleTitle={moduleTitle}
        badge={badge}
        slide={currentSlide}
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlides}
        onPrev={goToPrevSlide}
        onNext={goToNextSlide}
        onOpenOverview={() => setShowOverview(true)}
        onOpenDataset={dataset ? () => setShowDataset(true) : undefined}
        onOpenShortcuts={() => setShowShortcuts(true)}
        presentationMode={presentationMode}
        onTogglePresentationMode={() => setPresentationMode((prev) => !prev)}
      />

      <main className="flex-1 z-10 w-full pb-8">
        <SlideView
          slide={currentSlide}
          slideNumber={currentSlideIndex + 1}
          totalSlides={totalSlides}
          widgets={widgets}
          presentationMode={presentationMode}
        />
      </main>

      <SlideControls
        currentIndex={currentSlideIndex}
        totalSlides={totalSlides}
        sections={sections}
        onPrev={goToPrevSlide}
        onNext={goToNextSlide}
        onJumpToSlide={jumpToSlide}
      />

      <SlideOverviewModal
        isOpen={showOverview}
        onClose={() => setShowOverview(false)}
        slides={slides}
        currentIndex={currentSlideIndex}
        onSelectSlide={jumpToSlide}
        resources={resources}
      />

      {dataset && (
        <DatasetViewerModal
          isOpen={showDataset}
          onClose={() => setShowDataset(false)}
          dataset={dataset}
        />
      )}

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        sections={sections}
      />
    </div>
  );
};
