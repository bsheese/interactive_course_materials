import type { ModuleDefinition } from '@kit/types';
import { slides } from './slides';

import { CoerceWidget } from './widgets/CoerceWidget';
import { DatesWidget } from './widgets/DatesWidget';
import { DropnaWidget } from './widgets/DropnaWidget';
import { FillWidget } from './widgets/FillWidget';
import { MessyTableWidget } from './widgets/MessyTableWidget';
import { PipelineWidget } from './widgets/PipelineWidget';
import { RegexWidget } from './widgets/RegexWidget';
import { SplitExtractWidget } from './widgets/SplitExtractWidget';
import { StringChainWidget } from './widgets/StringChainWidget';

const module_: ModuleDefinition = {
  slides,

  widgets: {
    messy: MessyTableWidget,
    dropna: DropnaWidget,
    fill: FillWidget,
    coerce: CoerceWidget,
    chain: StringChainWidget,
    split: SplitExtractWidget,
    regex: RegexWidget,
    dates: DatesWidget,
    pipeline: PipelineWidget,
  },

  sectionTitles: {
    1: 'What Is Messy',
    2: 'Missing Data',
    3: 'Types',
    4: 'Strings',
    5: 'Regex',
    6: 'Dates',
    7: 'Pipeline',
  },

  resources: [
    { label: 'Unit notebooks (08_data_cleaning)', href: 'https://github.com/bsheese/cs225/tree/main/08_data_cleaning' },
    {
      label: 'Unit glossary',
      href: 'https://github.com/bsheese/cs225/blob/main/08_data_cleaning/08_data_cleaning_glossary.md',
    },
    { label: 'Practice quiz', href: 'https://bsheese.github.io/225/' },
  ],
};

export default module_;
