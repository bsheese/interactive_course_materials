import type { Slide } from '@kit/types';

export const slides: Slide[] = [
  // --- SECTION 1: FRAMING ---
  {
    id: 'framing',
    section: 1,
    sectionTitle: 'Choosing a Chart',
    title: 'The Same Data, Eight Different Questions',
    subtitle: 'Why seaborn has this many plotting functions in the first place',
    paragraphs: [
      "Take one dataset, Palmer Penguins: bill length, bill depth, flipper length, body mass, species, sex. `df.describe()` gives you a table of means and standard deviations, but a table can't show you whether a distribution is lopsided, whether two variables move together, or whether three species actually look different from one another.",
      'Every chart in this module answers a different one of those questions over the exact same rows. A histogram asks "what does one variable\'s spread look like?" A scatter plot asks "do these two variables move together?" A heatmap asks that same question for every pair of variables at once.',
      'Every seaborn axes-level function you\'ll see here shares the same three arguments: `data=` the dataframe, `x=`/`y=` the variables to plot, and `hue=` an optional third categorical variable that gets its own colour. Learn that vocabulary once and every plot type reads the same way.',
    ],
    keyTakeaways: [
      'The dataset never changes across this module; only the question does.',
      "`data=`, `x=`, `y=`, `hue=` are the shared vocabulary of every seaborn axes-level function.",
      'Picking the right chart is picking the right question, not memorizing eight unrelated APIs.',
    ],
  },

  // --- SECTION 2: DISTRIBUTIONS ---
  {
    id: 'distributions-hist',
    section: 2,
    sectionTitle: 'Distributions',
    title: 'One Variable, Many Shapes',
    subtitle: 'What a mean and a standard deviation can\'t tell you',
    paragraphs: [
      'Flipper length has a mean and a standard deviation, and both are honest numbers. But they describe a single symmetric hump equally well whether the real data is one hump, two humps, or a long tail, because a mean and a standard deviation only ever describe one hump.',
      '`sns.histplot` bins the values and counts how many fall in each bin, turning that invisible shape into something you can see. Splitting by `hue="species"` overlays three histograms in one plot: if the species really differ in size, their bars will separate.',
      'The `bins` argument controls resolution. Too few bins and real structure gets smoothed away; too many and you\'re looking at sampling noise dressed up as pattern.',
    ],
    keyTakeaways: [
      'A histogram bins one numeric variable and counts observations per bin.',
      '`hue=` overlays one histogram per category, so group differences become visible rather than averaged away.',
      'Bin count is a real modelling choice, not a cosmetic default.',
    ],
    widget: 'hist',
  },
  {
    id: 'distributions-box',
    section: 2,
    title: 'Five Numbers, One Shape: The Box Plot',
    subtitle: 'Median, quartiles, whiskers, and the rule for calling something an outlier',
    paragraphs: [
      'A histogram shows shape; a box plot compresses that same distribution into five numbers so several groups can sit side by side and be compared directly: the median, the first and third quartiles (the box), and two whiskers.',
      "Seaborn's whiskers, by default, extend to the most extreme point still within 1.5 times the interquartile range (Q3 minus Q1) of the box. Anything past that fence is drawn as an individual dot: a flagged outlier, not a value the whisker pretends is typical.",
      "That 1.5x IQR rule is arbitrary in the sense that any threshold is arbitrary, but it's a consistent, well-known one, which is exactly why box plots make quick group comparisons: three species, three boxes, one glance.",
    ],
    keyTakeaways: [
      'The box spans the interquartile range (IQR): Q1 to Q3.',
      "Whiskers reach the most extreme non-outlier point; points beyond 1.5*IQR from the box are drawn individually.",
      'Box plots trade shape detail for the ability to compare many groups at a glance.',
    ],
    formula: {
      latex: '\\text{fence} = Q_3 + 1.5 \\times (Q_3 - Q_1)',
      explanation: "Seaborn's default rule for the upper whisker fence; the lower fence subtracts the same amount from Q1.",
      terms: [
        { symbol: 'Q_1, Q_3', meaning: 'First and third quartiles (25th and 75th percentiles)' },
        { symbol: 'Q_3 - Q_1', meaning: 'Interquartile range (IQR): the width of the box' },
      ],
    },
    widget: 'box',
  },
  {
    id: 'distributions-violin',
    section: 2,
    title: 'What the Box Plot Hides',
    subtitle: 'Bimodality and skew that five numbers can flatten out',
    paragraphs: [
      "A box plot's five numbers assume a shape worth summarizing that way: roughly one hump. If a group is actually two humps, bimodal, because it secretly contains two populations, the box plot draws a perfectly normal-looking box anyway. The five numbers are correct; the impression they give is not.",
      '`sns.violinplot` replaces the box with a rotated, mirrored kernel density estimate (KDE): the same smoothing idea behind a histogram, but drawn as a continuous curve instead of bins, so multiple humps stay visible.',
      "The `bw_adjust` parameter scales the KDE's bandwidth. Turn it down and the violin gets wrinklier, chasing every bump in the sample; turn it up and it smooths those bumps away. There's no single correct setting, only a trade-off between noise and over-smoothing.",
    ],
    keyTakeaways: [
      'A violin plot is a box plot\'s categorical comparison, redrawn with a KDE instead of five summary numbers.',
      'Violins reveal bimodality and skew that a box plot\'s five numbers can hide.',
      'bw_adjust trades detail (real bumps, or noise) for smoothness.',
    ],
    note: "Seaborn's violinplot also supports split=True with a two-level hue, drawing one category on the left half of each violin and the other on the right, so two groups compare directly without doubling the width.",
    widget: 'violin',
  },

  // --- SECTION 3: COMPARING CATEGORIES ---
  {
    id: 'categories-bar',
    section: 3,
    sectionTitle: 'Comparing Categories',
    title: 'Comparing Averages, With Uncertainty',
    subtitle: 'A bar height is a claim; the whisker is how confident to be in it',
    paragraphs: [
      "`sns.barplot` draws one bar per category at the group's mean, by default, with a whisker showing a 95% confidence interval around that mean. That whisker is the entire reason to prefer a bar plot over just printing three numbers in a table.",
      'Two bars can look decisively different while their confidence intervals overlap heavily, meaning the apparent gap could plausibly be sampling noise. Read the whiskers before the bar heights.',
      'Adding `hue="sex"` splits each species\' bar into two, side by side, so a size difference between species and a difference between sexes within species can both be seen in one chart instead of being tangled together.',
    ],
    keyTakeaways: [
      'A bar plot shows a point estimate (usually the mean), not raw totals or counts.',
      'The error bar is a 95% confidence interval; overlapping whiskers mean the groups may not truly differ.',
      '`hue=` grades a comparison by a second category without a second chart.',
    ],
    widget: 'bar',
  },
  {
    id: 'categories-strip',
    section: 3,
    title: 'Before You Trust the Bar, Look at the Dots',
    subtitle: 'Every observation, jittered so it stays visible',
    paragraphs: [
      "A bar plot's mean and confidence interval are a compression of real, individual penguins. `sns.stripplot` draws every one of them: one dot per bird, positioned by its category and its exact value.",
      "Plotted with no adjustment, dots at the same value would stack directly on top of each other and hide how many penguins are really there. `jitter` nudges each point sideways by a small random amount along the category axis, purely for visibility; it changes nothing about the y-values.",
      "Look at this next to the bar plot from the previous slide: the same three species, the same body mass. The bar told you where the middle is. The dots tell you how much a real bird can vary from it, and whether the mass ranges for two species actually overlap.",
    ],
    keyTakeaways: [
      'A strip plot shows every observation individually rather than a summary statistic.',
      'jitter is a visual displacement only; it never changes the plotted value.',
      'Raw points reveal overlap between groups that a mean-and-interval summary can obscure.',
    ],
    widget: 'strip',
  },

  // --- SECTION 4: RELATIONSHIPS ---
  {
    id: 'relationships-scatter',
    section: 4,
    sectionTitle: 'Relationships',
    title: 'Two Variables at Once',
    subtitle: 'Colour and size as two more channels on a flat page',
    paragraphs: [
      'Every chart so far has compared one numeric variable across categories. `sns.scatterplot` instead plots two numeric variables directly against each other, one point per row: bill length on one axis, flipper length on the other.',
      'A scatter plot has room for more than just position. `hue="species"` colours each point by its category, and `size="body_mass_g"` scales each point\'s radius by a third numeric variable, so a single flat chart carries four dimensions of information at once.',
      'Look for the pattern before reading any numbers: do points of the same colour cluster together? Does the cloud trend up and to the right, or is it shapeless? Those visual impressions are exactly what the next slide starts to formalize.',
    ],
    keyTakeaways: [
      'A scatter plot positions points by two numeric variables directly, with no binning or aggregation.',
      'hue and size add a third and fourth dimension to a two-dimensional chart.',
      'Visual clustering and trend are the raw material Pearson\'s r and a regression line will quantify next.',
    ],
    widget: 'scatter',
  },
  {
    id: 'relationships-reg',
    section: 4,
    title: 'Adding the Trend Line',
    subtitle: 'What regplot draws that scatterplot never will',
    paragraphs: [
      '`sns.regplot` starts from exactly the same scatter of points as `sns.scatterplot`, then adds one thing: a fitted line (by default, the ordinary least squares line of best fit) plus a shaded confidence band around it.',
      "That line is not decoration. Its slope is a direct, quantitative claim: for every one-millimetre increase in flipper length, body mass tends to change by this many grams. Pearson's r and R² answer, respectively, how strong that linear relationship is and how much of body mass's variation the line accounts for.",
      "Toggle the fit line off in the widget below and you're back to a plain scatterplot. Toggle it on and the same data now makes a specific, checkable prediction.",
    ],
    keyTakeaways: [
      'regplot = scatterplot + a fitted line + a confidence band around that line.',
      "The line's slope is a quantitative prediction, not just a visual trend.",
      'R² measures how much of the y-variable\'s variance the line explains.',
    ],
    formula: {
      latex: '\\hat{y} = mx + b, \\quad m = r \\cdot \\frac{s_y}{s_x}',
      explanation: 'The same ordinary least squares line from the regression unit, now drawn automatically by regplot.',
      terms: [
        { symbol: 'r', meaning: "Pearson's correlation coefficient" },
        { symbol: 's_y / s_x', meaning: 'Ratio of the standard deviations of y and x' },
      ],
    },
    widget: 'reg',
  },

  // --- SECTION 5: CORRELATION OVERVIEW ---
  {
    id: 'correlation-heatmap',
    section: 5,
    sectionTitle: 'Correlation Overview',
    title: 'Every Pair, At Once',
    subtitle: 'One chart instead of six scatter plots',
    paragraphs: [
      'Penguins have four numeric measurements. Comparing every pair with a scatter plot would take six separate charts. `df.corr()` computes Pearson\'s r for every pair in one table, and `sns.heatmap()` turns that table into color: warm cells for positive correlation, cool cells for negative, pale cells near zero.',
      'The `annot=True` argument writes the exact r value into each cell, so the heatmap is precise as well as immediate. The diagonal is always exactly 1.0: every variable correlates perfectly with itself.',
      'Because the matrix is symmetric, the cells above and below the diagonal repeat the same information. Masking the upper triangle removes that redundancy without losing anything.',
    ],
    keyTakeaways: [
      'df.corr() computes Pearson\'s r for every pair of numeric columns at once.',
      'annot=True prints exact values on top of the colour encoding.',
      'A correlation matrix is symmetric; the diagonal is always 1.0.',
    ],
    formula: {
      latex: 'r_{XY} = \\frac{\\text{Cov}(X, Y)}{s_X s_Y}',
      explanation: 'Pearson\'s r, computed here for every column pair rather than one pair at a time.',
      terms: [
        { symbol: '\\text{Cov}(X, Y)', meaning: 'Covariance between columns X and Y' },
        { symbol: 's_X, s_Y', meaning: 'Standard deviations of X and Y' },
      ],
    },
    widget: 'heatmap',
  },

  // --- SECTION 6: CAPSTONE ---
  {
    id: 'capstone-sandbox',
    section: 6,
    sectionTitle: 'The Full Sandbox',
    title: 'Choose Your Own Chart',
    subtitle: 'Every plot type from this module, either dataset, one control panel',
    paragraphs: [
      "You've now seen all eight plot types, each motivated by a specific question about the penguins. This sandbox puts all eight in one place, with a second dataset (a small Ames, Iowa housing sample) to try them on.",
      'Switch plot type and the x/y/hue controls update to the variables that make sense for that chart; switch dataset and everything re-plots on housing data instead. The generated seaborn call at the bottom always matches exactly what is on screen.',
      "Use it to ask your own questions: does neighborhood predict sale price the way species predicts body mass? Is living area's relationship to price closer to a scatter cloud or close to a clean line?",
    ],
    keyTakeaways: [
      'Every seaborn function in this module shares the same data/x/y/hue vocabulary.',
      'Switching dataset or plot type is switching the question, not learning a new tool.',
      'The generated code is a real, runnable starting point for your own notebook.',
    ],
    widget: 'sandbox',
  },
];
