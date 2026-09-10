import type { DatasetSpec, ModuleDefinition } from '@kit/types';
import { slides } from './slides';
import { calculateMean, generateShoeHeightDataset, type StudentDataPoint } from './stats';

import { BaselinePredictionWidget } from './widgets/BaselinePredictionWidget';
import { BestFitRegressionWidget } from './widgets/BestFitRegressionWidget';
import { CovarianceCalculatorWidget } from './widgets/CovarianceCalculatorWidget';
import { DeviationsBalanceWidget } from './widgets/DeviationsBalanceWidget';
import { FourQuadrantsWidget } from './widgets/FourQuadrantsWidget';
import { GrandSandboxWidget } from './widgets/GrandSandboxWidget';
import { PearsonsRWidget } from './widgets/PearsonsRWidget';
import { ResidualSquaresWidget } from './widgets/ResidualSquaresWidget';
import { ResidualsBalanceWidget } from './widgets/ResidualsBalanceWidget';
import { SampleComparisonWidget } from './widgets/SampleComparisonWidget';
import { ScatterLineRulerWidget } from './widgets/ScatterLineRulerWidget';
import { ShoeHeightScatterWidget } from './widgets/ShoeHeightScatterWidget';
import { StandardDeviationWidget } from './widgets/StandardDeviationWidget';
import { TssSquaresWidget } from './widgets/TssSquaresWidget';
import { VarianceScalingWidget } from './widgets/VarianceScalingWidget';

const dataset = generateShoeHeightDataset(100, 42);
const meanX = calculateMean(dataset.map((d) => d.shoeSize));
const meanY = calculateMean(dataset.map((d) => d.height));

/** Deviations read better with an explicit sign. */
const signed = (v: number) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2));

const module_: ModuleDefinition = {
  slides,

  /** Keys here are what `slide.widget` refers to. Adding a widget is a new
   *  entry plus a new slide — no shared file changes. */
  widgets: {
    'baseline-prediction': BaselinePredictionWidget,
    'sample-comparison': SampleComparisonWidget,
    'deviations-balance': DeviationsBalanceWidget,
    'tss-squares': TssSquaresWidget,
    'variance-scaling': VarianceScalingWidget,
    'standard-deviation': StandardDeviationWidget,
    'shoe-height-scatter': ShoeHeightScatterWidget,
    'four-quadrants': FourQuadrantsWidget,
    'covariance-calc': CovarianceCalculatorWidget,
    'pearsons-r': PearsonsRWidget,
    'scatter-ruler': ScatterLineRulerWidget,
    'residuals-balance': ResidualsBalanceWidget,
    'residual-squares': ResidualSquaresWidget,
    'best-fit-regression': BestFitRegressionWidget,
    'grand-sandbox': GrandSandboxWidget,
  },

  sectionTitles: {
    1: 'Baseline & Spread',
    2: 'Covariance & r',
    3: 'Residuals & OLS',
  },

  dataset: {
    title: 'Shoe Size & Height — 100 Students',
    description:
      'The cohort every widget in this module draws from. Generated from a fixed seed, so these are the same rows on every machine. Deviation and cross-product columns are the arithmetic behind covariance.',
    rows: dataset,
    columns: [
      { key: 'label', label: 'Student' },
      { key: 'shoeSize', label: 'Shoe (x)', numeric: true, format: (v) => Number(v).toFixed(1) },
      {
        key: 'devX',
        label: 'x\u1d62 \u2212 x\u0304',
        numeric: true,
        value: (row) => row.shoeSize - meanX,
        format: (v) => signed(Number(v)),
        tone: (v) => (Number(v) >= 0 ? 'positive' : 'negative'),
      },
      {
        key: 'height',
        label: 'Height, in. (y)',
        numeric: true,
        format: (v) => `${Number(v).toFixed(1)}"`,
      },
      {
        key: 'devY',
        label: 'y\u1d62 \u2212 \u0233',
        numeric: true,
        value: (row) => row.height - meanY,
        format: (v) => signed(Number(v)),
        tone: (v) => (Number(v) >= 0 ? 'positive' : 'negative'),
      },
      {
        key: 'cross',
        label: 'Cross-product',
        numeric: true,
        value: (row) => (row.shoeSize - meanX) * (row.height - meanY),
        format: (v) => signed(Number(v)),
        tone: (v) => (Number(v) >= 0 ? 'positive' : 'negative'),
      },
    ],
    summary: [
      { label: 'n', value: String(dataset.length) },
      { label: 'x\u0304', value: meanX.toFixed(2) },
      { label: '\u0233', value: `${meanY.toFixed(2)} in` },
    ],
  } satisfies DatasetSpec<StudentDataPoint>,

  resources: [
    {
      label: 'Unit notebooks (17_0_Preliminaries)',
      href: 'https://github.com/bsheese/cs377/tree/main/17_regression_crossval/17_0_Preliminaries',
    },
    { label: 'Practice quiz', href: 'https://bsheese.github.io/cs377/' },
  ],
};

export default module_;
