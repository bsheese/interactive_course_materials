import type { DatasetSpec, ModuleDefinition } from '@kit/types';
import { slides } from './slides';
import { AMES_FEATURES, AMES_HOUSES } from './data';

import { BoostingWidget } from './widgets/BoostingWidget';
import { CoefficientTaxWidget } from './widgets/CoefficientTaxWidget';
import { CollinearityWidget } from './widgets/CollinearityWidget';
import { EncodingWidget } from './widgets/EncodingWidget';
import { ForestWidget } from './widgets/ForestWidget';
import { ForwardSelectionWidget } from './widgets/ForwardSelectionWidget';
import { GridSearchWidget } from './widgets/GridSearchWidget';
import { NestedCVWidget } from './widgets/NestedCVWidget';
import { PenaltyShapeWidget } from './widgets/PenaltyShapeWidget';
import { RegularizationPathWidget } from './widgets/RegularizationPathWidget';
import { SelectionLeakWidget } from './widgets/SelectionLeakWidget';
import { SplitRuleWidget } from './widgets/SplitRuleWidget';
import { TreeDepthWidget } from './widgets/TreeDepthWidget';
import { TreeSplitWidget } from './widgets/TreeSplitWidget';
import { WinnersCurseWidget } from './widgets/WinnersCurseWidget';

interface HouseRow {
  index: number;
  neighborhood: string;
  price: number;
  [feature: string]: string | number;
}

const rows: HouseRow[] = AMES_HOUSES.map((h, index) => ({
  index,
  neighborhood: h.n,
  price: h.p,
  ...Object.fromEntries(AMES_FEATURES.map((f, j) => [f.key, h.f[j]])),
}));

const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const module_: ModuleDefinition = {
  slides,

  widgets: {
    'split-rule': SplitRuleWidget,
    'selection-leak': SelectionLeakWidget,
    encoding: EncodingWidget,
    'forward-selection': ForwardSelectionWidget,
    collinearity: CollinearityWidget,
    'coefficient-tax': CoefficientTaxWidget,
    'penalty-shape': PenaltyShapeWidget,
    'regularization-path': RegularizationPathWidget,
    'grid-search': GridSearchWidget,
    'winners-curse': WinnersCurseWidget,
    'nested-cv': NestedCVWidget,
    'tree-split': TreeSplitWidget,
    'tree-depth': TreeDepthWidget,
    forest: ForestWidget,
    boosting: BoostingWidget,
  },

  sectionTitles: {
    1: 'Cleaning & Leakage',
    2: 'Selection',
    3: 'Regularization',
    4: 'Tuning',
    5: 'Honest Evaluation',
    6: 'Trees',
  },

  dataset: {
    title: 'Ames Housing — the houses behind the widgets',
    description:
      'Every third house of the 2,925 left after dropping the partial sales (Gr Liv Area ≥ 4,000), with the twelve features the widgets use. Only deterministic cleaning has been applied: a missing garage or basement reads as 0, Kitchen Qual is mapped Ex…Po to 5…1, and Lot Area is logged.',
    rows,
    columns: [
      { key: 'index', label: '#', numeric: true, value: (r) => r.index + 1 },
      { key: 'neighborhood', label: 'Neighborhood' },
      { key: 'price', label: 'SalePrice', numeric: true, format: (v) => `$${Number(v).toLocaleString('en-US')}` },
      ...AMES_FEATURES.map((f) => ({
        key: f.key,
        label: f.label,
        numeric: true,
        format: (v: string | number) => (Number.isInteger(Number(v)) ? String(v) : Number(v).toFixed(2)),
      })),
    ],
    summary: [
      { label: 'houses', value: String(rows.length) },
      { label: 'features', value: String(AMES_FEATURES.length) },
      { label: 'median price', value: `$${median(rows.map((r) => r.price)).toLocaleString('en-US')}` },
      { label: 'neighborhoods', value: String(new Set(rows.map((r) => r.neighborhood)).size) },
    ],
  } satisfies DatasetSpec<HouseRow>,

  resources: [
    {
      label: 'Unit notebooks (17_2_MLR)',
      href: 'https://github.com/bsheese/cs377/tree/main/17_regression_crossval/17_2_MLR',
    },
    {
      label: 'Unit glossary',
      href: 'https://github.com/bsheese/cs377/blob/main/17_regression_crossval/17_2_MLR/17_2_glossary.md',
    },
    { label: 'Practice quiz', href: 'https://bsheese.github.io/cs377/' },
  ],
};

export default module_;
