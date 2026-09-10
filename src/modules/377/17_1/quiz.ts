import type { QuizQuestion } from '@kit/types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question:
      'You fit the same data in scikit-learn and in statsmodels and get different-looking output. What actually differs?',
    options: [
      'The coefficients — the two libraries optimise different objectives',
      'Only the interface and what gets reported; both minimise the same RSS',
      'The R², because statsmodels adjusts it for degrees of freedom',
      'Nothing at all — the output is identical',
    ],
    correctIndex: 1,
    explanation:
      'Both find the line that minimises RSS, so the coefficients and R² match exactly. Statsmodels additionally reports standard errors, t-statistics and p-values; sklearn never computes them. Choose by the question you are asking: predict or explain.',
  },
  {
    id: 'q2',
    question:
      'In the permutation test you shuffled the y values. What does that shuffling accomplish?',
    options: [
      'It estimates how much the slope would vary across repeat samples',
      'It removes outliers before the model is fitted',
      'It breaks the x–y relationship, simulating a world where H₀ is true',
      'It makes the residuals normally distributed',
    ],
    correctIndex: 2,
    explanation:
      'Shuffling y against x destroys any real relationship while keeping both distributions intact — that is the null world. The bootstrap does the opposite: it resamples whole pairs, preserving the relationship, to measure the slope’s variability.',
  },
  {
    id: 'q3',
    question:
      'Your residual plot shows a clean funnel widening to the right, but no curve. Which assumption is broken?',
    options: [
      'L — the relationship is not linear',
      'I — the observations are not independent',
      'N — the residuals are not normal',
      'E — the residual variance is not constant',
    ],
    correctIndex: 3,
    explanation:
      'A funnel with no curvature is heteroscedasticity: the line is right on average (residuals centred on zero) but predictions get less reliable as fitted values grow. Fixes include a transformation or robust standard errors.',
  },
  {
    id: 'q4',
    question:
      'A point sits far to the right in x, but lands almost exactly on the fitted line. What is it?',
    options: [
      'High leverage, but not influential',
      'An outlier, and therefore influential',
      'Both an outlier and high leverage',
      'Neither — extreme x values are always harmless',
    ],
    correctIndex: 0,
    explanation:
      'Leverage measures how extreme x is — the potential to move the line. Influence requires that potential AND a large residual. A high-leverage point that agrees with the line has a small Cook’s D and barely moves the slope, though it can still shrink the standard errors.',
  },
  {
    id: 'q5',
    question:
      'Cook’s Distance flags an observation at D = 0.9. What is the right next step?',
    options: [
      'Drop it — anything above 4/n is invalid data',
      'Drop it if removing it improves R²',
      'Investigate it, then decide on the merits; document whatever you do',
      'Ignore it, since Cook’s Distance has no formal cutoff',
    ],
    correctIndex: 2,
    explanation:
      'Cook’s D is a detective, not an executioner. Data-entry errors, wrong units and instrument failures are legitimate reasons to drop a row. "It was hurting my R²" is not. If the point is real, report both models, use robust regression, or model what is actually going on.',
  },
  {
    id: 'q6',
    question:
      'In the model y = β₀ + β₁·log(x) with β₁ = 7.2, roughly what does a 1% increase in x buy you?',
    options: [
      'About 7.2 units of y',
      'About 0.072 units of y',
      'About 7.2% more y',
      'About 720 units of y',
    ],
    correctIndex: 1,
    explanation:
      'A level–log slope divides by 100: a 1% rise in x multiplies it by 1.01, and log(1.01) ≈ 0.01, so the prediction moves by β₁/100 ≈ 0.072 units. The shortcut holds for small changes; past about 10% you should use β₁·log(1 + p) exactly.',
  },
  {
    id: 'q7',
    question:
      'You fit a simple regression and find test R² is slightly HIGHER than train R². What should you conclude?',
    options: [
      'Data has leaked from the test set into training',
      'The model is underfitting and needs more parameters',
      'Something is wrong — test performance can never exceed train',
      'Nothing is wrong; this is ordinary sampling variation',
    ],
    correctIndex: 3,
    explanation:
      'With a two-parameter model there is almost nothing to memorise, so the train/test gap is noise centred on zero and lands on both sides. A test score above the train score is routine. It is a large POSITIVE gap that signals overfitting.',
  },
  {
    id: 'q8',
    question:
      'As you raise polynomial degree, training R² climbs toward 1.0 while test R² peaks and then goes negative. What does a negative test R² mean?',
    options: [
      'The model predicts worse than simply guessing the mean of y',
      'The correlation between prediction and truth has flipped sign',
      'R² was computed incorrectly — it cannot be negative',
      'The model explains a negative share of the variance in the training data',
    ],
    correctIndex: 0,
    explanation:
      'R² = 1 − RSS/TSS is computed against the mean-only baseline from 17_0. On held-out data an overfitted model can have RSS larger than TSS, making R² negative — it is doing worse than the baseline you started the course with.',
  },
];
