import type { QuizQuestion } from '@kit/types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: "Why does the sum of raw deviations Σ(yᵢ - ȳ) always equal zero for any dataset?",
    options: [
      "Because data points are always symmetrical around zero.",
      "Because the arithmetic mean is the mathematical fulcrum that balances all positive and negative distances.",
      "Because Bessel's correction forces it to cancel out.",
      "It only cancels to zero if all data points are identical (like Sample A)."
    ],
    correctIndex: 1,
    explanation: "By mathematical definition, the mean ȳ = (1/N)Σyᵢ, so Σ(yᵢ - ȳ) = Σyᵢ - N·ȳ = Σyᵢ - Σyᵢ = 0."
  },
  {
    id: 'q2',
    question: "If you double the sample size of Sample B (from 100 to 200 students with identical spread), what happens to TSS and Variance?",
    options: [
      "Both TSS and Variance double.",
      "TSS doubles from 3,600 to 7,200, while Variance remains constant at 36.",
      "TSS stays at 3,600, while Variance is cut in half to 18.",
      "Both TSS and Variance stay unchanged."
    ],
    correctIndex: 1,
    explanation: "TSS is a raw sum so it scales with sample size N. Variance divides TSS by sample size, so it measures average squared spread and remains constant."
  },
  {
    id: 'q3',
    question: "What are the measurement units of Covariance when analyzing shoe size (in barleycorns) vs height (in inches)?",
    options: [
      "Unitless (dimensionless ratio between -1 and +1).",
      "Squared inches (in²).",
      "Inches × barleycorns.",
      "Inches per barleycorn."
    ],
    correctIndex: 2,
    explanation: "Covariance multiplies deviations in X by deviations in Y, producing composite units (inches × barleycorns). We divide by s_x · s_y to create unitless Pearson's r."
  },
  {
    id: 'q4',
    question: "What is the difference between a deviation (Part 1) and a residual (Part 3)?",
    options: [
      "A deviation is (y - ȳ) relative to the baseline mean; a residual is (y - ŷ) relative to a model prediction line.",
      "Deviations are squared, but residuals are always absolute values.",
      "Deviations are for 2D data, while residuals are for 1D data.",
      "They are exactly the same thing with different names."
    ],
    correctIndex: 0,
    explanation: "Deviations measure distance from the unconditional mean ȳ. Residuals measure distance from the conditional prediction line ŷ = mx + b."
  },
  {
    id: 'q5',
    question: "How is the optimal slope of the Ordinary Least Squares (OLS) line of best fit calculated?",
    options: [
      "m = Cov(X, Y) / TSS",
      "m = r · (s_y / s_x)",
      "m = ȳ / x̄",
      "m = (s_x / s_y) · RSS"
    ],
    correctIndex: 1,
    explanation: "The optimal OLS slope is m = r · (s_y / s_x), scaling Pearson's correlation r by the ratio of the standard deviation of Y to the standard deviation of X."
  }
];
