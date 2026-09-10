import type { ComponentType } from 'react';

/**
 * The kit contract. Everything a module must provide to be rendered by
 * DeckShell lives in `ModuleDefinition`; everything the app needs to *list* a
 * module without loading it lives in `ModuleMeta` (see modules/registry.ts).
 */

/** Generic 2-D point. Kit statistics work on these; modules adapt their own
 *  domain shapes (heights, prices, ages) into them. */
export interface Point {
  x: number;
  y: number;
  id?: number;
  label?: string;
}

export interface Formula {
  latex: string;
  explanation: string;
  terms: { symbol: string; meaning: string }[];
}

export interface Slide {
  /** Stable, module-unique. Used as the animation key and the deep-link hash. */
  id: string;
  /** 1-based section number; slides sharing one are grouped in the overview
   *  and reachable with the matching number key. Optional for flat decks. */
  section?: number;
  sectionTitle?: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  keyTakeaways?: string[];
  formula?: Formula;
  /** Aside rendered as an "Editorial Note" callout. */
  note?: string;
  /** Key into the module's `widgets` map. Omit for a text-only slide. */
  widget?: string;
}

export interface DatasetColumn<Row> {
  /** Unique within the table; also the default field accessor. */
  key: string;
  label: string;
  /** Derived columns (deviations, cross-products, residuals) supply this
   *  instead of relying on a raw field. Defaults to `row[key]`. */
  value?: (row: Row) => string | number;
  /** Defaults to String(value). */
  format?: (value: string | number, row: Row) => string;
  /** Right-aligns and sorts numerically. */
  numeric?: boolean;
  /** Signed columns colour green/red by tone; omit for plain text. */
  tone?: (value: string | number, row: Row) => 'positive' | 'negative' | 'neutral';
}

/** Optional per-module data table, surfaced by the header's Dataset button. */
export interface DatasetSpec<Row = Record<string, unknown>> {
  title: string;
  description?: string;
  rows: Row[];
  columns: DatasetColumn<Row>[];
  /** Small stat chips shown above the table, e.g. means and n. */
  summary?: { label: string; value: string }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * A module's default export. Widgets are keyed by name so adding one never
 * touches shared code — no central union type, no dispatch switch.
 */
export interface ModuleDefinition {
  slides: Slide[];
  /** Display names for the deck's sections, keyed by `Slide.section`. Used by
   *  the footer jump pills and number-key shortcuts. Falls back to the first
   *  slide's `sectionTitle` when absent. */
  sectionTitles?: Record<number, string>;
  widgets: Record<string, ComponentType>;
  /** Modules type their own row shape via `satisfies DatasetSpec<Row>`. */
  dataset?: DatasetSpec<any>;
  /** Extra links shown in the module header (notebook, glossary, quiz). */
  resources?: { label: string; href: string }[];
}

export interface ModuleMeta {
  /** Course number, e.g. '377'. Must match a CourseMeta id. */
  course: string;
  /** Module id as used in the course repo, e.g. '17_0'. Route: /:course/:id */
  id: string;
  title: string;
  description: string;
  /** 'draft' modules are listed but flagged; 'hidden' are omitted from the index. */
  status: 'published' | 'draft' | 'hidden';
  /** Path within the course repo this module accompanies, for maintenance. */
  sourceUnit?: string;
  /** Link back to the notebook(s) this page supports. */
  notebookUrl?: string;
  /** Lazy loader; keeps each module out of the initial bundle. */
  load: () => Promise<{ default: ModuleDefinition }>;
}

export interface CourseMeta {
  id: string;
  title: string;
  subtitle: string;
  repoUrl?: string;
}
