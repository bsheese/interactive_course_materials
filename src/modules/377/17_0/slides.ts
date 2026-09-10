import type { Slide } from '@kit/types';

export const slides: Slide[] = [
  // --- PART 1 ---
  {
    id: 'p1-1-baseline',
    section: 1,
    sectionTitle: 'Prediction & Baseline Error',
    title: 'The Unseen Student & The Baseline Mean',
    subtitle: 'Why guessing the mean minimizes error in either direction',
    paragraphs: [
      "Let's say we want to make a prediction about the height of a student we haven't met yet. We don't know anything about the student, but we do know the heights of 100 students who go to the same school.",
      "In this situation, our best bet for guessing the height of an unknown student is to calculate the average height of the 100 students and guess that average.",
      "We may be way off. The student might be considerably taller or considerably shorter than the 100-student average. What we've really done when we guess the average is not say, \"I think this student of unseen height will be exactly this height.\" Instead, what we are saying is: \"I have no idea what the height of this student will be. But, if I guess the mean, I can minimize how wrong I might be in either direction.\""
    ],
    keyTakeaways: [
      'Guessing the mean is our baseline model for all future predictions.',
      'Models aim to minimize error rather than divine exact psychic predictions.',
      'Real forecasters quantify uncertainty; gamblers rely on raw chance.'
    ],
    formula: {
      latex: '\\bar{y} = \\frac{1}{N} \\sum_{i=1}^{N} y_i',
      explanation: 'The sample mean (average) balances distances across all observed data points.',
      terms: [
        { symbol: '\\bar{y}', meaning: 'Sample Mean of height (inches)' },
        { symbol: 'N', meaning: 'Number of observed students (e.g. 100)' },
        { symbol: 'y_i', meaning: 'Height of the i-th individual student' }
      ]
    },
    widget: 'baseline-prediction'
  },
  {
    id: 'p1-2-spread',
    section: 1,
    sectionTitle: 'Spread & Distributions',
    title: 'Sample A vs. Sample B: Same Mean, Different Reality',
    subtitle: 'Why the mean alone fails to describe the shape of the data',
    paragraphs: [
      "Imagine we have two distinct samples of 100 students' heights measured in inches:",
      "• For Sample A, we measured 100 students, and every single one of them was exactly 66 inches tall (five and a half feet).",
      "• For Sample B, we measured 100 students; 50 of them were 60 inches tall (five feet) and the other 50 were 72 inches tall (six feet).",
      "If we followed our basic model of predicting the mean, both samples would lead us to predict 66 inches. However, if we pay attention to the spread of our data (its distribution), we might have much less confidence guessing the mean for Sample B.",
      "Notably, in Sample B, we have observed zero students who are actually 66 inches tall! We might feel like guessing the mean is almost certainly going to be wrong."
    ],
    keyTakeaways: [
      'Both Sample A and Sample B share the exact same mean: 66 inches.',
      'Sample A has zero spread; Sample B has high spread with two polarized clusters.',
      'We need a metric to formally quantify and compare the spread of distributions.'
    ],
    widget: 'sample-comparison'
  },
  {
    id: 'p1-3-deviations',
    section: 1,
    sectionTitle: 'Deviations & Balance',
    title: 'Deviations & The Zero-Sum Trap',
    subtitle: 'Why simple sum of deviations always cancels to zero',
    paragraphs: [
      "It would be useful to have a metric to help us differentiate between the spread of these two samples. One thing we could do is calculate the difference between each observed student and the mean of the sample: subtracting the mean from each individual value produces a list of differences called deviations.",
      "If we want to turn our list of deviations into a single metric, we might be tempted to just add them all up. The sum of the deviations for Sample A is 0, since none of the students differ from the mean.",
      "Unfortunately, the sum of the deviations for Sample B is also 0! Because the mean is 66 inches, half of our deviations are -6 (60 minus 66) and the other half are +6 (72 minus 66). When we add fifty -6s and fifty +6s together, they cancel out to 0.",
      "This isn't a fluke. The mean is always the exact mathematical fulcrum that perfectly balances the deviations in any dataset."
    ],
    keyTakeaways: [
      'Deviation = Observed Value − Sample Mean: (yᵢ − ȳ).',
      'The sum of raw deviations always equals 0 because the mean is the center of gravity.',
      'To measure total spread, we must eliminate sign cancellation.'
    ],
    formula: {
      latex: '\\sum_{i=1}^{N} (y_i - \\bar{y}) \\equiv 0',
      explanation: 'The fundamental balancing property of the arithmetic mean in every dataset.',
      terms: [
        { symbol: 'y_i - \\bar{y}', meaning: 'Individual deviation from the mean' },
        { symbol: '\\sum', meaning: 'Summation across all N observations' }
      ]
    },
    widget: 'deviations-balance'
  },
  {
    id: 'p1-4-tss',
    section: 1,
    sectionTitle: 'Total Sum of Squares',
    title: 'Squaring Deviations & Total Sum of Squares (TSS)',
    subtitle: 'Why squaring is preferred over absolute values',
    paragraphs: [
      "To avoid this balancing problem, we could either take the absolute value of the deviations or square them. Both methods make all the numbers positive, solving the cancellation problem.",
      "However, squaring has the additional effect of disproportionately penalizing larger errors. A deviation of 10 squared becomes 100, while a deviation of 100 squared becomes 10,000.",
      "This additional penalty for larger errors is often preferred in statistics, so summing the squared deviations is the standard approach.",
      "If we take all of our deviations, square each one individually, and then sum them all up, we get a single metric called the Total Sum of Squares (TSS).",
      "• For Sample A: TSS = 0 (since all deviations are 0).",
      "• For Sample B: each deviation (6), squared is 36. Across 100 students (36 × 100), TSS = 3,600 squared inches."
    ],
    keyTakeaways: [
      'Squaring turns negative errors positive and penalizes larger errors exponentially.',
      'TSS (Total Sum of Squares) = Σ(yᵢ − ȳ)²',
      'Sample A TSS = 0 sq in; Sample B TSS = 3,600 sq in.'
    ],
    formula: {
      latex: '\\text{TSS} = \\sum_{i=1}^{N} (y_i - \\bar{y})^2',
      explanation: 'The baseline measure of total variation in our dependent variable.',
      terms: [
        { symbol: '\\text{TSS}', meaning: 'Total Sum of Squares (in units squared)' },
        { symbol: '(y_i - \\bar{y})^2', meaning: 'Squared deviation for observation i' }
      ]
    },
    widget: 'tss-squares'
  },
  {
    id: 'p1-5-variance',
    section: 1,
    sectionTitle: 'Variance & Sample Scaling',
    title: 'The Sample Size Flaw & Variance',
    subtitle: 'Averaging the squared deviations to compare datasets of any size',
    paragraphs: [
      "Now let's say we took Sample A and Sample B and doubled the sample size of each. Sample A now consists of 200 students who are all exactly 66 inches tall. Sample B consists of 200 students, half of whom are 60 inches and half of whom are 72 inches.",
      "The means for both samples do not change, but the TSS does. Sample A's TSS is still 0, but Sample B's TSS doubles from 3,600 to 7,200 (36 × 200).",
      "This property of TSS, where simply adding more data points increases the value, isn't ideal if we only want to measure and compare the general spread of our data.",
      "To solve this, we compute Variance: which takes the TSS and divides it by the size of the sample. Variance is simply the average of the squared deviations.",
      "For Sample A, variance is 0. For Sample B, variance is 36 (7,200 / 200 = 36), which is the exact same variance we computed with 100 students (3,600 / 100 = 36)."
    ],
    keyTakeaways: [
      'TSS grows linearly with sample size N; Variance normalizes it.',
      'Variance = TSS / N (or TSS / (N - 1) for sample estimation).',
      'Sample B variance remains constant at 36 regardless of whether N=100 or N=200.'
    ],
    note: "When working with samples rather than full populations, dividing by (N - 1) rather than N corrects for sample bias (Bessel's correction). In both cases, the core concept is finding the average squared deviation.",
    formula: {
      latex: 's^2 = \\frac{\\text{TSS}}{N - 1} = \\frac{1}{N - 1} \\sum_{i=1}^{N} (y_i - \\bar{y})^2',
      explanation: 'Sample Variance: Average squared deviation with Bessel\'s correction.',
      terms: [
        { symbol: 's^2', meaning: 'Sample Variance (e.g. 36 in²)' },
        { symbol: 'N - 1', meaning: 'Degrees of freedom (Bessel\'s correction for sample variance)' }
      ]
    },
    widget: 'variance-scaling'
  },
  {
    id: 'p1-6-sd',
    section: 1,
    sectionTitle: 'Standard Deviation',
    title: 'Standard Deviation: Returning to Original Units',
    subtitle: 'Taking the square root to measure average spread in inches',
    paragraphs: [
      "We can take this simplification one step further. Because variance is measured in squared units (squared inches), we can take the square root of the variance to put our metric back into our original unit of measure.",
      "This metric is called the Standard Deviation.",
      "For Sample B, the variance is 36 squared inches; the square root of 36 is 6 inches.",
      "This tells us that, on average, students in Sample B deviate from the mean by 6 inches.",
      "Now we have the mean plus three new metrics to assess the spread of our data: Total Sum of Squares (TSS), Variance, and Standard Deviation."
    ],
    keyTakeaways: [
      'Standard Deviation = √(Variance) = √(TSS / (N - 1)).',
      'Restores the metric to the original units of measurement (inches, not inches²).',
      'Provides an intuitive scale: Sample B students deviate from 66" by an average of ±6".'
    ],
    formula: {
      latex: 's = \\sqrt{s^2} = \\sqrt{\\frac{1}{N-1} \\sum_{i=1}^{N} (y_i - \\bar{y})^2}',
      explanation: 'Standard deviation puts spread back onto the original scale of measurement.',
      terms: [
        { symbol: 's', meaning: 'Sample Standard Deviation (in original units, e.g. inches)' },
        { symbol: 's^2', meaning: 'Sample Variance (squared units)' }
      ]
    },
    widget: 'standard-deviation'
  },

  // --- PART 2 ---
  {
    id: 'p2-1-shoe-height',
    section: 2,
    sectionTitle: 'Covariance & Association',
    title: 'New Information: Incorporating Shoe Size',
    subtitle: 'Moving beyond the baseline mean using auxiliary signals',
    paragraphs: [
      "Let's start over. Same goal: we're going to estimate an unseen student's height. We have data on the heights of 100 other students from the same school.",
      "But this time, we have some additional information: we know the shoe size of the unseen student, and we know both the height and the shoe size of the 100 other students.",
      "In Part 1, we couldn't do better than guessing the mean and examining the spread of the height data to get a sense of how wrong we might possibly be. Having the unseen student's shoe size changes the game for us.",
      "We might expect that larger feet are generally attached to taller people, and that smaller feet are generally attached to shorter people. Since we know our unseen student's shoe size, we may be able to do better than guess the mean.",
      "First, we need to confirm our assumption that foot size and height tend to go together."
    ],
    keyTakeaways: [
      'Unseen student has a known predictor variable: Shoe Size (X).',
      'Instead of a single unconditional height distribution, we can model height conditional on shoe size.',
      'We need a statistical tool to quantify how two variables vary together.'
    ],
    widget: 'shoe-height-scatter'
  },
  {
    id: 'p2-2-quadrants',
    section: 2,
    sectionTitle: '2D Deviations & Quadrants',
    title: 'The Four Centered Quadrants',
    subtitle: 'Classifying bivariate relationships around the centroid of means',
    paragraphs: [
      "To briefly recap calculating deviations: we take shoe size, calculate deviations by subtracting mean shoe size from each value. We do the same for height, giving us a deviation for height and a deviation for shoe size for each student.",
      "Now, imagine we plot our height and shoe size data with height on the y-axis and shoe size on the x-axis, centered so that the mean values for height and shoe size are dead center.",
      "Splitting the plot this way creates four quadrants to classify students:",
      "• Taller than average, bigger feet: Top-Right (+ height dev, + shoe dev).",
      "• Shorter than average, smaller feet: Bottom-Left (- height dev, - shoe dev).",
      "• Taller than average, smaller feet: Top-Left (+ height dev, - shoe dev).",
      "• Shorter than average, bigger feet: Bottom-Right (- height dev, + shoe dev).",
      "If taller people have bigger feet, we expect data points to heavily concentrate in the Top-Right and Bottom-Left quadrants."
    ],
    keyTakeaways: [
      'Centering the plot at (x̄, ȳ) partitions the scatter into four sign-based quadrants.',
      'Points along the positive diagonal have matching deviation signs (+/+ or -/-).',
      'Points along the negative diagonal have opposing deviation signs (+/- or -/+).'
    ],
    widget: 'four-quadrants'
  },
  {
    id: 'p2-3-covariance',
    section: 2,
    sectionTitle: 'Sum of Cross-Products',
    title: 'Cross-Products & Covariance',
    subtitle: 'Multiplying paired deviations and the strange unit problem',
    paragraphs: [
      "If we multiply the deviation of height by the deviation of shoe size for each student, we end up with positive values for students in the Taller/Bigger and Shorter/Smaller quadrants (positive × positive = +, negative × negative = +).",
      "In contrast, we get negative values for students in the Taller/Smaller and Shorter/Bigger quadrants (positive × negative = -).",
      "If we add these all together, we get the Sum of Cross-Products. Because totals increase with sample size, we divide by sample size (N - 1) to get the average of the cross-products: this is Covariance.",
      "• Positive Covariance: more students follow the Taller/Bigger + Shorter/Smaller trend.",
      "• Negative Covariance: more students follow the Taller/Smaller + Shorter/Bigger trend.",
      "• Near-Zero Covariance: quadrants cancel out evenly, indicating no linear trend.",
      "The units of covariance are inches × barleycorns (the unit of American shoe sizes)!"
    ],
    keyTakeaways: [
      'Covariance = Average of (xᵢ − x̄)(yᵢ − ȳ).',
      'Sign indicates the direction of association (positive, negative, or none).',
      'Problem: Covariance has awkward composite units (inches × barleycorns) and depends on the scale of measurement.'
    ],
    formula: {
      latex: '\\text{Cov}(X, Y) = \\frac{1}{N - 1} \\sum_{i=1}^{N} (x_i - \\bar{x})(y_i - \\bar{y})',
      explanation: 'Sample Covariance: The average cross-product of paired deviations.',
      terms: [
        { symbol: 'x_i - \\bar{x}', meaning: 'Shoe size deviation (in barleycorns)' },
        { symbol: 'y_i - \\bar{y}', meaning: 'Height deviation (in inches)' },
        { symbol: '\\text{Cov}', meaning: 'Covariance (units: inches × barleycorns)' }
      ]
    },
    widget: 'covariance-calc'
  },
  {
    id: 'p2-4-pearsons-r',
    section: 2,
    sectionTitle: 'Standardization to Pearson\'s r',
    title: 'Pearson\'s Correlation Coefficient (r)',
    subtitle: 'Creating a unitless metric bounded between -1 and +1',
    paragraphs: [
      "Now, inches × barleycorns is not a particularly helpful unit of measure, so we need to make our metric unitless.",
      "To do so, we take the standard deviation of height (inches) and multiply it by the standard deviation of shoe size (barleycorns). This produces a denominator that is also in inches × barleycorns.",
      "We then divide covariance by this product of standard deviations. The units cancel out completely, resulting in a pure, unitless value: Pearson's correlation coefficient, abbreviated as r.",
      "Pearson's r ranges strictly from -1.0 (perfect negative linear relationship) through 0 (no linear association) to +1.0 (perfect positive linear relationship)."
    ],
    keyTakeaways: [
      'r = Cov(X, Y) / (sₓ · sᵧ).',
      'The units in the numerator and denominator cancel out, leaving a pure unitless number.',
      'r tells us both the direction (sign) and strength (magnitude |r| ≤ 1) of the association.'
    ],
    formula: {
      latex: 'r = \\frac{\\text{Cov}(X,Y)}{s_x s_y} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}',
      explanation: 'Pearson\'s r: Standardized covariance, completely invariant to units of measurement.',
      terms: [
        { symbol: 'r', meaning: 'Correlation coefficient (-1 ≤ r ≤ 1)' },
        { symbol: 's_x, s_y', meaning: 'Standard deviations of X and Y' }
      ]
    },
    widget: 'pearsons-r'
  },

  // --- PART 3 ---
  {
    id: 'p3-1-lines',
    section: 3,
    sectionTitle: 'Predictions & Lines',
    title: 'From Describing Data to Making Predictions',
    subtitle: 'Drawing lines through noisy scatter clouds',
    paragraphs: [
      "So we now know how to calculate Pearson's r: a unitless metric that indicates the direction and strength of an association. We are now going to shift from describing our data to making predictions.",
      "By predictions, we mean that given a new student's shoe size x, we will develop a model that allows us to estimate their height y.",
      "How are we going to get a specific height prediction for any shoe size? We want to incorporate shoe size using a straight line through our data.",
      "We can describe any straight line by two numbers: the slope (how much y changes for each unit increase in x) and the intercept (where the line crosses the y-axis: ŷ = mx + b).",
      "Real-world data is rarely a neat line; it is a noisy cloud. If we draw a line with a ruler, how do we know if it's any good?"
    ],
    keyTakeaways: [
      'A prediction model maps an input X (shoe size) to a predicted Ŷ (height).',
      'A linear model has two parameters: slope m and intercept b (ŷ = mx + b).',
      'We need a formal objective metric to measure how "wrong" any candidate line is.'
    ],
    widget: 'scatter-ruler'
  },
  {
    id: 'p3-2-residuals',
    section: 3,
    sectionTitle: 'Residuals & Cancellation',
    title: 'Residuals: Actual vs. Predicted (y - ŷ)',
    subtitle: 'Why the sum of residuals balances to zero for any line through the centroid',
    paragraphs: [
      "To evaluate a line, we look at the difference between what the line predicted for y at each x (ŷ) and the actual observed y value.",
      "This difference is called the residual: residual = y − ŷ (actual minus predicted).",
      "• Positive residual: actual point sits ABOVE the line (the line under-predicted).",
      "• Negative residual: actual point sits BELOW the line (the line over-predicted).",
      "• Zero residual: the line predicted height with 100% precision.",
      "If we simply sum up the residuals, positive and negative errors cancel each other out to zero!",
      "In fact, it is mathematically guaranteed that ANY line passing through the centroid of means (x̄, ȳ) has residuals that perfectly sum to zero."
    ],
    keyTakeaways: [
      'Residual eᵢ = yᵢ − ŷᵢ (actual observed minus predicted value).',
      'Sum of raw residuals Σ(yᵢ − ŷᵢ) = 0 for any line passing through (x̄, ȳ).',
      'Just like deviations in Part 1, we must square residuals to measure true inaccuracy.'
    ],
    formula: {
      latex: 'e_i = y_i - \\hat{y}_i = y_i - (m x_i + b)',
      explanation: 'The individual prediction error (residual) for data point i.',
      terms: [
        { symbol: 'y_i', meaning: 'Actual observed height' },
        { symbol: '\\hat{y}_i', meaning: 'Predicted height from the model line' },
        { symbol: 'e_i', meaning: 'Residual error' }
      ]
    },
    widget: 'residuals-balance'
  },
  {
    id: 'p3-3-rss',
    section: 3,
    sectionTitle: 'Residual Sum of Squares',
    title: 'Residual Sum of Squares (RSS)',
    subtitle: 'The ultimate scoreboard for comparing candidate regression lines',
    paragraphs: [
      "We solve the cancellation problem the same way we did before: we square the residuals first, and then add them all together.",
      "This creates a single value indicating the total error or incorrectness of our line: the Residual Sum of Squares (RSS).",
      "If we compare two lines drawn through our student dataset, the line with the lower RSS is the clear winner — its predictions are closer to the overall pattern of the data.",
      "Visually, you can imagine each residual as the side of a square. RSS is the total combined area of all these error squares!",
      "Our goal is not just to guess better lines; we want to find the one line that minimizes RSS across all infinite possible lines."
    ],
    keyTakeaways: [
      'RSS = Σ(yᵢ − ŷᵢ)² = Σ eᵢ².',
      'Lower RSS means smaller overall prediction error.',
      'The "best" line is the one that mathematically minimizes the sum of squared residual areas.'
    ],
    formula: {
      latex: '\\text{RSS} = \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2 = \\sum_{i=1}^{N} [y_i - (m x_i + b)]^2',
      explanation: 'Residual Sum of Squares (RSS): The total squared prediction error of the line.',
      terms: [
        { symbol: '\\text{RSS}', meaning: 'Residual Sum of Squares' },
        { symbol: '(y_i - \\hat{y}_i)^2', meaning: 'Squared residual for student i' }
      ]
    },
    widget: 'residual-squares'
  },
  {
    id: 'p3-4-best-fit',
    section: 3,
    sectionTitle: 'Ordinary Least Squares',
    title: 'The Line of Best Fit & Closed-Form Formula',
    subtitle: 'Connecting r, standard deviations, and the point of means',
    paragraphs: [
      "We don't need to guess random lines and test their RSS one by one. There is an exact, closed-form mathematical solution for the line of best fit (Ordinary Least Squares).",
      "The pieces we computed in Parts 1 and 2 assemble directly into the optimal model:",
      "1. Optimal Slope: m = r · (s_y / s_x). The correlation r scaled by the ratio of the spreads of Y and X.",
      "2. Optimal Intercept: b = ȳ − m · x̄. The line is anchored to pass directly through the centroid of means (x̄, ȳ).",
      "With these two equations, we produce the line with the lowest possible RSS out of all infinite lines. We can now take our unseen student's shoe size and forecast their height with optimal statistical confidence!"
    ],
    keyTakeaways: [
      'Slope m = r · (sᵧ / sₓ): How much height changes per shoe size unit.',
      'Intercept b = ȳ − m·x̄: Anchors line through the balance point of the data.',
      'This line guarantees the minimum possible Residual Sum of Squares (Ordinary Least Squares).'
    ],
    formula: {
      latex: 'm = r \\cdot \\frac{s_y}{s_x}, \\quad b = \\bar{y} - m \\bar{x}',
      explanation: 'Closed-form formulas for the optimal regression line of best fit.',
      terms: [
        { symbol: 'm', meaning: 'Optimal slope (inches per shoe size)' },
        { symbol: 'b', meaning: 'Optimal y-intercept' },
        { symbol: 'r', meaning: 'Pearson\'s correlation coefficient' },
        { symbol: 's_y / s_x', meaning: 'Ratio of standard deviations' }
      ]
    },
    widget: 'best-fit-regression'
  },

  // --- SUMMARY / SANDBOX ---
  {
    id: 'summary-sandbox',
    section: 3,
    sectionTitle: 'Grand Interactive Sandbox & Recap',
    title: 'Statistical Mastery: Interactive Sandbox & Challenge',
    subtitle: 'Synthesize all concepts: Mean, TSS, Variance, SD, Covariance, r, RSS, and Regression',
    paragraphs: [
      "You have traveled from guessing a baseline mean, through deviations and TSS, to covariance, Pearson's r, residuals, and Ordinary Least Squares regression.",
      "Use this interactive sandbox to experiment with custom datasets, adjust noise and sample sizes, inspect live statistical formulas, and test your comprehension in the recap challenge below!"
    ],
    keyTakeaways: [
      'Baseline Model: Mean ȳ minimizes squared error with zero prior info.',
      'Spread Metrics: TSS scales with N; Variance normalizes by N-1; Standard Deviation restores original units.',
      '2D Association: Covariance detects direction in composite units; Pearson\'s r standardizes it to [-1, 1].',
      'Linear Model: OLS minimizes RSS by finding the line ŷ = mx + b using m = r(sᵧ/sₓ).'
    ],
    widget: 'grand-sandbox'
  }
];
