# Adding a module

A module is one unit's interactive page: a deck of slides plus the widgets they
embed. Everything below happens inside `src/modules/<course>/<module_id>/` and
one line of the registry — the shared kit should not need to change.

## 1. Copy the template

```bash
cp -r templates/module_template src/modules/377/17_1
```

You get:

```
17_1/
  index.ts               the ModuleDefinition — slides, widgets, dataset
  slides.ts              the deck content
  widgets/               one file per interactive component
```

Name the folder after the unit as the course repo names it (`17_1`, `18_2`), so
the route matches what students see in the notebooks: `/377/17_1`.

## 2. Register it

Add an entry to `src/modules/registry.ts`:

```ts
{
  course: '377',
  id: '17_1',
  title: 'Simple Linear Regression',
  description: 'One sentence a student reads before deciding to click.',
  status: 'draft',                 // 'published' once it's classroom-ready
  sourceUnit: '17_regression_crossval/17_1_SLR',
  notebookUrl: 'https://github.com/bsheese/cs377/tree/main/17_regression_crossval/17_1_SLR',
  load: () => import('./377/17_1/index'),
}
```

`load` must be a literal `import('...')` — Vite needs to see the path to split
the chunk. `status: 'draft'` shows the card with a Draft badge; `'hidden'` keeps
it off the index while you work (the route still resolves if you know it).

## 3. Write the slides

`slides.ts` is an array of `Slide` (see `src/kit/types.ts`). Fields:

| Field | Notes |
|---|---|
| `id` | unique in the module; used as the animation key |
| `section` / `sectionTitle` | groups slides into parts; drives the footer pills and number-key jumps |
| `title` / `subtitle` | the subtitle renders in quotes, italic |
| `paragraphs` | the left-hand exposition, one string per paragraph |
| `keyTakeaways` | bulleted card rendered under the widget, in the right column |
| `formula` | LaTeX plus per-symbol glossary, rendered with KaTeX |
| `note` | the "Editorial Note" aside |
| `widget` | key into the module's `widgets` map; omit for a text-only slide |

Name the sections in `index.ts` via `sectionTitles` — those names appear on the
footer jump pills. Section boundaries are derived from the slides themselves, so
inserting a slide never desynchronises the navigation.

### Writing style for the exposition

The `paragraphs` are the lesson, not a caption for the widget. Write them for a
student meeting the idea for the first time, not for someone who already knows
it. `377/17_0` and `377/17_1` are the reference for the target voice.

- **Scaffold every step.** Say what question the slide is answering, why the
  previous idea was not enough, what the new idea is, and how to read it.
  Four to six paragraphs per slide is normal; three terse ones is too few.
- **Compute the example in the text.** "Half the deviations are −6 and half are
  +6, so fifty −6s and fifty +6s add to 0" teaches; "the sum is zero" does not.
- **Point at the widget explicitly.** Name the control ("press 'Draw New
  Student'", "use the noise slider") and say what the student should notice.
  Check the widget's actual labels before writing the sentence.
- **Plain, unhurried voice.** No punchy fragments, no exclamation marks, no
  "stark" / "ultimate" / "mastery". Prefer a full sentence over a bullet
  unless the items are genuinely a list. Define a term the first time it
  appears and connect it back to the earlier idea it generalises (residuals
  are deviations from a line, RSS is TSS around a line, and so on).
- **Takeaways are full sentences.** They sit after the widget as a recap, so
  each one should stand on its own without the paragraph that produced it.
- **Notes carry caveats, not content.** Use `note` for the aside a careful
  instructor would add (Bessel's correction, "the intercept is not
  interpretable here"), and keep the main thread in `paragraphs`.

## 4. Write the widgets

One component per file in `widgets/`, exported by name and registered in the
`widgets` map. Conventions:

- **Self-contained.** A widget takes no props and owns its state, so slides stay
  declarative and a widget can appear on more than one slide.
- **Deterministic.** Seed any randomness with `seededRandom` / `seededGaussian`
  from `@kit/stats`, so the projector and the student's laptop show the same
  numbers.
- **Reuse the kit statistics.** `@kit/stats` works on neutral `{x, y}` points.
  If your unit thinks in its own vocabulary, write a thin adapter next to the
  module — `src/modules/377/17_0/stats.ts` is the worked example.
- **Match the chrome.** Keep the white card with the icon header; put your
  visual inside it.

Anything genuinely general — a scatter plot with a draggable line, a confusion
matrix, a residual strip — is worth promoting into `src/kit/components/` so the
next unit gets it for free. Anything unit-specific stays in the module.

## 5. Optional: a dataset table

Set `dataset` in `index.ts` and the header grows a **Dataset** button. Columns
can be raw fields or derived (`value: (row) => …`), and `tone` colours signed
values green/red — that's how 17_0 shows deviations and cross-products next to
the raw numbers.

## 6. Check it

```bash
npm run typecheck
npm run dev          # walk every slide, click every control
npm run build
```

Note that `templates/` is outside the TypeScript project, so the template
itself is not typechecked; your copy under `src/modules/` is.

## 7. Link it from the notebook

Point students at the module from the unit it accompanies:

```markdown
🎛️ [Interactive: Statistical Foundations](https://bsheese.github.io/interactive_course_materials/377/17_0)
```

Deep-link a single visual with `?step=N` (1-based), e.g. `…/377/17_0?step=9`
for the covariance cross-products slide.
