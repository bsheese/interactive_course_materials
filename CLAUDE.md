# interactive_course_materials — working notes

Interactive companion pages for the cs225 / cs377 / cs387 notebooks. One Vite +
React app, one route per module, published to GitHub Pages.

## Architecture in one paragraph

`src/kit/` is subject-agnostic and shared: the module contract (`types.ts`),
statistics over neutral `{x, y}` points (`stats.ts`), section derivation
(`sections.ts`) and the whole UI shell (`components/`, entry point `DeckShell`).
`src/modules/<course>/<id>/` is one unit: `slides.ts` (content), `widgets/`
(interactive components), `index.ts` (a `ModuleDefinition` mapping widget keys to
components). `src/modules/registry.ts` lists every module with a lazy `import()`.
`src/pages/` holds the landing page and the `/:course/:moduleId` route.

## Rules that keep it scaling

- **The kit never learns a subject.** No `if (module === '17_0')`, no unit
  vocabulary in `kit/`. Units adapt to the kit, not the reverse — see
  `modules/377/17_0/stats.ts`, which maps shoe size/height onto `{x, y}`.
- **Widgets are addressed by string key**, resolved through the module's own
  `widgets` map. There is deliberately no central union type or dispatch switch;
  the old single-module app had both and they were the thing that didn't scale.
- **Nothing is derived from slide indices.** Section boundaries come from
  `deriveSections(slides)`. The original deck hard-coded jumps to slides 0/6/10.
- **Deterministic data.** Seed randomness with `seededRandom` from `@kit/stats`.
- **Adding a module touches one shared line** — its registry entry.

## Writing the exposition

Slide `paragraphs` are the lesson, aimed at a student seeing the idea for the
first time: scaffold each step, compute the worked example in the text, name
the widget control and say what to notice, and keep a plain, unhurried voice
with no punchy fragments. `377/17_0` and `377/17_1` set the target; the full
checklist is in CONTRIBUTING.md § "Writing style for the exposition".

## Commands

```bash
npm run dev        # localhost:3000/interactive_course_materials/
npm run typecheck
npm run build      # typecheck + build; also writes dist/404.html
npm run preview
```

Node 24, npm (not Bun, despite the module's AI Studio origins).

## Deployment

`.github/workflows/deploy.yml` on push to `main`; base path is derived from the
repo name via `BASE_PATH`. Pages has no SPA rewrite, hence the `404.html` copy
in `vite.config.ts`.

## Content lives elsewhere

The notebooks are the source of truth and live in the separate `cs225`, `cs377`
and `cs387` repos (`~/repos/courses_public/`). Decks here are written by hand to
teach the same ideas visually; keep `sourceUnit` in the registry pointing at the
unit a module accompanies. `courses_public/377/COURSE_MAP.md` shows where each
concept is first taught — useful when deciding what a new module should cover.

## Adding a module

See CONTRIBUTING.md. Short version: copy `templates/module_template` into
`src/modules/<course>/<id>/`, add a registry entry, write slides and widgets.
