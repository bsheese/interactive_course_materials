import type { Slide } from '@kit/types';

export const slides: Slide[] = [
  // --- SECTION 1: WHAT IS MESSY ---
  {
    id: 'messy',
    section: 1,
    sectionTitle: 'What Is Messy',
    title: 'Five Ways Data Goes Wrong',
    subtitle: 'A map of the problems before any of the tools',
    paragraphs: [
      "Calling `.head()` on a new dataset shows values, and the values usually look fine. The trouble is in what `.head()` does not show: the dtype of each column, the cells that are blank, and the spellings that look the same to you but not to pandas. A column can print neatly and still give wrong answers when you sort it, average it or group by it.",
      'This module sorts those problems into five kinds: wrong types, missing values, inconsistent formatting, structural problems and date encoding. Each kind has its own tools, and each later slide takes one of them. The table here is six Titanic passengers that have all five problems at once, so you can see where each one lives.',
      'Press each category button in turn. Under "Wrong types", pclass is highlighted because 1, 2 and 3 are class labels that happen to be stored as numbers, so `df["pclass"].mean()` would return a meaningless 2.17. Under "Inconsistent format", notice that "Female", "female" and " female" would be counted as three groups by `value_counts()`.',
    ],
    keyTakeaways: [
      'Dirty data is data that prints plausibly and computes wrongly.',
      'Wrong types, missing values, inconsistent formatting, structural problems and date encoding are the five categories this module covers.',
      '`df.info()` is the first call on any new dataset because it shows dtypes and non-null counts that `.head()` hides.',
    ],
    widget: 'messy',
  },

  // --- SECTION 2: MISSING DATA ---
  {
    id: 'missing-drop',
    section: 2,
    sectionTitle: 'Missing Data',
    title: 'Dropping Rows Without Losing Too Many',
    subtitle: 'dropna has more than one setting',
    paragraphs: [
      'A missing value is stored as `NaN`, and the simplest response is to remove the rows that have one. `df.dropna()` with no arguments removes a row if any of its cells is missing. In the table here that keeps only 3 of the 7 rows, because the `deck` column is blank for so many passengers that almost every row has at least one gap.',
      'The other settings loosen that rule. `how="all"` drops a row only when every cell is missing, which removes just the fully empty row and keeps 6. `thresh=3` keeps a row that has at least three real values, so a row with four cells and one gap survives, and 4 of the 7 rows are kept. `subset=["age"]` looks at one column only, which is the right choice when age is the column your analysis needs and the other gaps do not matter.',
      'Click through the four buttons and watch the faded rows. The question to ask each time is how many rows you can afford to lose. Dropping 4 of 7 rows to get rid of a column that nobody will use is a poor trade.',
    ],
    keyTakeaways: [
      '`dropna()` removes a row if any cell is missing, which can discard most of a dataset.',
      '`how="all"`, `thresh=` and `subset=` each decide a row\'s fate by a looser or more specific rule.',
      'Choose the rule by asking which columns your analysis actually needs.',
    ],
    widget: 'dropna',
  },
  {
    id: 'missing-fill',
    section: 2,
    title: 'Filling Gaps with a Reasonable Guess',
    subtitle: 'ffill, bfill, interpolate and the mean',
    paragraphs: [
      'When dropping rows costs too much, you can fill the gap instead. Which fill is sensible depends on how the data behaves. Here are twelve monthly temperatures with February, March and July missing, drawn as a line. The filled values appear as hollow circles with their numbers.',
      '`ffill()` copies the last known value forward, so February and March both become 32, the January reading. That suits a sensor that holds its last reading. `bfill()` copies backward, so they both become 55. `interpolate()` draws a straight line between the neighbours. January is 32 and April is 55, so each of the three steps adds (55 − 32) / 3, and February becomes 39.7 and March 47.3.',
      'Press each button and compare the line with what you know about temperature. Interpolation follows the seasons, while `fillna(mean)` puts the same value, about 55, into a cold February and a hot July. The mean is fine for a column with no order, such as a fare, and a poor fit for anything that changes over time.',
    ],
    keyTakeaways: [
      '`ffill()` and `bfill()` copy a neighbouring value, and `interpolate()` draws a line between the two neighbours.',
      'A gap in an ordered series is best filled from its neighbours, not from the overall mean.',
      'Filling invents data, so it needs a reason you could explain to someone reading your analysis.',
    ],
    widget: 'fill',
  },

  // --- SECTION 3: TYPES ---
  {
    id: 'types-coerce',
    section: 3,
    sectionTitle: 'Types',
    title: 'Numbers That Are Really Text',
    subtitle: 'pd.to_numeric and what errors="coerce" does',
    paragraphs: [
      'If even one cell in a column is text, such as "unknown", pandas reads the whole column as `object`, which means strings. Everything still prints, but arithmetic fails and sorting becomes alphabetical. Sorted as text, the ages here come out as 22, 28, 35, 41, 7, because "7" is compared with "4" character by character and 7 is the larger character.',
      '`pd.to_numeric()` converts the column, but by default it stops at the first cell it cannot read and raises a `ValueError`. Press `to_numeric()` to see the error name "unknown" at position 2. That is useful when a bad cell should never be there, because it stops you from continuing on bad data.',
      'With `errors="coerce"`, unreadable cells become `NaN` and the rest become numbers. In the widget the column turns to float64, the two bad cells show as NaN, and the sort is numeric: 7, 22, 28, 35, 41. The unreadable values have not been repaired; they have become missing values, so they now go through the missing-data tools from the last section.',
    ],
    keyTakeaways: [
      'One non-numeric cell turns a whole column into `object`, and sorting then follows text order.',
      '`pd.to_numeric` raises an error on bad cells by default, which is the safe choice when bad cells are unexpected.',
      '`errors="coerce"` turns unreadable cells into `NaN`, so check the NaN count afterward to see how many were lost.',
    ],
    widget: 'coerce',
  },

  // --- SECTION 4: STRINGS ---
  {
    id: 'strings-chain',
    section: 4,
    sectionTitle: 'Strings',
    title: 'Making Spellings Agree',
    subtitle: 'Chaining .str methods until the distinct values collapse',
    paragraphs: [
      'Hand-typed text produces many spellings of one thing. The eight city entries here are really two cities, but `value_counts()` would report eight groups because "New York", "new york" and "  New York  " are different strings to pandas. The goal of string cleaning is to make equal things look equal.',
      'The `.str` methods each fix one kind of difference. `.str.strip()` removes the spaces on either side, `.str.lower()` removes capitalization differences, and `.str.replace("nyc", "new york")` handles an abbreviation. They chain because each returns a Series, so the next method can work on it.',
      'Switch the buttons on one at a time and watch the distinct-value count under the table. Stripping alone takes 8 to 7. Adding lower takes it to 3, adding the replace takes it to 2, and `.str.title()` only changes how the result is displayed. The order matters: the replace looks for lower-case "nyc", so it needs to run after `.str.lower()`.',
    ],
    keyTakeaways: [
      'Strings that look the same to a reader can be different to pandas, and each difference splits a group in two.',
      '`.str.strip()`, `.str.lower()` and `.str.replace()` each remove one kind of difference and chain naturally.',
      'The count of distinct values is a quick way to check whether a cleaning step worked.',
    ],
    widget: 'chain',
  },
  {
    id: 'strings-split',
    section: 4,
    title: 'Pulling a Piece Out of a String',
    subtitle: 'split versus extract on passenger names',
    paragraphs: [
      'Sometimes one cell holds several facts. Each Titanic name begins with a title, then gives the given names and the surname. If we want to compare Mr, Mrs and Miss, the title has to become its own column.',
      '`str.split(". ", n=1, expand=True)` cuts each name at the first ". " and returns two columns, the title and everything after it. `str.extract(r"(\\w+)\\.")` instead describes what a title looks like, one word followed by a period, and returns the part inside the parentheses, which is called a capture group.',
      'Press each button and read the last two rows. For "the Countess. of ...", split returns the two-word title "the Countess" and extract returns only "Countess". The third button gives the groups names, so the output columns are labelled, and it returns NaN where the pattern does not fit. Each tool is making an assumption about how the names are built, and the odd rows show you where the assumption fails.',
    ],
    keyTakeaways: [
      '`str.split(..., expand=True)` cuts at a separator and returns one column per piece.',
      '`str.extract` returns the part of the string that matches a capture group in a pattern.',
      'Always look at the odd rows afterward, because every extraction rule assumes a structure that some rows will not have.',
    ],
    note: 'Named groups are written (?P<name>...) in Python and (?<name>...) in JavaScript. The widget translates between the two for you.',
    widget: 'split',
  },

  // --- SECTION 5: REGEX ---
  {
    id: 'regex',
    section: 5,
    sectionTitle: 'Regex',
    title: 'Describing a Pattern Instead of a Value',
    subtitle: 'A tester for the four patterns that cover most cleaning',
    paragraphs: [
      'A regular expression (regex) describes a family of strings instead of one string. `\\d` means any digit, `[^\\d]` means anything that is not a digit, `{10}` means exactly ten of the thing before it, and `^` and `$` mean the start and the end of the string. Those few symbols handle most cleaning work.',
      'On the first button, the pattern `[^\\d]` is applied to five phone numbers written five ways. Every highlighted character is deleted, so "(555) 867-5309" becomes "5558675309". The same idea, `[^\\d.]`, strips currency symbols so that `pd.to_numeric` can read what is left.',
      'The second button shows why anchors matter. With the pattern `\\d{10}` alone, "55586753091" counts as a valid phone number, because ten digits appear somewhere inside it. Tick "add ^ and $" and the pattern becomes `^\\d{10}$`, which requires the string to be ten digits from start to end, and the eleven-digit string fails. Edit the pattern box yourself to test your own ideas.',
    ],
    keyTakeaways: [
      '`\\d`, `[^...]`, `{n}`, `^` and `$` are the metacharacters that cover most cleaning tasks.',
      'A pattern without anchors matches anywhere inside a string, so use `^` and `$` when the whole string has to fit.',
      'A negated class such as `[^\\d]` removes what you do not want, instead of listing every format you might meet.',
    ],
    widget: 'regex',
  },

  // --- SECTION 6: DATES ---
  {
    id: 'dates',
    section: 6,
    sectionTitle: 'Dates',
    title: 'Telling pandas How the Date Was Written',
    subtitle: 'Why the format string matters',
    paragraphs: [
      'A date stored as text sorts like text. The four dates here run from November 2021 to January 2023, but as strings "01/15/2023" sorts first because it begins with 01. Press "as text" and check the sorted line to see it.',
      '`pd.to_datetime` turns the strings into real dates, and the `format` argument says how they were written. `%m` is the month, `%d` is the day and `%Y` is the four-digit year. With `"%m/%d/%Y"` the string "03/04/2022" is read as 4 March, and the dates sort in time order.',
      'The last button reads the same strings with the day and month swapped, which is what a dataset from another country would need. Two of the strings fail because there is no month 15 or month 30. The other two are the dangerous ones: "03/04/2022" is read without any error as 3 April, and that is wrong for this data. A date that can be read either way gives no warning, so find out how the data was written before choosing the format.',
    ],
    keyTakeaways: [
      'Text dates sort alphabetically, so the order is wrong across years.',
      '`format="%m/%d/%Y"` tells pandas which part of the string is the month, the day and the year.',
      'An ambiguous date such as 03/04/2022 can be misread with no error, so confirm the convention from the data source.',
    ],
    note: 'Once a column is datetime64, the `.dt` accessor gives its parts (`.dt.year`, `.dt.month`, `.dt.day_name()`), and subtracting two datetime columns gives a timedelta whose `.dt.total_seconds()` is a plain number.',
    widget: 'dates',
  },

  // --- SECTION 7: PIPELINE ---
  {
    id: 'pipeline',
    section: 7,
    sectionTitle: 'Pipeline',
    title: 'Putting the Steps in Order',
    subtitle: 'One cleaning pipeline, one step at a time',
    paragraphs: [
      'Real data needs several of these tools together, and the order in which you apply them is part of the design. The last notebook cleans Chicago 311 service requests in seven steps, and this table follows five rows of that data through the first five.',
      'Click from "raw" to "5 strings" and look at the green cells, which are the ones the last step changed. Step 1 renames the columns to snake_case so you can type them. Step 2 drops `status` because it says "Completed" in every row and carries no information. Step 3 parses the two date columns and subtracts them to create `resolution_days`: January 1 to January 5 is 4 days.',
      'Step 4 drops the one row whose ward is missing, so the rows go from 5 to 4 and the null count in the chips goes from 1 to 0. Step 5 strips and title-cases the street addresses. Watching the shape and null count change at every step is the same check the notebook ends with, and wrapping all the steps in one function means you can run them again on next month\'s file.',
    ],
    keyTakeaways: [
      'A cleaning pipeline is a sequence of small steps, each of which you can inspect on its own.',
      'Rows, columns and null counts after each step tell you what the step actually did.',
      'Wrapping the steps in one function makes the cleaning repeatable on a new file.',
    ],
    widget: 'pipeline',
  },
];
