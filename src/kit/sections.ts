import type { Slide } from './types';

export interface DeckSection {
  /** The slide's `section` value, or 1 for a flat deck. */
  number: number;
  title: string;
  startIndex: number;
  endIndex: number;
}

/** Palette used to distinguish sections in the header, footer and overview. */
export const SECTION_COLORS = ['#E67E22', '#1A1A1A', '#27AE60', '#2980B9', '#8E44AD'] as const;

export const sectionColor = (n: number): string =>
  SECTION_COLORS[(Math.max(1, n) - 1) % SECTION_COLORS.length];

/**
 * Derive section boundaries from the deck itself, so number-key jumps and the
 * footer pills stay correct when slides are added or reordered — the old deck
 * hard-coded indices 0/6/10 and silently drifted.
 */
export function deriveSections(
  slides: Slide[],
  sectionTitles: Record<number, string> = {}
): DeckSection[] {
  const sections: DeckSection[] = [];

  slides.forEach((slide, index) => {
    const number = slide.section ?? 1;
    const last = sections[sections.length - 1];

    if (last && last.number === number) {
      last.endIndex = index;
      return;
    }

    sections.push({
      number,
      title: sectionTitles[number] ?? slide.sectionTitle ?? `Section ${number}`,
      startIndex: index,
      endIndex: index,
    });
  });

  return sections;
}

export const sectionIndexOf = (sections: DeckSection[], slideIndex: number): number =>
  Math.max(
    0,
    sections.findIndex((s) => slideIndex >= s.startIndex && slideIndex <= s.endIndex)
  );
