import type { Slide } from '@kit/types';

export const slides: Slide[] = [
  // --- PART 1: CLEANING AND LEAKAGE (17_2_1_1) ---
  {
    id: 'p1-1-split-rule',
    section: 1,
    sectionTitle: 'The Deterministic vs. Statistical Rule',
    title: 'Does This Step Compute Anything from the Data?',
    subtitle: 'The one question that puts the cleaning steps in order',
    paragraphs: [
      "In 17_1 every model had one predictor. Nobody prices a house off its square footage alone, though, and the Ames dataset describes each of its 2,930 sales with about 80 features: the neighborhood, the kitchen, the basement, the garage and much more. Multiple linear regression lets us use all of them at once. Before we can, the raw file needs cleaning. Some columns that look numeric are really category codes, thousands of blank cells mean that a house has no basement rather than that someone forgot to record it, and a handful of rows are partial sales that the dataset's author recommends dropping.",
      "Cleaning is not only a matter of which steps to take. The order matters too, and one question decides it: does this step compute anything from the data? Some steps apply a fixed rule to each row by itself. Taking log(SalePrice) needs nothing but that one house's price; you would get the same answer for that house whether you transformed one row or all 2,930. We call these steps deterministic. Other steps have to look across many rows to do their job. Filling a missing Lot Frontage with the column's median needs the median, and the median is computed from the data. We call these steps statistical.",
      "The distinction matters because of the test set. Its whole purpose is to stand in for houses the model has never seen, so that its score tells us how the model will do on future sales. If the median used to fill gaps in the training rows was computed from all 2,930 houses, then the roughly 585 test houses had a say in what went into the training data. Nothing crashes and no warning appears, but the test set is no longer a clean preview of the future. This is called data leakage: information from the test set reaching the model through any route at all.",
      "The rule that follows is simple to state. Deterministic steps can be done on the full dataset, before the split. Then comes the split. After it, every statistical step is fitted on the training rows only and then applied, unchanged, to both sets. That is exactly the distinction scikit-learn makes with `fit_transform` on the training set and `transform` on the test set: the imputer learns its medians from training rows, and the test rows receive those same medians.",
      "The widget lists eight steps from the notebook. For each one, press 'Before split' or 'After, train only', and read the reasoning that appears. Two of them deserve extra thought. Keeping the 40 features most correlated with price feels like a modelling decision rather than a cleaning step, but it computes a correlation from the data, so it falls under the same rule. Building Total_Square_Footage by adding three columns is pure row-by-row arithmetic, so it is safe either way, even though the notebook does it after the split as a matter of habit.",
      "The same rule applies one level down, inside cross-validation. Each validation fold plays the role of a small test set, so a statistical step such as StandardScaler has to be refitted on the training folds every time, and never on the fold being scored. Doing that by hand is error-prone, which is why the notebooks from Part 2 onward put the scaler and the model together in a Pipeline and let cross-validation refit the whole thing fold by fold.",
    ],
    keyTakeaways: [
      'A step that applies a fixed rule to each row on its own is deterministic and is safe to do before the split.',
      'A step that computes something from the data, such as a median, a mean, a scale or a correlation, is statistical and must be fitted on the training rows only.',
      'Letting test rows influence any fitted step is data leakage, and it makes the test score look better than the model really is.',
      'The same rule holds inside cross-validation, which is why the scaler lives inside a Pipeline.',
    ],
    note: "Dropping the houses with more than 4,000 square feet is safe before the split because the rule comes from the dataset's documentation, not from inspecting these prices. A rule such as 'drop any price more than three standard deviations above the mean' looks similar but is statistical, because the mean and standard deviation are computed from the data.",
    widget: 'split-rule',
  },
  {
    id: 'p1-2-selection-leak',
    section: 1,
    sectionTitle: 'What Leakage Costs',
    title: 'A Model Made of Noise',
    subtitle: 'Selecting features before the split can manufacture predictive power',
    paragraphs: [
      "The rule on the previous slide can seem fussy. A median computed with or without 585 test houses will hardly change, and in that particular case the leak really is small. How much a leak matters depends on how much the leaking step learns about the target. A step that looks at the target and makes choices based on it can leak a great deal, because it can choose coincidences. This slide shows how much.",
      "Here is the experiment. Make a dataset of 50 rows and 1,000 columns, and fill every cell with a random number. Make the target random too. By construction, no column has any real relationship with the target, so the honest answer to 'how well can we predict the target?' is 'not at all'. Now apply a sensible-looking recipe: find the 10 columns most correlated with the target, fit a linear regression on those 10, and estimate its performance with 5-fold cross-validation: split the rows into five groups (folds), fit on four of them, score on the fifth, rotate until each fold has been scored once, and average the five scores. Part 2 of the notebooks walks through this procedure step by step.",
      "The recipe can be run in two orders. In the first, the 10 columns are chosen using all 50 rows, and then cross-validation is run on those 10 columns. In the second, the choosing happens inside each fold: the 10 columns are picked using only that fold's 40 training rows, and then the model is scored on the 10 rows held out. The only difference is whether the validation rows were allowed to take part in choosing the columns.",
      "With 1,000 random columns, some will correlate with the target purely by chance, and in the first order those chance correlations include agreement with the rows that later serve as validation folds. The columns were selected precisely because they happen to line up with those rows, so of course they appear to predict them. In the second order, the columns are chosen for agreeing with the training rows only, and a coincidence among the training rows does not carry over to the held-out rows.",
      "The widget runs both orders on the same data. With 1,000 columns of noise, this dataset reports a cross-validated R² of 0.34 when the columns are selected first, and −0.81 when they are selected inside each fold. Averaged over 20 fresh datasets the two numbers are 0.29 and −0.90. Press 'New random dataset' a few times and then move the slider 'columns of noise to choose from'. With only 10 columns there is nothing to choose, both orders give the same answer, and it is negative. The more columns the selection gets to search through, the more coincidences it can find, and the higher the leaky score climbs.",
      "The honest score is not just zero but well below it. A model with 10 meaningless features fitted to 40 rows predicts new rows worse than simply guessing the mean, the same failure 17_1_6 showed for an overly flexible polynomial. That is the correct answer here, because there is nothing to find. The leaky procedure reports a modestly good model instead, with no error message and nothing in the output to suggest a problem.",
    ],
    keyTakeaways: [
      'A step that chooses something by looking at the target leaks the most, because it can choose coincidences.',
      'Selecting features on all the rows and then cross-validating can report a positive R² on data that is pure noise.',
      'Any step that learns from the data, feature selection included, has to be redone inside each training fold.',
    ],
    note: "Part 2's correlation shortlist is this kind of step. It was computed from the training set only, so Part 2's test score is clean. Its cross-validation scores share a mild form of the optimism shown here, because the shortlist had seen every training fold. With real signal, 2,340 rows and 225 candidates, the effect is far smaller than in this deliberately extreme example.",
    widget: 'selection-leak',
  },
  {
    id: 'p1-3-encoding',
    section: 1,
    sectionTitle: 'Encoding Categories',
    title: 'Category Codes Are Not Quantities',
    subtitle: 'Integer codes, one-hot columns, and the dummy variable trap',
    paragraphs: [
      "A regression multiplies every feature by a coefficient and adds up the results. It cannot multiply anything by 'Gd' or by 'NAmes', so every text column has to become numbers. The question is how to do that without inventing information that was never in the data. The notebook opens with a warning example: `MS SubClass` stores house types as numbers like 20 and 190, and a regression will happily conclude that type 190 is nine and a half times type 20, even though the numbers are just labels.",
      "Some categories do have a natural order. Quality ratings run from Poor to Fair, Typical, Good and Excellent, so mapping them to 1 through 5 (and 'None' for a missing basement to 0) keeps real information: a better kitchen sits higher on the scale. This is ordinal encoding. Neighborhoods have no such order. There is no sense in which CollgCr comes before Edwards, so any numbering we choose is arbitrary.",
      "The widget shows what an arbitrary numbering does. It uses 439 Ames houses from five neighborhoods. With 'Integer codes' selected, the neighborhoods are numbered alphabetically: CollgCr is 1, Edwards 2, NAmes 3, NridgHt 4 and OldTown 5. The regression fits one straight line across the codes, with a slope of −$2,951 per code step and an R² of 0.002. Now press 'By price', which numbers them from cheapest to most expensive. Nothing about the houses has changed, but the slope becomes +$44,006 and R² becomes 0.435. Press 'At random' for other orderings. A model whose answer depends on how we happened to label the categories is treating the labels as quantities.",
      "One-hot encoding gives each neighborhood its own column, which is 1 for houses in that neighborhood and 0 otherwise. Select 'One-hot, drop first'. Each neighborhood now gets its own price level, shown by the orange bars, and R² is 0.579 however the columns are ordered. One neighborhood, CollgCr, gets no column at all. It becomes the baseline, and its mean price of $208,763 is what the intercept describes. Every other coefficient is a premium or discount relative to it: NridgHt's mean is $324,760, so its coefficient is 324,760 − 208,763 = $115,997, and OldTown's is 125,809 − 208,763 = −$82,954.",
      "Why drop a column? Select 'One-hot, keep all' and look at the encoded row. Every house is in exactly one neighborhood, so its five neighborhood columns always add up to 1, which is the same as the intercept's column of 1s. One column is then an exact combination of the others, which is perfect multicollinearity, and there are infinitely many coefficient sets that give identical predictions. An intercept of 0 with each neighborhood's own mean works, and so does an intercept of $100,000 with $100,000 subtracted from every neighborhood. With no way to choose between them, none of the coefficients means anything. This is the dummy variable trap, and `OneHotEncoder(drop='first')` exists to avoid it.",
    ],
    keyTakeaways: [
      'Integer codes for unordered categories invent a ranking and an equal spacing that the data never had.',
      'One-hot encoding gives each category its own column and its own level, so the order of the columns does not matter.',
      "With drop='first', the dropped category becomes the baseline, and each coefficient is a difference from it.",
      'Keeping every dummy column makes them sum to the intercept column, which is perfect multicollinearity.',
    ],
    formula: {
      latex:
        '\\widehat{\\text{price}} = \\beta_0 + \\beta_1\\,\\text{Edwards} + \\beta_2\\,\\text{NAmes} + \\beta_3\\,\\text{NridgHt} + \\beta_4\\,\\text{OldTown}',
      explanation:
        'Five neighborhoods, four 0/1 columns. A CollgCr house has all four set to 0 and is predicted at the intercept.',
      terms: [
        { symbol: '\\beta_0', meaning: 'Mean price in the baseline neighborhood (CollgCr)' },
        { symbol: '\\beta_3', meaning: 'NridgHt premium over CollgCr: +$115,997' },
        { symbol: '\\text{NridgHt}', meaning: '1 if the house is in NridgHt, otherwise 0' },
      ],
    },
    note: 'Ordinal encoding also makes an assumption: that Excellent is as far above Good as Good is above Typical. That is a much milder assumption than inventing an order, and usually a reasonable one, but it is still an assumption.',
    widget: 'encoding',
  },

  // --- PART 2: SELECTION AND MULTICOLLINEARITY (17_2_1_2) ---
  {
    id: 'p2-1-forward',
    section: 2,
    sectionTitle: 'Forward Selection',
    title: 'Forward Selection as an Audition',
    subtitle: 'Which feature adds the most to what the model already knows?',
    paragraphs: [
      "After one-hot encoding, the cleaned Ames data has about 225 features. Some are the backbone of any sensible price model, and some are noise with a column name. The obvious way to find the best set would be to try every possible subset, but with 225 features there are 2²²⁵ subsets, a number with 68 digits. Every feature-selection method is therefore a shortcut through a search space far too large to cover, and the interesting question about each method is what its shortcut costs.",
      "Forward selection works like an audition. The model starts with nothing but an intercept, which means it predicts the average price for every house, the baseline from 17_0. In round one, every candidate auditions alone: fit a one-feature model, score it with cross-validation, and hire the feature with the best score. In round two, the remaining candidates audition again, but now alongside the first hire. The question has changed. It is no longer 'which feature is good?' but 'which feature adds the most on top of what the model already knows?'",
      "The widget runs this on 12 real Ames features, predicting log price and scoring with 5-fold cross-validated R². In round one, each bar is a solo score. Overall Qual leads with 0.674, Total_Square_Footage is close behind at 0.670, Gr Liv Area and Garage Cars both score about 0.50, Garage Area 0.456, and Mo Sold (the month of the sale) scores −0.006, no better than the mean. Press 'Hire the best' and Overall Qual joins the model.",
      "From round two on, each candidate also has a dashed outline showing its solo score from round one, so you can compare what it adds now with what it could do alone. Total_Square_Footage adds 0.127, because size is information that quality does not carry, and it is hired. Now look at Gr Liv Area in round three. On its own it explained half the variation in log price, but now it adds 0.001. Gr Liv Area is the first and second floor, which is already part of Total_Square_Footage, so it brings almost nothing new. The same thing happens to Garage Area once Garage Cars is hired: a solo score of 0.456 shrinks to a gain of zero.",
      "Keep pressing. The gains shrink quickly, from 0.127 in round two to 0.024 in round three and less than 0.02 after that, and by the seventh hire the cross-validated R² is about 0.86 and no remaining candidate adds anything worth a column. That is where a stopping rule would end the search. In scikit-learn you get one by passing `tol` to SequentialFeatureSelector; with the default settings, `n_features_to_select='auto'` simply keeps half of the candidates, which is why the notebook's searches both stop at exactly 20 of 40. Notice what was never hired: several features with strong solo scores, whose information was already present.",
      "Forward selection has one serious limitation. It is greedy: each hire is permanent and never reconsidered in light of later hires, so the search follows one path through the space of subsets and offers no guarantee that the result is the best one. Backward selection runs the audition in reverse, starting with every feature and removing the one whose absence hurts least, round by round. It can keep pairs of features that are only useful together, which forward selection might never assemble, but it is just as greedy. Running both and comparing the answers, as Part 2 does, is a cheap check on whether the selection is stable.",
    ],
    keyTakeaways: [
      'Forward selection adds, one at a time, the feature that most improves the cross-validated score of the model built so far.',
      "A feature's value depends on what is already in the model: a strong solo performer can add almost nothing once a similar feature is in.",
      'Every hire is permanent, so the search follows one greedy path and does not guarantee the best possible subset.',
    ],
    formula: {
      latex:
        '\\underbrace{2^{p}}_{\\text{every subset}} \\quad \\text{vs.} \\quad \\underbrace{p + (p-1) + \\cdots + (p-k+1)}_{\\text{forward selection, } k \\text{ hires}}',
      explanation:
        'The full search grows exponentially with the number of features p; forward selection costs roughly p cross-validated fits per round.',
      terms: [
        { symbol: 'p', meaning: 'Number of candidate features' },
        { symbol: 'k', meaning: 'Number of features hired' },
      ],
    },
    note: "The R² values here are lower than the notebook's 0.93 because the widget uses only 12 features and a third of the houses. The pattern of redundant features collapsing after their twin is hired is the same.",
    widget: 'forward-selection',
  },
  {
    id: 'p2-2-collinearity',
    section: 2,
    sectionTitle: 'Multicollinearity & VIF',
    title: 'When Two Features Carry One Signal',
    subtitle: 'Multicollinearity, seen through the bootstrap',
    paragraphs: [
      "Forward selection avoided redundancy by refusing to hire Gr Liv Area once Total_Square_Footage was in. Part 1 deliberately left both in the dataset, though, and many real models end up with overlapping features. When two predictors carry largely the same information, the model's predictions are usually fine, but its individual coefficients become unreliable. This is called multicollinearity, and it matters whenever we want to read the coefficients rather than just use the predictions.",
      "The reason lies in what a coefficient in multiple regression means: the change in the prediction when one feature increases and the others are held fixed. If two features nearly always rise and fall together, the data contains very few houses in which one changed and the other did not. The data can therefore pin down the combined effect of the two features quite precisely, but it has very little to say about how to divide that effect between them.",
      "The widget makes this visible with the bootstrap from 17_1_2. It generates 100 rows with two features, A and B, whose true coefficients are both exactly 1. It then resamples the rows 300 times, refits the model each time, and plots each refit's pair of coefficients as one grey dot. Use the slider 'correlation between the two features' to control how closely A and B move together.",
      "At a correlation of 0, the dots form a tight, round cloud around the truth at (1, 1); the coefficient on A has a standard deviation of about 0.15 across refits, and no refit gives either feature a negative coefficient. At 0.9, the cloud stretches out along the dashed line where β₁ + β₂ = 2. The standard deviation of A's coefficient more than doubles, to 0.36, and 13% of refits give one of the features a negative coefficient, claiming that a feature which truly raises the target lowers it. At 0.99, two thirds of refits do so. Through all of this, the spread of the sum β₁ + β₂ stays small, at around 0.15 to 0.25. The model always knows the total; it only loses track of the split.",
      "The variance inflation factor (VIF) turns this into a number for each feature. Regress the feature on all the other features and record that regression's R², written R²ⱼ. Then VIF = 1 / (1 − R²ⱼ), the factor by which the variance of that feature's coefficient is inflated compared with a world in which the features were uncorrelated. With only two features, R²ⱼ is just r², so a correlation of 0.9 gives about 1 / (1 − 0.81) ≈ 5.2. The standard deviation grows by the square root of that, about 2.3, and indeed 0.15 × 2.3 ≈ 0.35, close to the 0.36 the bootstrap measured. A VIF below 5 is generally fine, 5 to 10 is high, and above 10 is severe.",
      "There are three standard remedies. Drop one of the overlapping features, as Part 2 does when it removes Log_Gr Liv Area and keeps Total_Square_Footage. Combine them into one feature, as Part 1 did when it added three floor areas into Total_Square_Footage. Or keep both and let a penalty share the credit between them, which is what Ridge regression in the next section does.",
    ],
    keyTakeaways: [
      'When two features are highly correlated, their combined effect is well determined but the split between them is not.',
      'Multicollinearity makes individual coefficients unstable, sometimes flipping their signs, while the predictions stay stable.',
      'VIF = 1 / (1 − R²ⱼ) says how many times the variance of a coefficient is inflated; above 5 is high and above 10 is severe.',
    ],
    formula: {
      latex: '\\text{VIF}_j = \\frac{1}{1 - R_j^2}',
      explanation:
        'R²ⱼ comes from regressing feature j on all the other features. If the others can predict it well, its coefficient is poorly determined.',
      terms: [
        { symbol: 'R_j^2', meaning: 'How well the other features predict feature j' },
        { symbol: '\\text{VIF}_j', meaning: 'Inflation of the variance of βⱼ; 1 means none' },
      ],
    },
    note: 'Multicollinearity is a problem for interpretation, not for prediction. If all you need is accurate prices, two overlapping features do little harm. It becomes a problem the moment someone asks what a particular coefficient means.',
    widget: 'collinearity',
  },

  // --- PART 3: REGULARIZATION (17_2_1_3) ---
  {
    id: 'p3-1-tax',
    section: 3,
    sectionTitle: 'A Budget for Coefficients',
    title: 'Regularization: A Tax on Coefficient Size',
    subtitle: 'Keep every feature, and make large coefficients expensive',
    paragraphs: [
      "Selection is all or nothing: a feature is either fully in the model or fully out. Part 3 makes a different bet. Keep all 225 features, and instead of deciding which ones belong, put a price on how large the coefficients are allowed to grow. That is regularization. The model now has two goals at once, fitting the training data and keeping its coefficients small, and it has to compromise between them. Think of it as a budget that forces the model to spend its coefficient size on the features that earn it.",
      "Why tax size, specifically? Look at what overfitting does to coefficients. With 2,340 training houses and 225 columns, ordinary least squares estimates one coefficient for roughly every ten houses, and it will use every column, noise included, to shave a little off the training error. It often does this with enormous coefficients of opposite sign that nearly cancel at the training points. Such a model swings wildly between the points it was trained on, and a small change in an input produces a large change in the prediction.",
      "The widget uses the sine-plus-noise world from 17_1_6: 30 training points and a degree-12 polynomial, which means twelve features, x through x¹², each standardized. The model is Ridge regression, and the slider 'penalty strength α (log scale)' sets how heavy the tax is. At the far left, α is 10⁻⁸, so there is effectively no tax, and this is ordinary least squares. The training error is a tiny 0.048, but the error on new data from the same world is 0.331, and the sum of squared coefficients is about 135,000. Look at how the orange curve bends to chase individual training points and dives off the chart near the left edge, where there are no points to hold it in place.",
      "Now move the slider to the right. By α ≈ 0.1 the wiggles are gone and the curve sits on the true sine. The training error has risen a little, to 0.065, because the model may no longer chase every point, but the error on new data has fallen to 0.142, less than half of what it was. The sum of squared coefficients is now about 2.6. The bars show every coefficient shrinking, and notice that none of them has been removed: all twelve features are still in the model, just with smaller weights.",
      "Keep going to α = 100 and the tax starts to crush real signal as well as noise. The curve flattens toward a horizontal line at the mean of y, and both errors are high (0.367 on the training points and 0.471 on new data). That is underfitting. So α is a complexity dial, just like the polynomial degree in 17_1_6, with overfitting at one end and underfitting at the other. The difference is that it turns smoothly and never throws a feature away.",
      "Two practical consequences follow from taxing size. First, features must be standardized before the penalty is applied, otherwise the tax depends on units: the same feature measured in acres needs a much larger coefficient than in square feet and would be taxed far more heavily. That is why the StandardScaler sits in the Pipeline. Second, the shrunken coefficients are deliberately biased toward zero, so they can no longer be read as exact dollar effects. We trade some interpretive purity for stability.",
    ],
    keyTakeaways: [
      'Regularization adds a penalty on coefficient size to the least-squares objective, so the model gives up a little training fit in exchange for stability.',
      'With α = 0 the model is ordinary least squares; larger α shrinks the coefficients harder, and very large α flattens the model toward the mean.',
      'Ridge shrinks every coefficient but keeps every feature.',
      'The penalty only makes sense on standardized features, which is why the StandardScaler sits in the Pipeline.',
    ],
    formula: {
      latex: '\\min_{\\beta}\\; \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2 \\;+\\; \\alpha \\sum_{j=1}^{p} \\beta_j^2',
      explanation:
        'Ridge regression: the usual residual sum of squares plus a tax on the squared coefficients. The intercept is not taxed.',
      terms: [
        { symbol: '\\alpha', meaning: 'Penalty strength; 0 gives ordinary least squares' },
        { symbol: '\\beta_j', meaning: 'Coefficient on standardized feature j' },
      ],
    },
    note: "Textbooks usually call the penalty strength λ (lambda); scikit-learn calls it alpha. Ridge is also known as L2 regularization, after the L2 norm, which is computed from a sum of squares.",
    widget: 'coefficient-tax',
  },
  {
    id: 'p3-2-why-zero',
    section: 3,
    sectionTitle: 'Why Lasso Selects',
    title: 'Why Lasso Lands on Exactly Zero',
    subtitle: 'The same budget with a different tax, and very different behaviour',
    paragraphs: [
      "Lasso makes one change to Ridge: it taxes the absolute values of the coefficients instead of their squares. On paper the change looks minor, but it produces a large difference in behaviour. Ridge shrinks coefficients toward zero and never quite reaches it, so 225 features in means 225 features out. Lasso sets some coefficients to exactly 0.0, and a feature with a zero coefficient has left the model. Lasso shrinks and selects at the same time. This slide explains why one small change in the tax has that effect.",
      "Strip the problem down to a single coefficient. Suppose that without any penalty the best value for it would be b̂; that is the value ordinary least squares would choose. With a penalty, the model chooses b to minimize a total cost made of two parts. The first is the misfit, (b − b̂)², which grows as b moves away from b̂. The second is the tax, α times either b² for Ridge or |b| for Lasso. For this toy problem both answers have simple formulas: Ridge chooses b̂ / (1 + α), and Lasso chooses b̂ − α/2, stopping at zero.",
      "Work through an example with b̂ = 1. At α = 1, Ridge gives 1 / 2 = 0.5 and Lasso gives 1 − 0.5 = 0.5, the same answer. At α = 2, Ridge gives 1 / 3 ≈ 0.333, while Lasso gives 1 − 1 = 0, so the feature is dropped. At α = 4, Ridge gives 0.2 and Lasso is still at zero. The top chart in the widget draws these two paths for every α. Ridge's path is a curve that flattens out as it approaches zero without ever touching it. Lasso's is a straight line that hits zero at α = 2b̂ and stays there.",
      "The reason lies in what the last bit of a coefficient costs. Under the squared tax, the cost of a small coefficient is tiny: a coefficient of 0.01 costs α × 0.0001. So when a coefficient is already small, shrinking it the rest of the way to zero saves almost nothing, and Ridge never bothers. Under the absolute tax, every unit of coefficient costs the same α, right down to the last one. If the feature's benefit to the fit is worth less than that rate, the cheapest choice is to drop the feature entirely.",
      "The bottom chart shows this as a picture. It draws the total cost for every possible b at the current α. Ridge's curve is a smooth bowl, and its lowest point slides toward zero but never arrives. Lasso's curve has a sharp corner at b = 0, which comes from the corner in |b|. Move the slider 'penalty strength α' past 2 and watch Lasso's minimum jump into that corner. Then lower the slider 'unpenalized coefficient b̂' to make the feature weaker: Lasso now drops it at a smaller α. Weak features are removed first.",
      "That is the whole mechanism behind Lasso's automatic feature selection. As α increases, features leave the model one at a time, weakest first. It also explains Lasso's main weakness. When two features carry the same signal, each one is individually worth little given the other, so Lasso tends to keep one and zero the other, and which one survives can depend on small quirks of the sample.",
    ],
    keyTakeaways: [
      'The squared penalty is nearly free near zero, so Ridge shrinks coefficients without ever removing one.',
      'The absolute penalty charges the same rate all the way down to zero, so a feature worth less than that rate is dropped exactly.',
      'Weaker features reach zero at smaller α, so raising α removes features from the weakest to the strongest.',
    ],
    formula: {
      latex:
        'b_{\\text{Ridge}} = \\frac{\\hat{b}}{1 + \\alpha}, \\qquad b_{\\text{Lasso}} = \\operatorname{sign}(\\hat{b}) \\cdot \\max\\!\\left(|\\hat{b}| - \\tfrac{\\alpha}{2},\\; 0\\right)',
      explanation:
        'The two solutions to the one-coefficient problem. Ridge divides; Lasso subtracts and stops at zero.',
      terms: [
        { symbol: '\\hat{b}', meaning: 'The coefficient least squares would choose with no penalty' },
        { symbol: '\\alpha', meaning: 'Penalty strength' },
      ],
    },
    note: "This is a one-coefficient toy, with the penalty scaled to keep the arithmetic clean. With many features, scikit-learn's Lasso solver applies exactly this subtract-and-stop-at-zero rule to one coefficient at a time, cycling through them until nothing changes.",
    widget: 'penalty-shape',
  },
  {
    id: 'p3-3-ames',
    section: 3,
    sectionTitle: 'Ridge, Lasso & Elastic Net',
    title: 'Ridge, Lasso and the Dial Between Them',
    subtitle: 'Elastic Net on real Ames features',
    paragraphs: [
      "Elastic Net applies both taxes at once. Its `l1_ratio` setting decides the mix: 0 means pure squared tax (Ridge-style shrinkage), 1 means pure absolute tax (Lasso), and values in between blend the two. That makes it convenient for comparing all three on one screen: the slider 'l1_ratio (0 = Ridge, 1 = Lasso)' slides between the penalties, and the slider 'α (log scale)' sets their overall strength.",
      "The widget fits Elastic Net to the 12 real Ames features from the forward-selection slide, standardized, predicting log price. The top chart shows the coefficient paths: each line is one feature's coefficient, traced across every α from 0.0001 to about 30, with the current α marked in red. The bars below show the model at the current α. Two pairs of twin features are coloured so you can follow them: Garage Cars and Garage Area in orange, and Total_Square_Footage and Gr Liv Area in black, with the dashed line for the second member of each pair.",
      "Start with Lasso, l1_ratio = 1. At α = 0.01, Lasso keeps 9 of the 12 features, having dropped TotRms AbvGrd, Full Bath and Mo Sold. Raise α to 0.1 and only 5 remain. Look at what happened to the twins: Garage Area and Gr Liv Area have been dropped, while Garage Cars and Total_Square_Footage have grown (Total_Square_Footage's coefficient rises from 0.099 to 0.128). Lasso kept one member of each pair and handed it the other's share of the credit.",
      "Now slide l1_ratio to 0 and raise α again. Every bar shrinks, smoothly and together, and none reaches zero. Watch the garage pair in particular. With almost no penalty, least squares gives Garage Cars a coefficient of 0.036 and Garage Area only 0.010, an uneven split of their shared signal. At α = 1, Ridge-style shrinkage gives them 0.037 and 0.035: nearly equal shares. This is how Ridge handles multicollinearity. Instead of deleting a twin, it spreads the credit across the pair, which keeps both coefficients stable.",
      "The chips report cross-validated error in dollars, computed the way the notebook's `run_evaluation_pipeline` does it: the scaler is refitted inside each fold, and log-price predictions are turned back into dollars with exp() before the error is measured. Plain least squares misses by $17,459 on average. A light penalty matches it, and a heavy one does worse. No setting here beats least squares, and that is expected: 12 features with about 780 training rows per fold leave very little overfitting to cure. Regularization pays off when there are many features for each row, as with the notebook's 225 features, where Ridge beat least squares by about $107 per house even with a guessed α.",
      "Which penalty should you choose? It depends on what you need. Lasso gives the smallest model, which matters when every feature costs money or time to collect. Ridge guarantees that every feature stays, which matters when the signal is spread across many small effects or a regulator requires certain variables. Elastic Net can keep correlated groups together while still deleting pure noise, at the price of a second hyperparameter to tune.",
    ],
    keyTakeaways: [
      'As α grows, Lasso removes features one at a time, while Ridge shrinks them all together and removes none.',
      'Faced with twin features, Ridge splits the credit between them and Lasso keeps one and drops the other.',
      "Elastic Net's l1_ratio slides between the two penalties, at the cost of a second hyperparameter to tune.",
      'Regularization helps most when there are many features per row; with few features and many rows there is little for it to fix.',
    ],
    formula: {
      latex:
        '\\min_{\\beta}\\; \\frac{1}{2n}\\sum_{i}(y_i - \\hat{y}_i)^2 + \\alpha\\, r \\sum_j |\\beta_j| + \\frac{\\alpha (1 - r)}{2} \\sum_j \\beta_j^2',
      explanation:
        "scikit-learn's ElasticNet objective. r = 1 is Lasso; r = 0 is a Ridge-style penalty.",
      terms: [
        { symbol: 'r', meaning: 'l1_ratio, the share of the absolute-value penalty' },
        { symbol: '\\alpha', meaning: 'Overall penalty strength' },
      ],
    },
    note: "scikit-learn's Ridge and ElasticNet put alpha on different scales: ElasticNet divides the squared error by 2n and Ridge does not. Ridge(alpha=100) on 2,340 rows corresponds to an ElasticNet alpha of about 100 / 2,340 ≈ 0.04 with l1_ratio = 0. Compare alpha values only within one class.",
    widget: 'regularization-path',
  },

  // --- PART 4: TUNING (17_2_1_4) ---
  {
    id: 'p4-1-grid',
    section: 4,
    sectionTitle: 'Grid Search',
    title: 'Letting Cross-Validation Choose α',
    subtitle: 'Parameters, hyperparameters and the validation curve',
    paragraphs: [
      "Every α so far was chosen by hand, and Part 3's leaderboard showed how much that matters: Lasso came last with a guessed α and, as Part 4 found, first once its α was tuned. It helps to separate two kinds of setting. Parameters are what the model learns from the data during fitting; in regression they are the coefficients. Hyperparameters are settings that must be fixed before fitting starts, such as α, l1_ratio or a tree's maximum depth.",
      "Why can't the model learn α the same way it learns its coefficients? Because the whole purpose of α is to make the fit to the training data worse, deliberately, in exchange for better performance on new data. Ask the training data which α it prefers and it will always answer 'none'. You can see this in the widget: the grey curve is the training error at each α, and it keeps falling as α shrinks, from 0.084 at α = 1 down to 0.048 at α = 10⁻⁸. The training data cannot tell overfitting from a good fit, so the right α can only be judged on data the model did not train on.",
      "Grid search does that judging systematically. Make a list of candidate values, the grid. For each candidate, run 5-fold cross-validation and record the average validation error. Keep the candidate with the lowest. The widget's grid has 21 values from 10⁻⁸ to 100, one every half power of ten, which is what `np.logspace(-8, 2, 21)` produces. Penalties are searched on a log scale because what matters is the order of magnitude: the difference between 1 and 10 matters about as much as the difference between 100 and 1,000. Twenty-one candidates times five folds is 105 model fits.",
      "This is the same world and the same degree-12 model as on the first regularization slide. Use the slider 'step along the grid' to move through the candidates. The orange curve is the 5-fold validation error, the grey dots are the five individual folds at the current α, and the lower chart shows the fitted curve at that α. On the left the validation error is huge, about 3.5 at α = 10⁻⁸, because a nearly unpenalized polynomial fails badly on whichever points it did not see. It falls to its lowest value, 0.155, at α = 1, and rises again on the right as the penalty starts to flatten the real signal. That U shape is the bias–variance tradeoff from 17_1_6, with α in place of polynomial degree.",
      "In code, `GridSearchCV` does all of this for you, and with `refit=True` it then refits the winning α on the whole training set, so the object it returns is ready to predict. Because the model sits inside a Pipeline, the parameter is addressed as step name, two underscores, parameter name: `regressor__alpha`. The scaler in that Pipeline is refitted inside every fold, so the search itself never leaks.",
      "Notice that cross-validation picked α = 1, while on the first regularization slide the error on new data was lowest closer to α = 0.1. Cross-validation estimates the best α from 30 points; it is not an oracle. Near the bottom of the curve the differences are small, so a slightly off choice costs little. Part 4's notebook found the same thing on Ames: tuning moved Ridge only slightly, because its curve is flat near the optimum, while it transformed Lasso.",
    ],
    keyTakeaways: [
      'Hyperparameters are fixed before training, and the training data alone will always prefer no penalty at all.',
      'Grid search scores every candidate on the grid with cross-validation and keeps the one with the lowest validation error.',
      'Penalty grids are spaced by powers of ten, because what matters is the order of magnitude.',
      "An untuned model's place on a leaderboard says little about what the algorithm can do once it is tuned.",
    ],
    formula: {
      latex: '\\hat{\\alpha} = \\arg\\min_{\\alpha \\in \\text{grid}} \\; \\frac{1}{K} \\sum_{k=1}^{K} \\text{MSE}_k(\\alpha)',
      explanation:
        'Grid search: the α whose average validation error across the K folds is smallest.',
      terms: [
        { symbol: '\\text{MSE}_k(\\alpha)', meaning: 'Error on fold k of a model fitted on the other folds with penalty α' },
        { symbol: 'K', meaning: 'Number of folds (5 here)' },
      ],
    },
    note: 'At small α the five fold scores differ by orders of magnitude. An unpenalized polynomial is most unstable near the ends of the data, so whichever fold holds out an end point pays heavily for it. That is one more reason to look at the spread of fold scores and not only their average.',
    widget: 'grid-search',
  },

  // --- PART 5: HONEST EVALUATION (17_2_1_5) ---
  {
    id: 'p5-1-winners-curse',
    section: 5,
    sectionTitle: 'Optimistic Bias',
    title: 'Picking the Winner on the Test Set',
    subtitle: "Why the best of several test scores is too good to be true",
    paragraphs: [
      "Part 4 ended by tuning Ridge, Lasso and Elastic Net, scoring all three on the test set, and reporting the winner's test error. Each step looked honest. The test set was never used to fit coefficients or to choose α. It was, however, used to choose between the models, and that is enough to make the reported number optimistic. This slide shows why with a simple simulation.",
      "Start from a fact we met in 17_1_6: every test score contains luck. A different random set of 585 test houses would have produced a somewhat different error, even for exactly the same model. Suppose that luck is worth about ±$400 of mean absolute error. Now imagine several models that are all truly equally good, each with a real error of $13,000. Score each one on the same test set and pick the lowest. Since the models are identical in quality, the only thing that differs between their scores is luck, so picking the lowest score means picking the luckiest draw.",
      "The widget runs this experiment. The slider 'models compared on the same test set' sets how many models are compared. The strip at the top shows one study: each grey dot is one model's measured test error, the green dashed line is the true $13,000, and the orange dot is the winner. Press 'Run another study' a few times. With one model there is no choice to make, and the reported error lands above the truth as often as below it.",
      "The histogram repeats the study 2,000 times and records the winner's reported error each time. With one model, the average reported error is the truth. With three models, roughly Part 4's situation, the average winner reports about $326 less error than it really has. With ten, about $621. With a hundred, which is what you would get by comparing a hundred values of α directly on the test set, the optimism is about $1,006. Nothing was fitted to the test set in any of these cases. The bias comes entirely from choosing.",
      "This is sometimes called the winner's curse, and the general principle is worth stating plainly. The moment a test set is used to make a decision, it has become a validation set, and its score is no longer an unbiased estimate of performance on new data. The more decisions it informs, the more optimistic it becomes. The remedy is to keep the data used for deciding separate from the data used for the final evaluation, and that is exactly what nested cross-validation, on the next slide, does.",
    ],
    keyTakeaways: [
      'Every test score contains some luck, so the best of several test scores is biased toward good luck.',
      "The more candidates are compared on the same test set, the more optimistic the winner's score becomes.",
      'Using the test set to choose between models turns it into a validation set, and its score is no longer unbiased.',
    ],
    formula: {
      latex: '\\mathbb{E}\\Big[\\min_{k}\\, \\widehat{\\text{MAE}}_k\\Big] \\;<\\; \\text{MAE}_{\\text{true}}',
      explanation:
        'Each measured error is unbiased on its own. The minimum of several is not: on average it sits below the truth.',
      terms: [
        { symbol: '\\widehat{\\text{MAE}}_k', meaning: "Model k's error measured on the shared test set" },
        { symbol: '\\text{MAE}_{\\text{true}}', meaning: 'The error each model really has on new data' },
      ],
    },
    note: 'The simulation makes every model equally good so that luck is the only difference between them. With real models of different quality, the winner is usually a genuinely good model, but its reported score still carries some luck on top of its real quality.',
    widget: 'winners-curse',
  },
  {
    id: 'p5-2-nested',
    section: 5,
    sectionTitle: 'Nested Cross-Validation',
    title: 'Nested Cross-Validation, Step by Step',
    subtitle: 'A wall between tuning and evaluating',
    paragraphs: [
      "Nested cross-validation separates choosing from evaluating by running two loops, one inside the other. The outer loop is ordinary 5-fold cross-validation, and its job is evaluation. The inner loop is a complete grid search, with its own 5-fold cross-validation, run separately inside each outer training portion. Its job is tuning. The outer test fold of each round is locked away while the inner loop works, and opened only once, to score whatever the inner loop chose.",
      "Trace the first outer fold in the widget. The dataset has 40 points, from the same sine-plus-noise world as before. The outer split holds out 8 of them (the orange cells in the row for fold 1) and leaves 32. The inner loop sees only those 32 points: it runs the 21-value grid with 5 inner folds, which is 105 fits, and draws the validation curve shown below. Its lowest point is at α = 1. A model with α = 1 is then refitted on all 32 points, and only now are the 8 held-out points used, once, to score it. The outer score for fold 1 is an MSE of 0.126.",
      "Press 'Next outer fold', or click a row, to repeat this for the other folds. Each one holds out a different 8 points and runs its own inner search. The chosen α values are 1, 0.1, 1, 0.32 and 3, and the outer scores are 0.126, 0.113, 0.169, 0.066 and 0.176. Their average, 0.130, is the nested cross-validation estimate. In all, the procedure fitted 5 × 105 = 525 models plus the five refits. On the full Ames data with 100 alphas, Part 5 of the notebook fits 2,500.",
      "Two things are worth noticing as you step through. First, the orange cells of each row never take part in that row's inner loop, so no outer score was influenced by its own test points, either through the coefficients or through the choice of α. Second, α changes from fold to fold, because each inner loop sees a slightly different set of points. That is expected. Here the chosen values stay within about one and a half powers of ten of each other, much as the notebook's Ames alphas ranged from about 57 to 152. Values jumping from 10⁻⁸ to 100 would be a warning that the tuning is unstable.",
      "Because the folds can choose different hyperparameters, nested cross-validation does not produce one model. Its product is a number: an honest estimate of how well the whole procedure (scaling, tuning and fitting together) performs on data it has never seen. To build the model you actually deploy, you step outside the nested loops, run one final grid search on all the data, let `refit=True` train the winner on everything, and report the nested score as its expected error. In scikit-learn the nested loops themselves take one line, `cross_val_score(GridSearchCV(...), X, y, cv=5)`, because a GridSearchCV object can be cross-validated like any other model.",
    ],
    keyTakeaways: [
      'The inner loop chooses hyperparameters using only the outer training rows; the outer fold is opened once, to score that choice.',
      'The nested score estimates how the whole procedure, tuning included, performs on new data.',
      'Different outer folds may choose different hyperparameters, which is why nested cross-validation produces an estimate rather than a model.',
      'The deployed model comes from one final grid search on all the data, and the nested score is the error you report for it.',
    ],
    formula: {
      latex: '\\text{fits} = K_{\\text{outer}} \\times K_{\\text{inner}} \\times |\\text{grid}| = 5 \\times 5 \\times 21 = 525',
      explanation: 'The cost of honesty: every outer fold runs a complete grid search of its own.',
      terms: [
        { symbol: 'K_{\\text{outer}}', meaning: 'Outer folds, used for evaluation' },
        { symbol: 'K_{\\text{inner}}', meaning: 'Inner folds, used for tuning' },
      ],
    },
    note: "A single split can mislead in either direction. In 17_2_2, XGBoost with fixed settings scores R² = 0.942 on the notebook's one train/test split but 0.918 under nested cross-validation. Its settings were never tuned on that split, so the gap is not tuning inflation: the split is simply an easy one, and the same untuned model averages about 0.91 across five folds.",
    widget: 'nested-cv',
  },

  // --- PART 6: TREES (17_2_2) ---
  {
    id: 'p6-1-split',
    section: 6,
    sectionTitle: 'How a Tree Splits',
    title: 'A Tree Asks One Question at a Time',
    subtitle: 'How a regression tree chooses where to split',
    paragraphs: [
      "Every model so far has been linear: an intercept plus coefficients times features. When the relationship curved, we had to transform variables by hand until it straightened out. Tree-based models take a completely different approach. Instead of fitting one equation, a tree divides the houses into groups using a sequence of yes/no questions, and predicts the average price of the training houses in whatever group a new house lands in. It is a game of 20 Questions played with data.",
      "Start with a single question: 'Is Gr Liv Area at most t square feet?' Houses that answer yes go to the left group and the rest go to the right. Each group, called a leaf, predicts its own mean price. The error that remains is the sum of squared deviations from the mean within each group, added together. That is the TSS from 17_0, computed separately for each group. The best question is the one whose threshold t makes that total as small as possible.",
      "Here is the calculation for the 975 Ames houses in the widget, with prices in thousands of dollars. With no question at all, every house is predicted at the overall mean of $181.2k, and the total squared error is the TSS, 6.23 million. The best single question splits at 1,611.5 square feet. The 636 smaller houses average $146.9k and the 339 larger ones average $245.7k, and the remaining error drops to 4.07 million. One question has removed 1 − 4.07 / 6.23 = 0.347 of the TSS, an R² of 0.347.",
      "Move the slider 'threshold' and watch three things together: the dashed red line where the question splits the houses, the two orange segments showing what each leaf predicts, and the curve in the lower chart, which is the total error for every possible threshold. The dashed horizontal line in that chart is the no-question error. Press 'Jump to the best split' to land on the lowest point of the curve. That search is the whole algorithm: try every threshold (the midpoints between neighbouring values), and keep the best. With many features, it does this for every feature and keeps the best feature-and-threshold pair.",
      "Then it repeats the process inside each group. The left group gets its own best question, possibly about a different feature, and so does the right, and so on down. The first question is the root node, each later question is a decision node, and the groups at the bottom are the leaves. The number of questions along the longest path from root to leaf is the tree's depth.",
      "Notice what this approach does not need. A threshold does not care about units, so trees need no scaling. A sequence of thresholds can follow a curve, a plateau or a sudden jump, so no transformations are needed to straighten anything. And a tree can split on category codes directly. That is why the trees notebook can skip most of Parts 1 and 2: its gradient-boosting model, trained on the nearly raw Ames file, reaches a test R² of 0.945.",
    ],
    keyTakeaways: [
      'A regression tree splits the data with yes/no questions and predicts the mean of the training houses in each leaf.',
      'Each split is chosen to make the total within-group squared error as small as possible, which is TSS computed per group.',
      'Thresholds do not care about units, so trees need no scaling and can follow curves without transformations.',
    ],
    formula: {
      latex: '\\text{SSE}(t) = \\sum_{x_i \\le t} (y_i - \\bar{y}_L)^2 + \\sum_{x_i > t} (y_i - \\bar{y}_R)^2',
      explanation: 'The error left after splitting at threshold t. The tree chooses the t that makes it smallest.',
      terms: [
        { symbol: '\\bar{y}_L, \\bar{y}_R', meaning: 'Mean price in the left and right leaf' },
        { symbol: 't', meaning: 'The threshold in the question “Is x ≤ t?”' },
      ],
    },
    note: "scikit-learn describes this criterion as minimizing the variance within each child node ('squared_error'). Variance times group size is the within-group sum of squares, so it is the same choice.",
    widget: 'tree-split',
  },
  {
    id: 'p6-2-depth',
    section: 6,
    sectionTitle: 'Tree Depth',
    title: "Depth Is the Tree's Complexity Dial",
    subtitle: 'Too few questions underfit; too many memorize',
    paragraphs: [
      "After the first split, the tree splits each group again with that group's own best question, and keeps going. The `max_depth` setting limits how many questions any path from the root may ask. Because every leaf can split in two, the number of leaves can double with each extra level: at most 2 at depth 1, 4 at depth 2, 8 at depth 3, and 2ᵈ at depth d. More leaves means a finer staircase, and a finer staircase can fit the training data more closely.",
      "The widget splits the 975 houses into 683 for training and 292 for testing, grows a tree on the training houses, and draws its predictions as a black staircase. Use the slider 'max_depth'. At depth 1 there are 2 leaves; training R² is 0.358 and test R² is 0.322. At depth 3 there are 8 leaves and the scores are 0.543 and 0.494. At depth 5 there are 31 leaves; training R² is 0.625, and test R² reaches 0.522, the best this tree achieves.",
      "Keep going and the familiar pattern appears. At depth 8 the tree has 145 leaves and a training R² of 0.791, but its test R² has fallen to 0.328. At depth 16 there are 448 leaves for 683 training houses, and the smallest leaf holds a single house. A leaf with one house simply predicts that house's price, which is memorization rather than learning. The training R² is 0.918 and the test R² is 0.311. The 'smallest leaf' chip turns red once leaves fall below five houses, echoing the notebook's warning that predictions from tiny leaves are unreliable.",
      "The lower chart traces both scores across every depth. Training R² rises steadily toward 1. Test R² climbs, peaks at depth 5, and then falls. You have seen this exact shape twice already in this unit and once in 17_1_6: for polynomial degree, for α, and now for depth. The trees notebook finds the same thing on the full Ames data, where depth 5 is best with a test R² of 0.822 and an unlimited tree scores 0.9999 on training data and 0.794 on test data.",
      "Trees have one more property worth knowing about. Within one branch a tree can split on a feature, then on a second, and then on the first again at a different threshold. A feature's effect can therefore depend on which path a house took to get there. This is how trees capture interactions, the idea that one feature's effect depends on another, without being told to. Unit 17_3 shows what it takes to build the same thing by hand in a linear model.",
    ],
    keyTakeaways: [
      'max_depth limits how many questions a tree may ask, and the number of leaves can double with each extra level.',
      'Training R² rises with depth toward 1, while test R² peaks and then falls, the same bias–variance pattern as polynomial degree and α.',
      'Leaves that hold only a handful of houses are a sign that the tree is memorizing rather than learning.',
    ],
    formula: {
      latex: '\\text{leaves} \\le 2^{\\,\\text{depth}}',
      explanation: 'Each level can split every leaf in two, so the capacity to memorize grows very fast with depth.',
      terms: [{ symbol: '\\text{depth}', meaning: 'The longest chain of questions from root to leaf' }],
    },
    note: 'With only one feature the tree can cut in only one direction, so its scores are lower than in the notebook, where every house has dozens of features. The shape of the depth curve is the same.',
    widget: 'tree-depth',
  },
  {
    id: 'p6-3-forest',
    section: 6,
    sectionTitle: 'Random Forests',
    title: 'Random Forests: Averaging Away the Variance',
    subtitle: 'Many different trees, each wrong in its own way',
    paragraphs: [
      "A deep tree's weakness is variance. Change a handful of training houses and its structure can change completely, and every one of its hundreds of leaves is fitted to a few particular houses. A random forest's response is to grow many deep trees instead of one careful tree, and average their predictions. It is the wisdom of the crowd: ask one person to guess a house's price and they may be far off; average a hundred guesses and the individual errors tend to cancel.",
      "That only works if the trees make different mistakes. Identical trees averaged together are just the same tree. A random forest makes its trees different in two ways. First, each tree is grown on a bootstrap resample of the training houses, drawn with replacement, exactly as in 17_1_2; some houses appear two or three times, and about a third are left out. Second, at every split each tree may consider only a random subset of the features (`max_features='sqrt'`), so a dominant feature such as Overall Qual cannot be the first question in every tree. The widget uses only one feature, so it shows only the first kind of randomness, which on its own is called bagging.",
      "In the widget, each blue staircase is one fully grown tree (max_depth 16, which is effectively unlimited here), and the orange line is the forest's average. Use the slider 'trees in the forest'. A single bootstrap tree scores a test R² of 0.216. Five trees score 0.358, twenty-five score 0.402, and a hundred score 0.427. For comparison, one fully grown tree trained on all the training houses scores 0.311. The individual staircases jump around, but their average is far steadier than any one of them.",
      "Now use the slider 'max_depth of each tree' and look at the lower chart, which compares one tree with a forest of 20 at every depth. For shallow trees the two lines nearly coincide; at depth 5, one tree scores 0.522 and the forest 0.516. A shallow tree makes much the same mistakes on every resample, so there is little variation for averaging to cancel. For deep trees the difference is large: at depth 16, one tree scores 0.311 and the forest 0.438. The forest flattens the cliff. This is why random forests usually grow their trees without a depth limit, as the notebook's grid search chose.",
      "Averaging has a limit, though. It cancels errors that differ from tree to tree, which reduces variance, but it cannot remove errors that every tree shares. With a single feature, the forest levels off near what the best pruned tree already achieves. With dozens of features the extra randomness from `max_features` makes the trees far more diverse, and on the full Ames data the tuned forest reaches 0.880 against 0.822 for the best single tree. Because each tree is built independently, they can also all be trained at the same time on different processor cores.",
    ],
    keyTakeaways: [
      'A random forest averages many deep trees, each grown on a bootstrap resample and, with many features, a random subset of features at each split.',
      'Averaging cancels the errors that differ from tree to tree, so it reduces variance; it cannot remove errors that all the trees share.',
      'Because averaging controls overfitting, the trees in a forest are usually grown deep.',
    ],
    formula: {
      latex: '\\hat{f}_{\\text{forest}}(x) = \\frac{1}{B} \\sum_{b=1}^{B} \\hat{f}_b(x)',
      explanation: 'The forest predicts the average of its B trees, each fitted to its own bootstrap resample.',
      terms: [
        { symbol: 'B', meaning: 'Number of trees (n_estimators)' },
        { symbol: '\\hat{f}_b', meaning: 'Tree b, grown on bootstrap resample b' },
      ],
    },
    note: "Each bootstrap resample contains about 63% of the distinct training houses, since the chance a given house is never drawn is about 1/e ≈ 0.37. The houses a tree never saw (its 'out-of-bag' houses) give a free validation set for that tree, which 18_6 puts to use.",
    widget: 'forest',
  },
  {
    id: 'p6-4-boosting',
    section: 6,
    sectionTitle: 'Gradient Boosting',
    title: 'Gradient Boosting: Fixing Errors in Sequence',
    subtitle: 'Each new tree is fitted to what the model still gets wrong',
    paragraphs: [
      "A random forest builds its trees independently and averages them. Gradient boosting builds them one after another, and each new tree has a narrower job: it is fitted not to the prices, but to the errors the model is still making. The notebook compares it to an assembly line, in which the first worker cuts out the rough shape and every later worker sands down the rough edges left by the one before.",
      "The procedure has four steps. Start by predicting the mean price for every house. Compute each house's residual, its actual price minus the current prediction. Fit a small tree to those residuals. Then add a fraction of that tree's predictions to the model, where the fraction is called the learning rate. Now compute the new, smaller residuals and repeat. After a few hundred rounds the model is the starting mean plus the sum of many small corrections.",
      "The widget does this with the smallest possible trees, stumps that ask a single question each. With 'trees added so far' at 0, the model is a flat line at the training mean of $179.6k, and the lower panel shows the residuals, which are just each house's distance from that mean. The black step is the next tree. Its question splits at 1,611 square feet, almost exactly the threshold the split slide found, because fitting residuals from the mean is the same problem as fitting the prices themselves. With the learning rate at 0.1, adding that tree moves the model a tenth of the way toward the step, and test R² goes from 0 to 0.060.",
      "Drag the slider forward and watch both panels. After 5 trees the test R² is 0.219, after 20 it is 0.426, after 50 it is 0.508, and after 200 it is 0.522. Each stump on its own is a very weak model, but each one is aimed at whatever the previous ones got wrong, so together they build a detailed staircase. The residuals in the lower panel flatten toward zero as the rounds go by. Boosting attacks bias, the systematic errors of a model that is too simple, which is the opposite target from a forest, whose averaging attacks variance.",
      "The learning rate controls the size of each step. Choose 'learning rate 1.0' and the model adds each tree in full: one tree already gives a test R² of 0.322, the score peaks at 0.533 after about 20 trees, and then it slowly drifts down to 0.517 by 200 as the later trees chase noise. At 0.1 the climb is slower but steadier. Smaller steps with more trees usually generalize better, and both the learning rate and the number of trees are hyperparameters, tuned with cross-validation like any other.",
      "On the full Ames data, boosting is the strongest model in the unit: HistGradientBoosting reaches a test R² of 0.945 on nearly raw data, and XGBoost, which adds L1 and L2 penalties on its leaf values (regularization again), scores 0.918 under nested cross-validation. The price is interpretability. Hundreds of trees cannot be read like a list of coefficients. Their feature importances say which features the model relied on, but not whether a feature raises or lowers the price, and correlated features split or steal each other's credit, the same problem VIF diagnosed for linear models.",
    ],
    keyTakeaways: [
      'Gradient boosting starts from the mean and adds small trees one at a time, each fitted to the current residuals.',
      'Boosting reduces bias by correcting errors step by step, while a random forest reduces variance by averaging.',
      "The learning rate scales each tree's contribution; smaller steps need more trees and are usually steadier.",
      'Feature importance from a tree ensemble shows which features the model relied on, not the direction of their effect.',
    ],
    formula: {
      latex: 'F_m(x) = F_{m-1}(x) + \\eta \\, h_m(x), \\qquad h_m \\text{ fitted to } y - F_{m-1}(x)',
      explanation: 'Each round adds a shrunken copy of a tree that was fitted to the residuals of the model so far.',
      terms: [
        { symbol: 'F_m', meaning: 'The model after m trees; F₀ is the mean' },
        { symbol: 'h_m', meaning: 'Tree m, fitted to the current residuals' },
        { symbol: '\\eta', meaning: 'Learning rate' },
      ],
    },
    note: "Real boosting libraries usually grow trees deeper than a stump, with a depth of 3 to 6 in typical settings, so each round can capture an interaction between features. Stumps keep the widget readable; the logic is the same.",
    widget: 'boosting',
  },
];
