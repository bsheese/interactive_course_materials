import type { Slide } from '@kit/types';

export const slides: Slide[] = [
  // --- PART 1: FITTING THE LINE ---
  {
    id: 'p1-1-two-paradigms',
    section: 1,
    sectionTitle: 'Two Libraries, One Math',
    title: 'Scikit-Learn and Statsmodels',
    subtitle: 'Two philosophies, two APIs, and exactly one line',
    paragraphs: [
      "In 17_0 you derived the line of best fit by hand: slope = r · (s_y / s_x), intercept = ȳ − slope · x̄. Python offers two libraries that will do this for you, and students routinely assume they are alternatives that give different answers. They are not.",
      "Scikit-learn is built for prediction. Its whole world is `.fit(X, y)` then `.predict(X)`, and it will happily hand you a number without ever telling you how confident it is. Statsmodels is built for inference: `sm.OLS(y, X).fit().summary()` returns a dense table of standard errors, t-statistics and p-values, and expects you to read it.",
      "Each has one quirk that catches everyone the first time. Scikit-learn demands a 2D feature matrix, so a single predictor needs double brackets or `.reshape(-1, 1)`. Statsmodels does not add an intercept for you — forget `sm.add_constant()` and you silently fit a line forced through the origin. Note too that the argument order is reversed between them.",
      "Toggle between the two panels in the widget. The slope, the intercept and the R² are identical to every decimal place, because both libraries minimise the same residual sum of squares. What differs is the interface, and what each one bothers to report.",
    ],
    keyTakeaways: [
      'Both libraries minimise RSS, so both produce the closed-form line from 17_0.',
      'sklearn to predict; statsmodels to explain. The question decides the tool.',
      'The two classic errors: a 1D array in sklearn, a missing constant in statsmodels.',
    ],
    formula: {
      latex: '\\hat{y} = \\beta_0 + \\beta_1 x, \\qquad \\beta_1 = r\\frac{s_y}{s_x}',
      explanation:
        'One model, written the way both libraries fit it: an intercept plus a slope on a single predictor.',
      terms: [
        { symbol: '\\hat{y}', meaning: 'Predicted body mass (grams)' },
        { symbol: '\\beta_0', meaning: 'Intercept — the fitted value when x = 0' },
        { symbol: '\\beta_1', meaning: 'Slope — grams of mass per mm of flipper' },
        { symbol: 'x', meaning: 'Flipper length (mm)' },
      ],
    },
    note: "The intercept here is −5,872 g. A penguin with a zero-length flipper does not weigh negative six kilograms; it does not exist. Intercepts are often outside the range of the data and not worth interpreting literally.",
    widget: 'two-paradigms',
  },

  // --- PART 2: DID WE JUST GET LUCKY? ---
  {
    id: 'p2-1-permutation',
    section: 2,
    sectionTitle: 'The Null Hypothesis',
    title: 'Did We Just Get Lucky?',
    subtitle: 'Simulating a world where the relationship does not exist',
    paragraphs: [
      "The fitted slope is 50.15 grams per millimetre. Before believing it, ask the sceptic's question: if flipper length had nothing whatsoever to do with body mass, how often would random data hand us a slope this large anyway?",
      "That hypothetical world has a name — the null hypothesis, H₀: the true slope is zero. And you can build it rather than assume it. Keep every x and every y exactly as measured, but shuffle the y values so that each mass is paired with a random penguin's flipper. Any real relationship is destroyed; the distributions are untouched.",
      "Refit the line on the shuffled data and record the slope. Do it a thousand times and you have the sampling distribution of the slope under H₀ — a picture of what pure chance produces.",
      "The result is stark. Across 5,000 shuffles, the most extreme slope chance can manage is about ±11. The observed 50.15 is not merely in the tail of that distribution; it is nowhere near the axis it is drawn on.",
    ],
    keyTakeaways: [
      'H₀ says the true slope is zero — the p-value asks how surprising your data would be if that were true.',
      'A permutation test builds the null distribution directly, with no formula required.',
      'A simulated p-value can never be exactly 0 — its floor is 1 / (number of shuffles).',
    ],
    formula: {
      latex: 'p = \\frac{\\#\\{|\\beta^{\\text{shuffled}}| \\geq |\\hat{\\beta}_1|\\}}{\\text{number of shuffles}}',
      explanation:
        'The empirical p-value: the share of null-world slopes at least as extreme as the one actually observed.',
      terms: [
        { symbol: '\\hat{\\beta}_1', meaning: 'Slope estimated from the real data' },
        { symbol: '\\beta^{\\text{shuffled}}', meaning: 'Slope from one shuffled dataset' },
      ],
    },
    note: "A p-value is the probability of data this extreme given that H₀ is true. It is not the probability that H₀ is true, and it says nothing about whether the effect is large enough to care about.",
    widget: 'permutation-test',
  },
  {
    id: 'p2-2-bootstrap',
    section: 2,
    sectionTitle: 'Standard Error',
    title: 'How Much Would the Slope Wiggle?',
    subtitle: 'The bootstrap: resample the data you have to imagine the samples you do not',
    paragraphs: [
      "You measured 333 penguins. Had you walked a different beach and measured 333 others, the slope would have come out somewhat different. The standard error is the answer to 'how different?' — the standard deviation of the slope across all those hypothetical repeat samples.",
      "You cannot go back out and collect 500 more datasets. But you can approximate it: draw 333 penguins from your own sample with replacement, so some appear twice and others not at all, and refit. That resample is a plausible alternative sample from the same population.",
      "Repeat two thousand times and the spread of the resulting slopes is the standard error. The widget's bootstrap lands within about two percent of the classical formula, sqrt(MSE / Sxx), which is what statsmodels prints in the 'std err' column — and that remaining gap is itself just simulation noise, which shrinks as you add repetitions.",
      "Watch the crucial detail: the bootstrap resamples whole (x, y) pairs, so the flipper-to-mass relationship survives every resample. The permutation test on the previous slide broke that pairing deliberately. Same machinery, opposite purpose — and this is the distinction students most often blur.",
    ],
    keyTakeaways: [
      'The standard error measures the precision of an estimate, not the spread of the data.',
      'Bootstrap resamples PAIRS, preserving the relationship; permutation breaks it.',
      'Simulation and the classical formula agree — the formula is a shortcut, not a different idea.',
    ],
    formula: {
      latex: 'SE(\\hat{\\beta}_1) = \\sqrt{\\frac{\\text{MSE}}{S_{xx}}}, \\qquad S_{xx} = \\sum (x_i - \\bar{x})^2',
      explanation:
        'The classical standard error. More spread in x, or less residual noise, means a more precisely estimated slope.',
      terms: [
        { symbol: '\\text{MSE}', meaning: 'RSS / (n − 2) — the residual variance' },
        { symbol: 'S_{xx}', meaning: 'Total spread of the predictor' },
      ],
    },
    widget: 'bootstrap-slope',
  },
  {
    id: 'p2-3-confidence',
    section: 2,
    sectionTitle: 'Confidence Intervals',
    title: 'From Standard Error to an Interval',
    subtitle: 'What "95% confident" actually promises — and what it does not',
    paragraphs: [
      "A p-value gives a verdict; a confidence interval gives a range, in the units of the problem. Take the estimate and go out roughly two standard errors in each direction: β̂₁ ± 1.96 · SE. For the penguins that is about [47.1, 53.2] grams per millimetre.",
      "The bootstrap gives the same interval by a different route: sort the two thousand resampled slopes and read off the 2.5th and 97.5th percentiles. Two philosophies, one answer to within a fraction of a gram.",
      "Now the interpretation, which is where nearly everyone slips. It is tempting to say 'there is a 95% probability the true slope lies in [47.1, 53.2].' That is wrong. The true slope is a fixed number; it is either in there or it is not. The 95% describes the procedure.",
      "Press 'What does 95% mean?' to see it. Forty fresh samples, forty intervals, each built exactly the same way — and about 95% of them capture the population slope. The couple that miss look no different from the ones that hit. You never know which kind you are holding.",
    ],
    keyTakeaways: [
      'A CI reports a range of plausible values in the units of the problem.',
      'The 95% is a property of the method across repeat samples, not of one interval.',
      'An interval that excludes zero is significant at α = 0.05 — the same verdict, more information.',
    ],
    formula: {
      latex: '\\hat{\\beta}_1 \\pm t^{*} \\cdot SE(\\hat{\\beta}_1)',
      explanation:
        'The classical interval. With n in the hundreds, t* is about 1.96 — the familiar two standard errors.',
      terms: [
        { symbol: 't^{*}', meaning: 'Critical value at 95% for n − 2 degrees of freedom' },
        { symbol: 'SE(\\hat{\\beta}_1)', meaning: 'Standard error of the slope' },
      ],
    },
    note: "The bootstrap percentile method assumes a roughly symmetric sampling distribution. When the bootstrap histogram comes out visibly skewed, prefer the formula-based interval or a bias-corrected bootstrap.",
    widget: 'confidence-interval',
  },
  {
    id: 'p2-4-sample-size',
    section: 2,
    sectionTitle: 'Significance vs. Importance',
    title: 'The Same Effect, More Data',
    subtitle: 'Why "statistically significant" is not a synonym for "matters"',
    paragraphs: [
      "Here is the uncomfortable fact about p-values. The standard error shrinks like 1 / √n, so the t-statistic grows like √n and the p-value collapses toward zero — all while the effect itself sits perfectly still.",
      "In the widget the true slope is 0.4 and never changes. At n = 40 the confidence interval straddles zero and the result reads as 'not significant'. Drag n upward and nothing about the world changes, yet somewhere along the way the same 0.4 becomes significant, then overwhelmingly so.",
      "Turn it around and the warning is sharper: with a large enough sample, any effect that is not exactly zero will eventually be declared significant. In an era of million-row datasets, 'p < 0.05' is close to free. It certifies that an effect is detectable, not that it is worth acting on.",
      "So report the estimate and its interval, in units someone can reason about, and then ask the question statistics cannot answer for you: is an effect this size big enough to change what we do?",
    ],
    keyTakeaways: [
      'SE ∝ 1/√n — more data buys precision, not a bigger effect.',
      'Any non-zero effect becomes significant at large enough n.',
      'Significance is about detectability; importance is a judgement about the domain.',
    ],
    formula: {
      latex: 't = \\frac{\\hat{\\beta}_1}{SE(\\hat{\\beta}_1)} \\propto \\sqrt{n}',
      explanation:
        'Holding the effect and the noise fixed, the t-statistic grows with the square root of the sample size.',
      terms: [
        { symbol: 't', meaning: 'How many standard errors the estimate sits from zero' },
        { symbol: 'n', meaning: 'Sample size' },
      ],
    },
    widget: 'sample-size',
  },

  // --- PART 3: THE LINE ASSUMPTIONS ---
  {
    id: 'p3-1-residuals',
    section: 3,
    sectionTitle: 'LINE — Linearity & Equal Variance',
    title: 'The Residual Plot Is the Diagnostic',
    subtitle: 'Everything the scatter plot hides shows up here',
    paragraphs: [
      "Every p-value and confidence interval on the last three slides rests on four assumptions, remembered as LINE: Linearity, Independence, Normality of residuals, and Equal variance. Two of them — L and E — are read off a single plot, and it is the most useful plot in regression.",
      "Plot the residuals against the fitted values. If the model is right, you get a formless horizontal band of noise centred on zero, the same thickness everywhere. Structure of any kind is the model telling you what it failed to capture.",
      "An arc means the relationship is not straight: the line runs above the data in the middle and below it at the ends, so the residuals curve. A funnel means the variance is not constant: the line is right on average, but predictions get less trustworthy as fitted values grow.",
      "Step through the four cases in the widget and watch R². Between the healthy data and the funnel it barely budges. A respectable R² is not evidence that the assumptions hold — which is precisely why the residual plot is not optional.",
    ],
    keyTakeaways: [
      'Residuals vs. fitted is the primary diagnostic — draw it every time.',
      'Curve = linearity broken. Funnel = equal variance broken.',
      'R² can look fine while the assumptions underneath it are badly violated.',
    ],
    formula: {
      latex: 'e_i = y_i - \\hat{y}_i',
      explanation:
        'A residual is what the model got wrong for one observation. Plotted against ŷ, the residuals expose the structure the model missed.',
      terms: [
        { symbol: 'e_i', meaning: 'Residual for observation i' },
        { symbol: 'y_i', meaning: 'Observed value' },
        { symbol: '\\hat{y}_i', meaning: 'Fitted value' },
      ],
    },
    note: "Each case in the widget breaks exactly one assumption, which makes each signature unmistakable. Real data is rarely so considerate — Auto MPG breaks L and E at the same time.",
    widget: 'residual-diagnostics',
  },
  {
    id: 'p3-2-qq',
    section: 3,
    sectionTitle: 'LINE — Normality',
    title: 'Reading a Q-Q Plot',
    subtitle: 'Are the residuals normal enough for the inference to hold?',
    paragraphs: [
      "The N in LINE asks whether the residuals are normally distributed. It matters for inference — the standard errors, t-statistics and p-values from Part 2 are derived under that assumption — rather than for the fit itself. The line is still the least-squares line either way.",
      "A histogram is a poor tool for the job. Bin widths change the story, and the tails, which is where the action is, are exactly where a histogram has the fewest observations to show you.",
      "A Q-Q plot solves this by asking a sharper question: sort the residuals, then plot each against the value a normal distribution would have produced at that rank. If the residuals are normal, the points fall on the diagonal. Deviations from that line are read as shapes — an S-curve means heavy tails on both sides, and one end pulling away means skew.",
      "Compare the two views in the widget. The heavy-tailed residuals still look passably bell-shaped as a histogram while their Q-Q plot is unmistakably S-shaped. And the reassuring part: thanks to the Central Limit Theorem, inference is fairly robust to mild non-normality once n is reasonably large.",
    ],
    keyTakeaways: [
      'Normality matters for inference, not for fitting the line.',
      'Q-Q plots beat histograms because they are sensitive in the tails.',
      'S-curve = heavy tails; one end pulling away = skew.',
      'The CLT makes mild non-normality survivable at large n.',
    ],
    formula: {
      latex: '\\left(\\Phi^{-1}\\!\\left(\\frac{i - 0.375}{n + 0.25}\\right),\\; \\frac{e_{(i)} - \\bar{e}}{s_e}\\right)',
      explanation:
        'Each Q-Q point pairs a theoretical normal quantile with the standardised residual of the same rank.',
      terms: [
        { symbol: '\\Phi^{-1}', meaning: 'Inverse normal CDF — the quantile function' },
        { symbol: 'e_{(i)}', meaning: 'The i-th smallest residual' },
        { symbol: 'n', meaning: 'Number of observations' },
      ],
    },
    note: "The Jarque–Bera statistic in the statsmodels summary tests normality from skewness and kurtosis. In large samples it flags departures too trivial to matter, so read it alongside the plot rather than instead of it.",
    widget: 'qq-plot',
  },
  {
    id: 'p3-3-independence',
    section: 3,
    sectionTitle: 'LINE — Independence',
    title: 'The Assumption You Cannot See in a Scatter Plot',
    subtitle: 'Independence lives in the order of the rows',
    paragraphs: [
      "Linearity, normality and equal variance all leave fingerprints on plots you have already drawn. Independence does not. Two datasets can produce identical scatter plots, identical residual plots and identical Q-Q plots while one has thoroughly dependent observations.",
      "The reason is that independence is a claim about the rows' relationship to each other, which a scatter plot discards entirely. Shuffle your rows and every plot so far is unchanged. So plot the residuals against their index instead, in the order the data arrived.",
      "Independent residuals look like a coin flip: sign changes constantly, no memory. Positively autocorrelated residuals cluster into long runs above and then below the line — each error carries information about the next.",
      "The Durbin–Watson statistic scores this. It sits near 2 when residuals are independent, falls toward 0 with positive autocorrelation, and rises toward 4 with negative. Values below about 1.7 or above 2.3 are worth investigating. Violations matter because dependent observations carry less information than their count suggests, so standard errors come out too small and everything looks more significant than it is.",
    ],
    keyTakeaways: [
      'Independence is invisible in a scatter plot — it is a property of the row order.',
      'DW ≈ 2 is clean; below ~1.7 positive autocorrelation, above ~2.3 negative.',
      'Time series is the usual offender; dependence deflates standard errors.',
      'Ask what the row order MEANS before trusting the statistic.',
    ],
    formula: {
      latex: 'DW = \\frac{\\sum_{i=2}^{n} (e_i - e_{i-1})^2}{\\sum_{i=1}^{n} e_i^2}',
      explanation:
        'Compares consecutive residual differences to overall residual size. Similar neighbours push DW below 2.',
      terms: [
        { symbol: 'e_i', meaning: 'Residual for the i-th row in data order' },
        { symbol: 'DW', meaning: 'Durbin–Watson statistic, between 0 and 4' },
      ],
    },
    note: "In 17_1_3 the Auto MPG data scores 0.926, which looks like a serious violation. It is an artifact: the rows are sorted by model year, so consecutive cars are similar by construction. The fix is not a model change but a reminder to ask what the ordering represents.",
    widget: 'durbin-watson',
  },

  // --- PART 4: INFLUENCE ---
  {
    id: 'p4-1-leverage',
    section: 4,
    sectionTitle: 'Leverage, Outliers, Influence',
    title: 'Three Words That Are Not Synonyms',
    subtitle: 'Extreme in x, wrong in y, and actually moving the line',
    paragraphs: [
      "Before transforming a model that is failing its diagnostics, check whether a handful of points are causing the failure. That means separating three ideas that everyday speech runs together.",
      "Leverage is about x alone: how far a point sits from the mean of the predictor. High leverage is potential — a long lever arm — not a problem by itself. An outlier is about y given x: a large residual, a point the model badly mispredicts. Influence is the only one defined by consequences — does removing this point actually change the coefficients?",
      "The relationship between them is the key insight. A point needs both an extreme x and a large residual to be influential. Far out in x but sitting right on the line? It anchors the fit rather than distorting it. Big residual in the middle of the x range? It nudges the intercept and barely touches the slope.",
      "Drag the orange point around and watch the three flags fire independently. Try the 'Leverage only' preset in particular: leverage goes through the roof, Cook's Distance stays small, and the line hardly moves.",
    ],
    keyTakeaways: [
      'Leverage = extreme x. Outlier = unusual y given x. Influence = actually changes the fit.',
      'Influence requires BOTH high leverage and a large residual.',
      'High leverage on its own still shrinks standard errors, which flatters your inference.',
    ],
    formula: {
      latex: 'h_{ii} = \\frac{1}{n} + \\frac{(x_i - \\bar{x})^2}{S_{xx}}',
      explanation:
        'Leverage for a simple regression. It depends only on x — the response never enters the formula.',
      terms: [
        { symbol: 'h_{ii}', meaning: 'Leverage (hat value) of observation i' },
        { symbol: 'S_{xx}', meaning: 'Total spread of the predictor' },
      ],
    },
    widget: 'leverage-outlier',
  },
  {
    id: 'p4-2-cooks',
    section: 4,
    sectionTitle: "Cook's Distance & Ethics",
    title: 'The Needle in the Haystack',
    subtitle: 'Finding the point that moves everything — and deciding what to do about it',
    paragraphs: [
      "Dragging one point is fine for building intuition. With 2,930 houses you cannot eyeball it, and the influential row will not announce itself in the scatter — it hides in the crowd.",
      "Cook's Distance combines leverage and residual into a single number per observation: how much would every fitted value move if this row were deleted? Plot it against the observation index and one bar towers over the rest. The common heuristic flags D > 4/n as worth investigating.",
      "Toggle the poisoned row in the widget. It is invisible in the scatter, unmissable in the Cook's D panel, and it shifts the dollars-per-square-foot estimate by several percent all on its own.",
      "Then the harder question: what do you do about it? Legitimate reasons to drop a row are data entry errors, wrong units, instrument failure, or a point that genuinely belongs to a different population. 'It was hurting my R²' is not one of them, and neither is 'Cook's Distance flagged it.' The statistic is a detective, not an executioner. When a point is real and inconvenient, report both models, use robust regression such as Huber, or model whatever is actually going on — and document the decision either way.",
    ],
    keyTakeaways: [
      "Cook's D combines leverage and residual into one per-observation number.",
      'D > 4/n is a flag for investigation, not a deletion rule.',
      'Drop for documented data errors, never for a prettier R².',
      'If you cannot drop it: report both fits, use robust regression, or model the cause.',
    ],
    formula: {
      latex: "D_i = \\frac{e_i^2}{p \\cdot \\text{MSE}} \\cdot \\frac{h_{ii}}{(1 - h_{ii})^2}",
      explanation:
        "Cook's Distance multiplies how wrong the point is by how much leverage it has. Both factors must be non-trivial for D to be large.",
      terms: [
        { symbol: 'e_i', meaning: 'Residual for observation i' },
        { symbol: 'h_{ii}', meaning: 'Leverage of observation i' },
        { symbol: 'p', meaning: 'Number of parameters (2 for simple regression)' },
      ],
    },
    note: "Dropping a point changes what your model is a model OF. A housing model fitted without its mansions is a model of ordinary houses — which may be exactly what you want, so long as you say so.",
    widget: 'cooks-distance',
  },

  // --- PART 5: TRANSFORMATIONS ---
  {
    id: 'p5-1-log',
    section: 5,
    sectionTitle: 'Bending the Data',
    title: 'When the Relationship Is Not a Line',
    subtitle: 'Gapminder: GDP per capita against life expectancy',
    paragraphs: [
      "Sometimes the diagnostics fail and no single point is to blame — the relationship simply is not straight. GDP per capita against life expectancy is the textbook case: rising steeply among the poorest countries, then flattening into a plateau.",
      "Fit a straight line to it and two of the four assumptions break at once. The residuals arc — negative, then positive, then negative — which kills L. Their spread shrinks as fitted values rise, which strains E. R² of 0.46 is not terrible, and that is exactly the trap.",
      "The fix is not a fancier model but a transformed predictor. Linear regression requires linearity in the parameters, not in the variables, so replacing x with log(x) is entirely legitimate — you are bending the data, not the line.",
      "Why log rather than a square root or a reciprocal? Because the data shows diminishing returns, and log is the function whose derivative is 1/x: steep when x is small, flat when x is large. That is the same shape the scatter has. Toggle the transform and watch the residual arc flatten out — and note that R², while it improves here, is not the referee. The residual plot is.",
    ],
    keyTakeaways: [
      'Curved data breaks L, and often E along with it.',
      'Linearity in the PARAMETERS is what regression requires — transform variables freely.',
      "Log matches diminishing returns because d/dx log(x) = 1/x.",
      'Judge a transformation by the residual plot, not by R².',
    ],
    formula: {
      latex: 'y = \\beta_0 + \\beta_1 \\log(x)',
      explanation:
        'A level–log model. The relationship is curved in x and perfectly straight in log(x), which is all least squares needs.',
      terms: [
        { symbol: '\\log(x)', meaning: 'Natural log of the predictor' },
        { symbol: '\\beta_1', meaning: 'Change in y per unit change in log(x)' },
      ],
    },
    note: "Box-Cox will search for the best power transformation automatically. On this data it returns λ ≈ 0, which IS the log — the data agreeing with the reasoning rather than replacing it.",
    widget: 'log-transform',
  },
  {
    id: 'p5-2-interpretation',
    section: 5,
    sectionTitle: 'Interpreting Log Models',
    title: 'What Does a Log Slope Mean?',
    subtitle: 'Three flavors, three sentences, one approximation to watch',
    paragraphs: [
      "A transformation buys you a model that fits, at the cost of a coefficient you can no longer read straight off. 'Life expectancy rises 7.2 years per unit of log GDP' is true and useless in conversation.",
      "There are only three cases. Log on x alone (level–log): a 1% increase in x adds about β₁/100 units of y. Log on y alone (log–level): a one-unit increase in x changes y by about 100·β₁ percent. Log on both (log–log): a 1% increase in x gives about β₁ percent more y — an elasticity, which economists read directly.",
      "The β₁/100 rule needs no calculus. A 1% rise multiplies x by 1.01, and log(1.01) ≈ 0.00995 ≈ 1/100. So the fitted value moves by β₁ · log(1.01) ≈ β₁/100. The widget shows the exact and approximate answers side by side; push the change past about 10% and watch the shortcut start to drift.",
      "Two warnings to carry forward. A transformation changes the question you are answering, so interpretability falls as complexity rises. And if you fit log(y) and need a prediction in original units, exponentiating alone systematically underestimates the mean — that is Jensen's inequality, and it needs a correction term based on the residual variance.",
    ],
    keyTakeaways: [
      'Level–log: +1% in x → +β₁/100 units of y.',
      'Log–level: +1 unit of x → +100·β₁ % in y.',
      'Log–log: the slope IS the elasticity.',
      'Back-transforming a log-y prediction needs Jensen’s correction.',
    ],
    formula: {
      latex: '\\Delta y \\approx \\beta_1 \\log(1.01) \\approx \\frac{\\beta_1}{100}',
      explanation:
        'The level–log rule of thumb, derived rather than memorised — a 1% change in x moves the prediction by about a hundredth of the slope.',
      terms: [
        { symbol: '\\Delta y', meaning: 'Change in the predicted value' },
        { symbol: '\\beta_1', meaning: 'Coefficient on log(x)' },
      ],
    },
    note: "R² values are not comparable across different y-scales. A model of log(price) and a model of price are answering different questions, and their R² values cannot be ranked against each other.",
    widget: 'log-interpretation',
  },

  // --- PART 6: GENERALIZATION ---
  {
    id: 'p6-1-traintest',
    section: 6,
    sectionTitle: 'The Generalization Test',
    title: 'Scoring a Model on Data It Has Never Seen',
    subtitle: 'Why fitting and evaluating on the same rows is cheating',
    paragraphs: [
      "Every number so far — R², the residual plots, the diagnostics — was computed on the same data used to fit the model. The model chose its coefficients to look good on exactly those rows. Grading it there is marking your own homework.",
      "The remedy is almost embarrassingly simple. Hold out a random 20–30% of the rows before fitting anything. Fit on the training set, then score on the test set the model has never seen. The golden rule is that the test set is off-limits for fitting AND for choosing between models; inspecting it for data quality is still fair.",
      "Do it on the Ames model and the result is reassuring: train and test R² come out essentially equal. A two-parameter model fitted on hundreds of houses has almost nothing to memorise, so what it learns transfers. Simple models generalize.",
      "One detail worth internalising. Sometimes test R² comes out HIGHER than train. That is not a leak or a bug — it is sampling variation, and the histogram of the gap across 300 splits is centred on zero with values on both sides. What signals overfitting is a large positive gap, not a small one in either direction.",
    ],
    keyTakeaways: [
      'Fitting and evaluating on the same rows overstates performance.',
      'Test data is off-limits for fitting and for model selection.',
      'Simple models generalize — a near-zero gap is the healthy baseline.',
      'Test R² above train R² is ordinary sampling noise.',
    ],
    formula: {
      latex: 'R^2_{\\text{test}} = 1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y}_{\\text{test}})^2}',
      explanation:
        'The same R² from 17_0, computed on held-out rows using a model that never saw them.',
      terms: [
        { symbol: '\\hat{y}_i', meaning: 'Prediction from the model fitted on training data' },
        { symbol: '\\bar{y}_{\\text{test}}', meaning: 'Mean of the held-out target values' },
      ],
    },
    widget: 'train-test-split',
  },
  {
    id: 'p6-2-overfitting',
    section: 6,
    sectionTitle: 'Overfitting & Bias–Variance',
    title: 'Making Overfitting Visible',
    subtitle: 'Turn up the flexibility and watch the two curves separate',
    paragraphs: [
      "The Ames model was too simple to overfit. To see the failure mode you have to build a model with room to memorise — so take data generated from sin(x) plus noise and fit polynomials of rising degree.",
      "Degree 1 is a straight line through a sine wave: it can follow the broad downward drift but cannot bend, so the shape is lost. Train and test R² are mediocre together — around 0.58 and 0.43 — which is the signature of bias. Around degree 3 the curve tracks the signal and both scores jump above 0.83.",
      "Push further and the extra flexibility has nowhere useful to go, so it starts fitting the noise. The curve develops wiggles that chase individual training points. Training R² keeps creeping toward 1.0 — it always will — while test R² peaks, turns and falls off a cliff, eventually going negative. A negative R² means the model predicts worse than the mean baseline you started this course with.",
      "That is the bias–variance tradeoff in one picture: Test Error = Bias² + Variance + Irreducible Error. Moving right trades bias for variance, and the best model sits where the sum bottoms out. Everything remaining in this course — cross-validation, regularization, ensembles — is a way of finding that point without ever peeking at the test set.",
    ],
    keyTakeaways: [
      'Training score always improves with complexity; test score peaks and collapses.',
      'Underfitting = high bias; overfitting = high variance.',
      'Negative test R² means the model is worse than predicting the mean.',
      'The best complexity minimises Bias² + Variance.',
    ],
    formula: {
      latex: '\\text{Test Error} = \\text{Bias}^2 + \\text{Variance} + \\sigma^2_{\\text{irreducible}}',
      explanation:
        'The decomposition behind the U-shaped test curve. The third term is noise no model can ever remove.',
      terms: [
        { symbol: '\\text{Bias}^2', meaning: 'Error from assumptions too simple for the truth' },
        { symbol: '\\text{Variance}', meaning: 'Error from sensitivity to the particular training rows' },
        { symbol: '\\sigma^2', meaning: 'Irreducible noise in the data itself' },
      ],
    },
    widget: 'overfitting',
  },
  {
    id: 'p6-3-sandbox',
    section: 6,
    sectionTitle: 'The Whole Arc',
    title: 'Simple Linear Regression, End to End',
    subtitle: 'Build a world, read every diagnostic, then check yourself',
    paragraphs: [
      "You have gone from fitting a line to interrogating it: is the slope real, are the assumptions behind that verdict sound, is one point driving everything, does the shape of the relationship need changing, and does any of it survive contact with data the model has not seen.",
      "The sandbox puts all of it in one place. Set the true slope, the noise, the sample size and the curvature, and every diagnostic updates at once — the fit, the residual plot, the standard error, the t-statistic, the p-value, Durbin–Watson, the confidence interval and the held-out R².",
      "Some experiments worth running. Set noise high and n small, then raise n and watch a real effect climb out of the noise without changing size. Add curvature and watch the residual plot arc while R² stays respectable. Set the true slope to zero and see how often a confidence interval still misses it — it should be about one time in twenty.",
      "Then take the quiz. All of this scales directly to multiple regression: the same fit, the same diagnostics, the same generalization test, just with more columns. That is 17_2 — where cleaning, feature selection, regularization and cross-validation come in.",
    ],
    keyTakeaways: [
      'Fit, then interrogate: significance, assumptions, influence, form, generalization.',
      'The residual plot answers more questions than any single statistic.',
      'Every idea here carries over to multiple regression unchanged.',
    ],
    note: "With the true slope set to zero, roughly 1 interval in 20 will miss it. That is not a malfunction — it is what a 95% procedure means, seen from the inside.",
    widget: 'slr-sandbox',
  },
];
