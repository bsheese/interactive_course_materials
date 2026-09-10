import type { Slide } from '@kit/types';

export const slides: Slide[] = [
  {
    id: 'intro',
    section: 1,
    sectionTitle: 'Framing the Question',
    title: 'The Question This Module Answers',
    subtitle: 'One sentence a student could repeat back afterwards',
    paragraphs: [
      'Write the exposition the way you would say it out loud. Each string is a paragraph.',
      'Keep the narrative on the left doing the teaching; the widget on the right is what the student then goes and plays with.',
    ],
    keyTakeaways: [
      'One idea per bullet.',
      'These are what a student should still know a week later.',
    ],
    formula: {
      latex: '\\bar{y} = \\frac{1}{N} \\sum_{i=1}^{N} y_i',
      explanation: 'KaTeX renders this; terms below are labelled individually.',
      terms: [
        { symbol: '\\bar{y}', meaning: 'What this symbol means in plain words' },
        { symbol: 'N', meaning: 'Number of observations' },
      ],
    },
    note: 'Optional aside — a caveat, a piece of history, an ethics point.',
    widget: 'example',
  },
];
