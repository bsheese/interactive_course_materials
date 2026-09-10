import type { ModuleDefinition } from '@kit/types';
import { slides } from './slides';
import { ExampleWidget } from './widgets/ExampleWidget';

/**
 * Module template. To use it:
 *
 *   cp -r templates/module_template src/modules/<course>/<module_id>
 *
 * then register the module in src/modules/registry.ts. See CONTRIBUTING.md.
 */
const module_: ModuleDefinition = {
  slides,

  // Keys are what `slide.widget` refers to.
  widgets: {
    example: ExampleWidget,
  },

  // Optional: names for the footer's section pills and number-key jumps.
  sectionTitles: {
    1: 'First Section',
  },

  // Optional: a dataset table behind the header's Dataset button.
  // dataset: { title, description, rows, columns, summary } satisfies DatasetSpec<Row>,

  resources: [
    { label: 'Unit notebooks', href: 'https://github.com/bsheese/cs377' },
  ],
};

export default module_;
