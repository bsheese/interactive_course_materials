import type { DatasetSpec, ModuleDefinition } from '@kit/types';
import { calculateMean } from '@kit/stats';
import { slides } from './slides';
import { PENGUINS, type PenguinRow } from './data';
import { numericValues } from './stats';

import { BarPlotWidget } from './widgets/BarPlotWidget';
import { BoxPlotWidget } from './widgets/BoxPlotWidget';
import { DistributionHistogramWidget } from './widgets/DistributionHistogramWidget';
import { HeatmapWidget } from './widgets/HeatmapWidget';
import { PlotSandboxWidget } from './widgets/PlotSandboxWidget';
import { RegPlotWidget } from './widgets/RegPlotWidget';
import { ScatterPlotWidget } from './widgets/ScatterPlotWidget';
import { StripPlotWidget } from './widgets/StripPlotWidget';
import { ViolinPlotWidget } from './widgets/ViolinPlotWidget';

const meanFlipper = calculateMean(numericValues(PENGUINS, 'flipper_length_mm'));
const meanMass = calculateMean(numericValues(PENGUINS, 'body_mass_g'));

const module_: ModuleDefinition = {
  slides,

  /** Keys here are what `slide.widget` refers to. */
  widgets: {
    hist: DistributionHistogramWidget,
    box: BoxPlotWidget,
    violin: ViolinPlotWidget,
    bar: BarPlotWidget,
    strip: StripPlotWidget,
    scatter: ScatterPlotWidget,
    reg: RegPlotWidget,
    heatmap: HeatmapWidget,
    sandbox: PlotSandboxWidget,
  },

  sectionTitles: {
    1: 'Choosing a Chart',
    2: 'Distributions',
    3: 'Comparing Categories',
    4: 'Relationships',
    5: 'Correlation Overview',
    6: 'The Full Sandbox',
  },

  dataset: {
    title: 'Palmer Penguins — 100 Birds',
    description:
      'The cohort every widget in this module draws from by default (the capstone sandbox can also switch to a small Ames housing sample). Three species, three islands, four body measurements.',
    rows: PENGUINS,
    columns: [
      { key: 'species', label: 'Species' },
      { key: 'island', label: 'Island' },
      { key: 'sex', label: 'Sex' },
      { key: 'bill_length_mm', label: 'Bill Length', numeric: true, format: (v) => `${Number(v).toFixed(1)} mm` },
      { key: 'bill_depth_mm', label: 'Bill Depth', numeric: true, format: (v) => `${Number(v).toFixed(1)} mm` },
      { key: 'flipper_length_mm', label: 'Flipper Length', numeric: true, format: (v) => `${Number(v).toFixed(0)} mm` },
      { key: 'body_mass_g', label: 'Body Mass', numeric: true, format: (v) => `${Number(v).toFixed(0)} g` },
    ],
    summary: [
      { label: 'n', value: String(PENGUINS.length) },
      { label: 'mean flipper', value: `${meanFlipper.toFixed(1)} mm` },
      { label: 'mean mass', value: `${meanMass.toFixed(0)} g` },
    ],
  } satisfies DatasetSpec<PenguinRow>,

  resources: [
    { label: 'Unit notebooks (07_data_vis)', href: 'https://github.com/bsheese/cs225/tree/main/07_data_vis' },
    { label: 'Practice quiz', href: 'https://bsheese.github.io/225/' },
  ],
};

export default module_;
