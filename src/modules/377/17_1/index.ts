import type { DatasetSpec, ModuleDefinition } from '@kit/types';
import { slides } from './slides';
import { PENGUINS } from './data';
import { fit, influenceMeasures } from './stats';

import { BootstrapSlopeWidget } from './widgets/BootstrapSlopeWidget';
import { ConfidenceIntervalWidget } from './widgets/ConfidenceIntervalWidget';
import { CooksDistanceWidget } from './widgets/CooksDistanceWidget';
import { DurbinWatsonWidget } from './widgets/DurbinWatsonWidget';
import { LeverageOutlierWidget } from './widgets/LeverageOutlierWidget';
import { LogInterpretationWidget } from './widgets/LogInterpretationWidget';
import { LogTransformWidget } from './widgets/LogTransformWidget';
import { OverfittingWidget } from './widgets/OverfittingWidget';
import { PermutationTestWidget } from './widgets/PermutationTestWidget';
import { QQPlotWidget } from './widgets/QQPlotWidget';
import { ResidualDiagnosticsWidget } from './widgets/ResidualDiagnosticsWidget';
import { SampleSizeWidget } from './widgets/SampleSizeWidget';
import { SlrSandboxWidget } from './widgets/SlrSandboxWidget';
import { TrainTestSplitWidget } from './widgets/TrainTestSplitWidget';
import { TwoParadigmsWidget } from './widgets/TwoParadigmsWidget';

const penguinFit = fit(PENGUINS);
const penguinInfluence = influenceMeasures(PENGUINS);
const signed = (v: number, digits = 1) => (v >= 0 ? `+${v.toFixed(digits)}` : v.toFixed(digits));

interface PenguinRow {
  index: number;
  flipper: number;
  mass: number;
}

const rows: PenguinRow[] = PENGUINS.map(([flipper, mass], index) => ({ index, flipper, mass }));

const module_: ModuleDefinition = {
  slides,

  widgets: {
    'two-paradigms': TwoParadigmsWidget,
    'permutation-test': PermutationTestWidget,
    'bootstrap-slope': BootstrapSlopeWidget,
    'confidence-interval': ConfidenceIntervalWidget,
    'sample-size': SampleSizeWidget,
    'residual-diagnostics': ResidualDiagnosticsWidget,
    'qq-plot': QQPlotWidget,
    'durbin-watson': DurbinWatsonWidget,
    'leverage-outlier': LeverageOutlierWidget,
    'cooks-distance': CooksDistanceWidget,
    'log-transform': LogTransformWidget,
    'log-interpretation': LogInterpretationWidget,
    'train-test-split': TrainTestSplitWidget,
    overfitting: OverfittingWidget,
    'slr-sandbox': SlrSandboxWidget,
  },

  sectionTitles: {
    1: 'Fitting the Line',
    2: 'Significance',
    3: 'LINE Assumptions',
    4: 'Influence',
    5: 'Transformations',
    6: 'Generalization',
  },

  dataset: {
    title: 'Palmer Penguins — flipper length & body mass',
    description:
      'The 333 penguins behind Parts 1 and 2, exactly as the notebooks load them (rows with any missing value dropped). Fitted values, residuals and influence measures are computed from this table.',
    rows,
    columns: [
      { key: 'index', label: '#', numeric: true, value: (r) => r.index + 1 },
      { key: 'flipper', label: 'Flipper (mm)', numeric: true, format: (v) => Number(v).toFixed(1) },
      { key: 'mass', label: 'Mass (g)', numeric: true, format: (v) => Number(v).toFixed(0) },
      {
        key: 'fitted',
        label: 'Fitted ŷ',
        numeric: true,
        value: (r) => penguinFit.slope * r.flipper + penguinFit.intercept,
        format: (v) => Number(v).toFixed(0),
      },
      {
        key: 'residual',
        label: 'Residual',
        numeric: true,
        value: (r) => r.mass - (penguinFit.slope * r.flipper + penguinFit.intercept),
        format: (v) => signed(Number(v), 0),
        tone: (v) => (Number(v) >= 0 ? 'positive' : 'negative'),
      },
      {
        key: 'leverage',
        label: 'Leverage hᵢᵢ',
        numeric: true,
        value: (r) => penguinInfluence[r.index]?.leverage ?? 0,
        format: (v) => Number(v).toFixed(4),
      },
      {
        key: 'cooksD',
        label: "Cook's D",
        numeric: true,
        value: (r) => penguinInfluence[r.index]?.cooksD ?? 0,
        format: (v) => Number(v).toFixed(4),
        tone: (v) => (Number(v) > 4 / rows.length ? 'negative' : 'neutral'),
      },
    ],
    summary: [
      { label: 'n', value: String(rows.length) },
      { label: 'slope', value: `${penguinFit.slope.toFixed(2)} g/mm` },
      { label: 'SE', value: penguinFit.seSlope.toFixed(3) },
      { label: 't', value: penguinFit.tStat.toFixed(2) },
      { label: 'R²', value: penguinFit.r2.toFixed(3) },
      { label: "flagged D > 4/n", value: String(penguinInfluence.filter((m) => m.cooksD > 4 / rows.length).length) },
    ],
  } satisfies DatasetSpec<PenguinRow>,

  resources: [
    {
      label: 'Unit notebooks (17_1_SLR)',
      href: 'https://github.com/bsheese/cs377/tree/main/17_regression_crossval/17_1_SLR',
    },
    {
      label: 'Unit glossary',
      href: 'https://github.com/bsheese/cs377/blob/main/17_regression_crossval/17_1_SLR/17_1_SLR_glossary.md',
    },
    { label: 'Practice quiz', href: 'https://bsheese.github.io/cs377/' },
  ],
};

export default module_;
