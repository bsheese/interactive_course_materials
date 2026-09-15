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
      "In 17_0 you worked out the line of best fit by hand. You computed the correlation r, the two standard deviations, and the two means, and then used the closed-form formulas: slope = r · (s_y / s_x) and intercept = ȳ − slope · x̄. That was deliberately slow, so that you could see where the numbers come from. From here on, Python will do that arithmetic for you.",
      "There are two commonly used libraries that fit regression models in Python. Both fit exactly the same line using exactly the same math we did by hand in the previous module. What differs is what each library was designed for, and therefore what it asks of you and what it reports back.",
      "Scikit-learn is built for prediction. Its interface is the same for every model it offers: you call `.fit(X, y)` to fit the model (learn the coefficients), then `.predict(X)` to get predictions for new rows. It reports the slope and intercept, and that is about all. It does not tell you how uncertain the slope is, or whether the relationship could be a coincidence. That is not an oversight; those questions are simply outside its purpose. It is the library that focusses on prediction rather than statistical explanations.",
      "In contrast, Statsmodels is built for inference.  That is, for asking what the fitted line tells us about the wider population the data came from. You call `sm.OLS(y, X).fit()` and then `.summary()`, and it returns a dense table of standard errors, t-statistics, p-values and confidence intervals. Most of this unit is about learning to read that table, so for now just notice that it exists.",
      "Each library has one habit that trips up nearly everyone the first time. Scikit-learn insists that the predictors be a two-dimensional table, even when there is only one predictor. So `df['flipper']` is not accepted, but `df[['flipper']]` (double brackets) is. Statsmodels, for its part, does not add an intercept unless you ask. If you forget `sm.add_constant()`, it will quietly fit a line forced through the origin, and every coefficient will be wrong without any error message. Notice also that the argument order is reversed: scikit-learn takes (X, y), statsmodels takes (y, X).",
      "Use the toggle in the widget to switch between the two panels. Read off the slope, the intercept and the R² in each. They are identical to every decimal place, because both libraries are solving the same minimisation problem. The interface differs, and the amount each one reports differs, but the line is the same line.",
    ],
    keyTakeaways: [
      'Both libraries minimise the residual sum of squares, so both produce the closed-form line from 17_0.',
      'Use scikit-learn when the goal is prediction, and statsmodels when the goal is understanding and inference.',
      'Two classic errors: passing a 1-D array to scikit-learn, and forgetting the constant in statsmodels.',
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
    note: "The intercept here is −5,872 g. A penguin with a zero-length flipper does not weigh negative six kilograms; such a penguin does not exist. Intercepts often sit far outside the range of the data, and when they do they are not worth interpreting literally. They are just where the line happens to cross the axis.",
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
      "The fitted slope is 50.15 grams per millimetre: on average, each extra millimetre of flipper goes with about 50 more grams of body mass. Before we build anything on that number, we should ask a sceptical question. Suppose flipper length actually had nothing to do with body mass. Could a sample of 333 penguins still produce a slope this large purely by chance?",
      "That imagined world, the one where there is no real relationship, is called the null hypothesis, written H₀. For a regression slope, H₀ says the true slope in the population is zero. A p-value is statistic that formally answers the question: if H₀ were true, how often would random chance hand us a slope at least as large as the one we actually observed? A small p-value means chance rarely produces something like this, so the null world is a poor explanation for our data.",
      "The clever part is that we can build the null world instead of just imagining it. Keep every flipper length and every body mass exactly as measured, but shuffle the body masses so that each one is paired with a random penguin's flipper. Any real connection between the two columns is now destroyed, but each column still has the same mean, the same spread, and the same shape as before. This is what a dataset with no relationship, but otherwise identical, would look like.",
      "Now fit a line to the shuffled data and write down the slope. It will be some small number near zero, positive or negative. Shuffle again, fit again, write it down again. After a thousand repetitions you have a whole collection of slopes, and a histogram of them shows what pure chance is capable of producing. This is called the sampling distribution of the slope under H₀, and the procedure is called a permutation test.",
      "Press 'Show one shuffle' in the widget to see a single shuffled dataset and its slope. Then look at the histogram of all 5,000 shuffled slopes. The most extreme value chance managed, in either direction, is about ±11 grams per millimetre. Our observed slope of 50.15 is not merely out in the tail of that histogram; it is so far beyond it that it cannot be drawn on the same axis.",
      "So the empirical p-value is zero out of 5,000. None of the shuffles came anywhere close to the observed slope. In practice we would report p < 0.0002, since the smallest p-value a simulation can measure is one divided by the number of shuffles. The conclusion is that the null hypothesis is not a credible explanation: the relationship between flipper length and mass is not the kind of thing chance produces.",
    ],
    keyTakeaways: [
      'H₀ says the true slope is zero. The p-value asks how surprising your data would be if that were true.',
      'A permutation test builds the null distribution directly, by shuffling, with no formula required.',
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
    note: "A p-value is the probability of seeing data this extreme if H₀ is true. It is not the probability that H₀ is true, and it says nothing about whether the effect is large enough to matter. Those are different questions, and the next three slides take them up.",
    widget: 'permutation-test',
  },
  {
    id: 'p2-2-bootstrap',
    section: 2,
    sectionTitle: 'Standard Error',
    title: 'How Much Would the Slope Wiggle?',
    subtitle: 'The bootstrap: resample the data you have to imagine the samples you do not',
    paragraphs: [
      "The permutation test told us the slope is not zero. The next question is how precisely we know it. We measured 333 penguins and got a slope of 50.15. If we had walked a different beach on a different day and measured 333 other penguins, we would have got a somewhat different slope — maybe 48, maybe 52. Our estimate is one draw from a whole range of slopes that different samples could have produced.",
      "The standard error is the name for the size of that wobble. Formally, it is the standard deviation of the slope across all the repeat samples we could have taken. A small standard error means that almost any sample would have produced nearly the same slope, so our estimate is precise. A large one means the slope depends heavily on which penguins happened to be measured.",
      "The difficulty is that we only have one sample, and we cannot go out and collect five hundred more. The bootstrap is a way around this. Draw 333 penguins from your own sample at random with replacement — meaning that after you pick a penguin, you put it back, so the same one can be picked twice while another is never picked at all. The result is a slightly different dataset of the same size, built from the same population of penguins. Fit a line to it and record the slope.",
      "Do that two thousand times and you have two thousand slopes, each from a plausible alternative sample. Their standard deviation is the bootstrap estimate of the standard error. The widget shows this histogram alongside the number statsmodels prints in its 'std err' column, which comes from the formula below rather than from simulation. The two agree to within about two percent, and that remaining gap is just simulation noise. It shrinks as the number of resamples grows.",
      "It is worth pausing on the difference between this slide and the last one, because the two procedures look similar and students often blur them. Both refit the line thousands of times on modified data. But the permutation test deliberately breaks the pairing between x and y, in order to see what a world with no relationship produces. The bootstrap keeps every (x, y) pair intact and resamples whole rows, in order to see how much a real relationship varies from sample to sample. So similar ideas about simulating different configurations of data, but completely different purposes.",
      "The formula version makes the intuition explicit. The standard error grows with MSE, the residual variance. Noisier data means a less certain slope. And it shrinks with S_xx, the total spread of the predictor. A wider range of flipper lengths pins the line down more firmly, in the same way that a longer ruler makes a straight edge easier to judge.",
    ],
    keyTakeaways: [
      'The standard error measures the precision of an estimate, not the spread of the data.',
      'The bootstrap resamples whole (x, y) pairs, which preserves the relationship; the permutation test breaks it.',
      'Simulation and the classical formula agree — the formula is a shortcut to the same idea, not a different one.',
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
      "A p-value tells us whether a slope is, or is not, distinguishable from zero. That is useful, but it throws away most of what we know. A confidence interval keeps more. Instead of a yes-or-no answer it gives a range of values for the slope that are consistent with the data, expressed in the units of the problem. For this example, grams per millimetre.",
      "Building a confidence interval from the standard error is straightforward. Start at the estimate and go out about two standard errors in each direction: β̂₁ ± 1.96 · SE. The 1.96 comes from the normal distribution, where 95% of values lie within 1.96 standard deviations of the centre. For the penguins that gives roughly [47.1, 53.2] grams per millimetre. Notice that zero is nowhere near this range, which is the same conclusion the permutation test reached, now with the size of the effect attached.",
      "The bootstrap slopes from the previous slide give the same interval by a different route. Sort the two thousand resampled slopes from smallest to largest, then read off the value at the 2.5th percentile and the value at the 97.5th percentile. The middle 95% of the bootstrap slopes is your interval. The widget shows both methods side by side, and they agree to within a fraction of a gram.",
      "Now comes the part where nearly everyone slips, including professionals. It is very tempting to say 'there is a 95% probability that the true slope lies between 47.1 and 53.2.' That sentence sounds right and is wrong. The true slope of the population is a single fixed number. It does not have a probability of being anywhere; it is either inside our interval or it is not, and we do not know which.",
      "What the 95% actually describes is the procedure, not this particular interval. If we repeated the whole study many times, with new samples, new fits, new intervals each time, about 95% of the intervals we produced would contain the true slope, and about 5% would miss it. Our one interval is one of those. It is probably one of the 95% that captured the truth, but there is no way to tell from the inside.",
      "Press 'What does 95% mean?' to watch this happen. The widget draws forty fresh samples from a population with a known slope and builds forty intervals, all by the same recipe. Around 38 of them cover the true value and around 2 miss. The ones that miss look exactly like the ones that hit. They have the same width, same appearance. That is the honest content of a confidence interval: a good procedure, applied once.",
    ],
    keyTakeaways: [
      'A confidence interval reports a range of plausible values, in the units of the problem.',
      'The 95% is a property of the method across repeat samples, not a probability about one interval.',
      'An interval that excludes zero is significant at α = 0.05. This is the same conclusion we reached when using the p-value, nut with more information attached.',
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
    note: "The bootstrap percentile method assumes the sampling distribution is roughly symmetric. When the bootstrap histogram comes out visibly lopsided, prefer the formula-based interval, or look up a bias-corrected bootstrap.",
    widget: 'confidence-interval',
  },
  {
    id: 'p2-4-sample-size',
    section: 2,
    sectionTitle: 'Significance vs. Importance',
    title: 'The Same Effect, More Data',
    subtitle: 'Why "statistically significant" is not a synonym for "matters"',
    paragraphs: [
      "We now have three tools: the p-value, the standard error and the confidence interval. They are all connected through the sample size. This slide is about a consequence of that connection; whether a result is 'statistically significant' depends as much on how much data you collected as on how large the effect really is.",
      "Here is the mechanism. The standard error shrinks in proportion to 1 / √n. Quadruple the sample and the standard error halves. The t-statistic is the estimate divided by its standard error, so as the standard error shrinks, t grows in proportion to √n. And a larger t means a smaller p-value. None of this changes the effect itself. The slope is whatever it is; only our precision in measuring it improves.",
      "The widget makes this concrete. The true slope is fixed at 0.4 and never changes. At n = 40 the confidence interval is wide enough to include zero, so the result reads 'not significant'. With only 40 we cannot rule out that the slope is nothing. Drag n upward. Nothing about the world is different, and the estimated slope stays close to 0.4, but the interval narrows around it. At some point it stops touching zero and the same 0.4 becomes 'significant', then 'highly significant'.",
      "Turn that around and it becomes a warning. Almost no real effect is exactly zero. So with a large enough sample, virtually any effect, no matter how tiny, will eventually cross the p < 0.05 threshold. When datasets have millions of rows, statistical significance is very easy to achieve and correspondingly tells you very little. It certifies that an effect can be detected. It does not certify that the effect is big enough to care about.",
      "This is the difference between statistical significance and practical importance. Significance is a statement about the data: we have enough of it to see that the effect is not zero. Importance is a statement about the world: an effect of this size would actually change a decision. Statistics can settle the first. The second is a judgement that requires knowing the domain.",
      "The practical advice that follows is to always report the estimate and its confidence interval, in units a reader can reason about, rather than the p-value alone. 'Each extra millimetre of flipper goes with 47 to 53 more grams' lets someone decide whether that matters. 'p < 0.001' does not.",
    ],
    keyTakeaways: [
      'The standard error is proportional to 1/√n — more data buys precision, not a bigger effect.',
      'Given a large enough sample, any effect that is not exactly zero becomes significant.',
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
      "Every p-value, standard error and confidence interval in Part 2 was computed under a set of assumptions about how the data behave. If those assumptions are badly wrong, the numbers are still printed, but they no longer mean what they claim to mean. There are four assumptions, and the usual way to remember them is the acronym LINE: Linearity, Independence, Normality of the residuals, and Equal variance.",
      "Linearity says the true relationship between x and y really is a straight line, so that a line is the right shape to fit. Equal variance says the scatter of points around that line is about the same everywhere. The model is not much more accurate for small x than for large x. Both of these can be checked with a single picture, and it is the most useful picture in all of regression.",
      "To make it, first recall what a residual is: for each observation, the residual is the observed y minus the value the line predicted, e = y − ŷ. It is the model's error for that one point. Now plot the residuals on the vertical axis against the fitted values ŷ on the horizontal axis. If the model is right, the result is a formless horizontal band of noise, centred on zero and the same thickness from left to right. Any visible pattern in this band is the model telling you about something it failed to capture.",
      "Two patterns come up constantly. A curve or arc means the linearity assumption is broken. The true relationship bends, so a straight line runs above the data in some regions and below it in others, and the residuals are systematically positive in some places and negative in others. A funnel, a band that gets wider or narrower as you move along the horizontal axis, means equal variance is broken. The line is right on average, but its predictions are much less trustworthy at one end of the range than the other.",
      "Step through the four cases in the widget: 'Healthy', 'Curved (L)', 'Funnel (E)' and 'Heavy tails (N)'. For each one, look at the scatter plot with the fitted line on the left and the residual plot on the right, and notice how much more obvious the problem is in the residual plot. Then look at R². Between the healthy data and the funnel it barely changes.",
      "That last observation is the reason this slide exists. A respectable R² tells you the line explains a good share of the variation. It tells you nothing about whether the assumptions behind the inference hold. A model can have an R² of 0.8 and a badly curved residual plot at the same time. So the residual plot is not an optional extra to look at when something seems off; it is part of fitting the model, every time.",
    ],
    keyTakeaways: [
      'Residuals vs. fitted values is the primary diagnostic — draw it every time.',
      'A curve in the residuals means linearity is broken. A funnel means equal variance is broken.',
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
    note: "Each case in the widget breaks exactly one assumption, which makes each signature clear. Real data is rarely so tidy. The Auto MPG data in the notebook breaks L and E at the same time, and the residual plot shows a curve and a funnel together.",
    widget: 'residual-diagnostics',
  },
  {
    id: 'p3-2-qq',
    section: 3,
    sectionTitle: 'LINE — Normality',
    title: 'Reading a Q-Q Plot',
    subtitle: 'Are the residuals normal enough for the inference to hold?',
    paragraphs: [
      "The N in LINE asks whether the residuals follow a normal distribution, the familiar bell curve. It helps to be clear about what this assumption is for. It is not needed to fit the line: least squares finds the same line whatever shape the residuals have. It is needed for the inference in Part 2, because the standard errors, t-statistics and p-values are derived by assuming the errors are normally distributed. If they are far from normal, those numbers become unreliable.",
      "The obvious way to check is to draw a histogram of the residuals and see whether it looks bell-shaped. This turns out to be a weak test. Changing the bin width can change the apparent shape considerably. Worse, the part of the distribution that matters most for inference is the tails, the rare, large residuals, and the tails are exactly where a histogram has the fewest observations and therefore the least to show you.",
      "A Q-Q plot (quantile–quantile plot) asks a sharper question. Sort the residuals from smallest to largest. For each one, work out what value a perfectly normal distribution would have produced at that same rank. The smallest of n normal draws, the second smallest, and so on. Then plot the actual residual against that theoretical value. If the residuals really are normal, each actual value is close to its theoretical partner and the points fall along the diagonal line.",
      "When the residuals are not normal, the points bend away from the diagonal, and the shape of the bend tells you how. An S-shape, with the ends of the plot curling away in opposite directions, means the tails are heavier than normal — there are more extreme residuals than a bell curve would produce. One end pulling away while the other stays on the line means the distribution is skewed, with a long tail on one side only.",
      "The widget shows the same residuals both ways. Switch between 'Normal', 'Heavy tails' and 'Right-skewed', and compare the histogram with the Q-Q plot each time. The heavy-tailed residuals are the instructive case: their histogram still looks passably bell-shaped, while their Q-Q plot is unmistakably S-shaped. The Q-Q plot is seeing something the histogram hides.",
      "The reassuring part is that inference is fairly forgiving here. The Central Limit Theorem says that averages of many observations tend toward a normal distribution regardless of what the individual observations look like, and regression coefficients are a kind of average. So with a reasonably large sample, mild non-normality in the residuals does little harm to the p-values and intervals. Severe non-normality, or a small sample, is another matter.",
    ],
    keyTakeaways: [
      'Normality matters for inference, not for fitting the line.',
      'Q-Q plots are better than histograms because they are sensitive in the tails.',
      'An S-curve means heavy tails; one end pulling away means skew.',
      'The Central Limit Theorem makes mild non-normality survivable at large n.',
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
    note: "The Jarque–Bera statistic in the statsmodels summary is a formal test of normality based on skewness and kurtosis. In large samples it will flag departures from normality that are far too small to matter, so read it alongside the Q-Q plot rather than instead of it.",
    widget: 'qq-plot',
  },
  {
    id: 'p3-3-independence',
    section: 3,
    sectionTitle: 'LINE — Independence',
    title: 'The Assumption You Cannot See in a Scatter Plot',
    subtitle: 'Independence lives in the order of the rows',
    paragraphs: [
      "The I in LINE stands for independence: the assumption that each observation's error is unrelated to every other observation's error. Knowing that one penguin was heavier than the line predicted should tell you nothing about whether the next penguin will be. This is the assumption students most often skip, for an understandable reason. Unlike the other three, it leaves no trace on any plot we have drawn so far.",
      "To see why, think about what a scatter plot contains. It shows each row as a dot, and the dots have no order. If you shuffled the rows of your dataset and redrew the scatter, the residual plot and the Q-Q plot, all three would be completely unchanged. But independence is a claim about how the rows relate to each other, and specifically, in the common case, about whether rows that are next to each other in the data have similar errors. That information is thrown away the moment you draw a scatter.",
      "The fix is to draw a different plot: the residuals against their row index, in the order the data arrived. If the residuals are independent, this looks like a sequence of coin flips: positive, negative, negative, positive, with no memory from one to the next. If they are not, you will see runs: long stretches where the residuals stay above zero, then long stretches below. Each error is carrying information about the next one. This is called positive autocorrelation.",
      "The Durbin–Watson statistic turns this picture into a number. It compares the size of the differences between consecutive residuals to the size of the residuals themselves. When neighbours are unrelated, DW comes out near 2. When neighbours tend to be similar (positive autocorrelation) the consecutive differences are small and DW drops toward 0. When neighbours tend to alternate, DW rises toward 4. Values below about 1.7 or above about 2.3 are worth looking into.",
      "Drag the autocorrelation slider in the widget and watch the sequence plot and the DW value together. At ρ = 0 the residuals jump around freely and DW sits near 2. As ρ increases, the residuals start to drift in long runs and DW falls. Notice, too, that the scatter plot beside it does not change in any way that would alert you.",
      "Why does this matter for inference? Dependent observations carry less information than their count suggests. If each penguin's error is half predictable from the previous one, then 333 penguins are worth something less than 333 independent pieces of evidence. But the standard error formula counts all 333, so it comes out too small, and everything downstream, the t-statistics, the p-values, the confidence intervals, looks more certain than it should. Time series data is the usual source of this problem, but any dataset with a meaningful row order can have it.",
    ],
    keyTakeaways: [
      'Independence is invisible in a scatter plot — it is a property of the row order.',
      'DW ≈ 2 is clean; below about 1.7 suggests positive autocorrelation, above about 2.3 negative.',
      'Dependence makes standard errors too small, so everything looks more significant than it is.',
      'Ask what the row order means before trusting the statistic.',
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
    note: "In the notebook, the Auto MPG data scores DW = 0.926, which looks like a serious violation. It is an artifact: the rows are sorted by model year, so consecutive cars are similar by construction. The lesson is not a model change, but a reminder to ask what the row ordering actually represents before reading the statistic.",
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
      "When a model fails its diagnostics, the cause is not always the shape of the whole relationship. Sometimes a handful of unusual points are responsible, and the rest of the data is fine. Before reaching for a more complicated model, it is worth checking for that. Doing so requires separating three ideas that everyday language runs together under the single word 'outlier'.",
      "Leverage is about the predictor only. A point has high leverage when its x value is far from the mean of x — a penguin with an unusually long or short flipper, say. Look at the formula below: y does not appear in it. Leverage is potential, not damage. A high-leverage point is like a long lever arm: it could move the line a great deal, but only if it also pushes in some direction.",
      "An outlier, in the technical sense, is about y given x. It is a point with a large residual — one that the line badly mispredicts. A penguin with a perfectly ordinary flipper length but a body mass far above what that flipper would suggest is an outlier. It is unusual vertically, not horizontally.",
      "Influence is the only one of the three defined by its consequences. A point is influential if removing it from the data would noticeably change the fitted coefficients. This is the one we actually care about, because it is the one that means a single row is determining what the model says.",
      "The key relationship between the three is that influence requires both of the others. A point far out in x but sitting right on the line has high leverage and a tiny residual: it anchors the line where it already was, and removing it changes little. A point with a large residual in the middle of the x range has no lever arm to work with: it nudges the intercept slightly and barely touches the slope. Only a point that is far out in x and off the line — a long lever arm with a push on it — will drag the slope around.",
      "Drag the orange point around the widget and watch the three flags respond independently. Then try the presets. 'Leverage only' puts the point far out in x but on the line: leverage goes through the roof, Cook's Distance (the influence measure, introduced next) stays small, and the line hardly moves. 'Outlier only' puts it in the middle with a large residual. 'Influential' does both, and the line swings.",
    ],
    keyTakeaways: [
      'Leverage means extreme in x. Outlier means unusual y given x. Influence means the fit actually changes.',
      'Influence requires both high leverage and a large residual.',
      'High leverage on its own still shrinks the standard errors, which makes the inference look better than it should.',
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
      "Dragging one point around a small dataset is a good way to build intuition, but it does not scale. The full Ames housing data has 2,930 houses, and even the 245-house sample in the widget is too many to inspect one by one. An influential row in a dataset that size will not stand out in the scatter plot — it is one dot among hundreds, and it may sit in a perfectly plausible-looking place. We need a number computed for every row, so that the influential ones can be found by sorting rather than by eye.",
      "Cook's Distance is that number. For each observation it asks: if this row were deleted and the model refitted, how much would all the fitted values move? Look at the formula below and you will see it is a product of two pieces — one built from the residual, and one built from the leverage. That is the previous slide's lesson made arithmetic: both factors have to be non-trivial for the product to be large.",
      "The usual way to read Cook's Distance is to plot it against the row index, so each observation gets a bar. Most bars are tiny. If one towers over the rest, that is the row to investigate. The common rule of thumb flags any observation with D greater than 4/n, where n is the number of rows — for the 245-house sample in the widget that threshold is about 0.016, and the dashed line in the Cook's D panel marks it.",
      "The widget includes a deliberately poisoned row: a mansion's floor area recorded against a shed's price, the kind of thing a data-entry error produces. Use the toggle to add and remove it. With the row in, look for it in the scatter plot. It is hard to spot. Now look at the Cook's Distance panel, where its bar dwarfs every other. The table below shows what it does to the model: the dollars-per-square-foot slope shifts by several percent because of that one row.",
      "Finding the point is the easy part. Deciding what to do about it is harder, and this is where judgement — and honesty — comes in. There are legitimate reasons to remove a row from a dataset: a data-entry error, a measurement in the wrong units, a failed instrument, or a point that genuinely belongs to a different population from the one you are studying. Each of these is a fact about the data that you can state and defend.",
      "There are also illegitimate reasons, and they are tempting because they work. 'It was hurting my R²' is not a reason. Neither is 'Cook's Distance flagged it' — the statistic tells you where to look, not what to do. When a point is real and merely inconvenient, the honest options are to report the model with and without it, to use a method such as Huber robust regression that is less swayed by extreme points, or to build a model of whatever is actually going on. Whichever you choose, write down the decision and why.",
    ],
    keyTakeaways: [
      "Cook's Distance combines leverage and residual into one per-observation number.",
      'D > 4/n is a flag for investigation, not a rule for deletion.',
      'Remove a row for a documented data problem, never for a better-looking R².',
      'If you cannot justify dropping it: report both fits, use robust regression, or model the cause.',
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
    note: "Dropping a point changes what your model is a model of. A housing model fitted without its mansions is a model of ordinary houses. That may be exactly what you want — but then say so, and do not present it as a model of all houses.",
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
      "Sometimes the diagnostics fail and no individual point is to blame. The relationship simply is not a straight line. GDP per capita against life expectancy, using the Gapminder data for 142 countries, is the standard example. Among the poorest countries, a little more income goes with a large gain in life expectancy. Among rich countries, additional income makes very little difference. The scatter rises steeply and then flattens into a plateau.",
      "Fit a straight line to this anyway and see what happens in the residual plot. The residuals arc: negative at the low end, positive in the middle, negative again at the high end, because the line cuts through a curve. That is a linearity violation. Their spread also shrinks as fitted values rise, which strains the equal-variance assumption. And yet the R² is 0.46, which is not a bad number. This is exactly the situation the residual-plot slide warned about: a fit that looks acceptable by the summary statistic and is wrong in shape.",
      "The fix is not a more elaborate kind of model. It is a transformed predictor. This sometimes surprises students, because 'linear regression' sounds like it should only handle straight lines. But the word linear refers to the parameters — the model must be an intercept plus a slope times something. What that something is, is up to you. Replacing x with log(x) gives y = β₀ + β₁·log(x), which is still a linear model in the sense that matters, and least squares fits it without any change. You are bending the data so that a straight line fits it, rather than bending the line.",
      "Why log, rather than a square root or a reciprocal, which also bend curves? Because of the shape of the relationship. The scatter shows diminishing returns: each additional dollar of income buys less life expectancy than the one before. The logarithm is the function whose slope is 1/x — very steep when x is small and nearly flat when x is large. That is the same shape the data has, so log is the natural candidate. Other curved relationships call for other transformations, and the residual plot is the tool for telling whether you chose well.",
      "Toggle the transform in the widget and watch both panels. The scatter straightens out, and the residual arc flattens into a band. R² improves as well, from 0.46 to about 0.65, but do not treat that as the reason for the transformation. R² can go up for bad reasons and down for good ones. The residual plot is what tells you whether the model's shape now matches the data's shape.",
    ],
    keyTakeaways: [
      'Curved data breaks linearity, and often equal variance along with it.',
      'Regression requires linearity in the parameters, not in the variables — you can transform variables freely.',
      'Log matches diminishing returns because the derivative of log(x) is 1/x.',
      'Judge a transformation by the residual plot, not by R².',
    ],
    formula: {
      latex: 'y = \\beta_0 + \\beta_1 \\log(x)',
      explanation:
        'A level–log model. The relationship is curved in x and straight in log(x), which is all least squares needs.',
      terms: [
        { symbol: '\\log(x)', meaning: 'Natural log of the predictor' },
        { symbol: '\\beta_1', meaning: 'Change in y per unit change in log(x)' },
      ],
    },
    note: "The Box-Cox procedure searches automatically for the power transformation that best straightens the data. On the Gapminder data it returns λ ≈ 0, which corresponds to the log. The automated search and the reasoning about diminishing returns arrive at the same answer.",
    widget: 'log-transform',
  },
  {
    id: 'p5-2-interpretation',
    section: 5,
    sectionTitle: 'Interpreting Log Models',
    title: 'What Does a Log Slope Mean?',
    subtitle: 'Three flavors, three sentences, one approximation to watch',
    paragraphs: [
      "A transformation solves one problem and creates another. The model now fits, but its coefficient no longer means what a slope usually means. In the Gapminder model the slope is about 7.2, and the literal reading is 'life expectancy rises 7.2 years per one-unit increase in log GDP.' That sentence is correct, and nobody can use it, because no one thinks about income in log units. We need a way to translate back.",
      "It helps to know that there are only three cases, depending on where the log is. In the level–log model, only x is logged, as in Gapminder. In the log–level model, only y is logged — common when the response is a price or a count that spans several orders of magnitude. In the log–log model, both are logged. Each has its own one-sentence interpretation, and the widget shows all three.",
      "Level–log: a 1% increase in x is associated with an increase in y of about β₁/100 units. For Gapminder, a 1% increase in GDP per capita goes with about 0.072 more years of life expectancy — or, more usefully, a 10% increase goes with about 0.7 years. Log–level: a one-unit increase in x is associated with a change in y of about 100·β₁ percent. Log–log: a 1% increase in x is associated with about β₁ percent change in y. Economists call this last quantity an elasticity, and it is the reason log–log models are so common in that field.",
      "The β₁/100 rule is not something you have to memorise; it comes from one fact about logarithms. Increasing x by 1% means multiplying it by 1.01, and log(1.01) is 0.00995, which is almost exactly 1/100. So when x goes up by 1%, log(x) goes up by about 0.01, and the fitted value moves by β₁ times 0.01, which is β₁/100. The same idea gives the other two rules.",
      "The word 'about' is doing real work in those sentences, and the widget lets you see how much. It shows the exact change in the fitted value next to the rule-of-thumb approximation. For small percentage changes they agree closely. Move the slider past about 10% and they start to drift apart, because log(1.10) is 0.0953, not 0.10, and the gap only widens from there. For large changes, compute the exact answer.",
      "Two things to carry forward. First, every transformation changes the question the model is answering, and each step away from the raw variables makes the coefficients harder to explain to someone else — that is a real cost, to be weighed against the better fit. Second, if you have fitted log(y) and need a prediction in the original units, taking the exponential of the prediction is not enough. It systematically underestimates the average y, for a reason known as Jensen's inequality, and the correction depends on the residual variance. The notebook shows how.",
    ],
    keyTakeaways: [
      'Level–log: a 1% increase in x goes with about β₁/100 more units of y.',
      'Log–level: a one-unit increase in x goes with about 100·β₁ percent more y.',
      'Log–log: the slope is the elasticity — percent change in y per percent change in x.',
      'Back-transforming a log-y prediction needs a correction, not just an exponential.',
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
    note: "R² values cannot be compared across different y scales. A model of log(price) and a model of price are explaining variation in two different quantities, so their R² values are answers to two different questions and cannot be ranked against each other.",
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
      "Every number in this unit so far — R², the residual plots, the diagnostic statistics — was computed on the same rows that were used to fit the model. There is a problem hidden in that. Least squares chose the coefficients specifically to make the residuals on those rows as small as possible. So of course the model looks good on them; it was built to. What we actually want to know is how well it will do on new data, and its performance on the training rows is an optimistic guide to that.",
      "The remedy is simple. Before fitting anything, set aside a random 20–30% of the rows and do not touch them. Fit the model on the remaining rows, which are called the training set. Then compute R² on the rows you set aside, the test set, using the model that has never seen them. The test R² is an honest estimate of how the model performs on new data, because from the model's point of view, the test rows are new data.",
      "One rule makes this work: the test set must stay untouched until the very end. That means it is off-limits for fitting, obviously, but also for choosing between models. If you try five models, pick the one with the best test R², and then report that number, the test set has become part of the selection process and its score is optimistic again. (Inspecting the test rows for data-quality problems, without using them to make modelling decisions, is fine.)",
      "The widget applies this to the Ames housing model. Press 'New split' a few times to draw different random partitions and compare the train and test R² each time. They come out essentially equal. This is what a model with two parameters fitted on hundreds of rows should do: it has almost no capacity to memorise individual houses, so everything it learned is general pattern, and general pattern transfers. Simple models generalise well.",
      "One detail is worth getting straight now, because it confuses people later. Sometimes the test R² comes out higher than the train R². That does not mean something leaked, and it is not a bug. Both numbers are computed from random subsets of the data, so both bounce around, and on some splits the test set simply happens to be easier. The histogram in the widget shows the train-minus-test gap across 300 splits: it is centred near zero with values on both sides. The sign of overfitting is a large, consistent positive gap, not a small gap in either direction.",
    ],
    keyTakeaways: [
      'Fitting and evaluating on the same rows overstates how well a model performs.',
      'The test set is off-limits for fitting and for model selection.',
      'Simple models generalise — a near-zero train/test gap is the healthy baseline.',
      'Test R² coming out above train R² is ordinary sampling variation.',
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
      "The Ames model could not overfit because it had nothing to overfit with: two parameters cannot memorise hundreds of houses. To see the failure mode, we need a model with room to memorise, and a dataset small enough that memorising is possible. The widget generates 60 points from a sine wave plus random noise, splits them 39 train / 21 test, and fits polynomials — a line, a parabola, a cubic, and so on up — of whatever degree you choose. Higher degree means a more flexible curve.",
      "Start at degree 1. This is a straight line through a sine wave. It can follow the broad downward drift of the data but cannot bend, so it misses the shape entirely. Both the train R² and the test R² are mediocre, at roughly 0.58 and 0.43. When a model is too simple to capture the pattern, it does poorly everywhere. That is called underfitting, or high bias: the model's assumptions are too restrictive for the truth.",
      "Now raise the degree to 3. A cubic can bend twice, which is enough to follow one wave of a sine. The curve tracks the signal and both scores jump above 0.83. The model has found the real pattern, and because it is the real pattern, it holds on the test rows just as well as on the training rows.",
      "Keep going. At degrees 6, 8, 10 and beyond, the model has more flexibility than the signal requires, and the extra flexibility has nowhere useful to go — so it goes toward fitting the noise. The curve develops wiggles that chase individual training points. Watch the two scores now. Train R² keeps creeping toward 1.0, as it always will, since a more flexible model can always fit the training data at least as well. Test R² peaks, turns around, and then collapses. At high degrees it goes negative, which means the model predicts new data worse than simply guessing the mean every time. This is overfitting, or high variance: the model is so sensitive to the particular training rows that a different sample would produce a very different curve.",
      "The pattern you have just watched is the bias–variance tradeoff, and the formula below is its accounting. Test error has three parts: bias squared, which falls as the model gets more flexible; variance, which rises as it does; and irreducible noise, which no model can ever remove. Moving right along the degree axis trades bias for variance, and the best model sits where the sum bottoms out — around degree 3 to 5 here.",
      "The reason this matters beyond a toy example is that finding that sweet spot without cheating is a large part of the rest of this course. Cross-validation, regularization and ensembles are all techniques for locating the minimum of the test-error curve without ever peeking at the test set to do it.",
    ],
    keyTakeaways: [
      'Training score always improves with complexity; test score peaks and then collapses.',
      'Underfitting means high bias; overfitting means high variance.',
      'A negative test R² means the model is worse than predicting the mean.',
      'The best complexity is where Bias² + Variance is smallest.',
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
      "Step back and look at the shape of what you have done. In 17_0 you learned to fit a line. In this unit you learned to interrogate it, with a sequence of questions that build on each other. Is the slope real, or could chance have produced it? How precisely do we know it, and what range of values is plausible? Are the assumptions behind those answers — linearity, independence, normality, equal variance — actually satisfied? Is one unusual point driving the whole result? Does the relationship need a different shape? And finally, does any of it hold up on data the model has never seen?",
      "The sandbox puts all of those questions in one place. Instead of a real dataset, you control the world: set the true slope, the noise level, the sample size and the amount of curvature, and the widget generates data from that world and runs every diagnostic on it. The fit, the residual plot, the standard error, the t-statistic, the p-value, Durbin–Watson, the confidence interval and the held-out R² all update at once. Because you know the truth, you can see exactly when each tool is telling it and when it is being fooled.",
      "Here are three experiments worth running. First, set the noise high and n small, and note that the confidence interval is wide and the p-value unimpressive. Now raise n step by step. The true slope has not changed, but watch the interval narrow and the p-value fall as the real effect emerges from the noise — the significance-versus-importance lesson from Part 2, seen from the inside.",
      "Second, add curvature and watch the residual plot. It will start to arc while R² stays perfectly respectable. This is the linearity lesson from Part 3: the summary statistic does not notice what the residual plot makes obvious.",
      "Third, set the true slope to exactly zero and regenerate the data repeatedly. Most of the time the confidence interval will contain zero, as it should. But about one time in twenty, it will not, and the p-value will read as significant even though there is no effect at all. That is not a malfunction; it is what a 95% procedure means. Seeing it happen is the best inoculation against over-trusting a single p-value.",
      "When you are done, take the quiz linked in the header. Everything in this unit carries over directly to multiple regression, which has more than one predictor: the same fit, the same diagnostics, the same generalisation test, just with more columns. That is 17_2, which adds the questions that only arise with many predictors — which ones to keep, how to prevent overfitting, and how to choose between models without touching the test set.",
    ],
    keyTakeaways: [
      'Fit, then interrogate: significance, assumptions, influence, functional form, generalisation.',
      'The residual plot answers more questions than any single statistic.',
      'Every idea here carries over to multiple regression unchanged.',
    ],
    note: "With the true slope set to zero, roughly 1 interval in 20 will miss it. That is not a malfunction — it is what a 95% procedure means, seen from the inside.",
    widget: 'slr-sandbox',
  },
];
