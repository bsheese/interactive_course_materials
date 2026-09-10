# interactive_course_materials

Interactive companion pages for the course notebooks — visual sandboxes a
student can drag, slide and break, built to sit alongside a unit rather than
replace it.

One React app publishes every module. A module is a deck of slides plus the
widgets those slides embed; the shared kit supplies everything else (navigation,
keyboard control, math rendering, dataset viewer, theme).

**Live site:** `https://bsheese.github.io/interactive_course_materials/`
(deep links: `/377/17_0`, and `/377/17_0?step=9` for one specific slide)

## Modules

| Course | Module | Accompanies |
|---|---|---|
| cs377 | `17_0` — Statistical Foundations | [`17_regression_crossval/17_0_Preliminaries`](https://github.com/bsheese/cs377/tree/main/17_regression_crossval/17_0_Preliminaries) |

The registry in [`src/modules/registry.ts`](src/modules/registry.ts) is the
source of truth for this list.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000/interactive_course_materials/
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build into dist/
npm run preview    # serve the built site
```

Node 24 (see `.nvmrc`). The 17_0 module was originally scaffolded in Google AI
Studio with Bun; that lockfile is gone and npm is the toolchain now.

## Layout

```
src/
  kit/                    shared across every module — the only code that
    types.ts              the module contract: Slide, ModuleDefinition, …
    stats.ts              domain-neutral statistics over {x, y} points
    sections.ts           section grouping derived from the deck
    components/           DeckShell + header, footer, slide view, modals
  modules/
    registry.ts           every module, lazily imported
    377/17_0/             one module: slides, widgets, its own data & adapters
  pages/                  landing page, module route, 404
templates/module_template/  copy this to start a new module
```

The shell knows nothing about any subject. Slides name their widget with a
string key, and each module maps those keys to components — so adding a module
never edits shared code beyond one registry entry.

## Adding a module

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds with
`BASE_PATH=/<repo-name>/` and publishes `dist/` to GitHub Pages. Enable Pages
once under **Settings → Pages → Source: GitHub Actions**.

Because Pages has no SPA rewrite, the build copies `index.html` to `404.html`
so deep links resolve to the app shell and the router takes over.

## Relationship to the course repos

The notebooks live in separate repos (`cs225`, `cs377`, `cs387`) and stay the
source of truth for content. This repo links out to them, and they can link in
to a specific slide. Nothing here is generated from the notebooks — the decks
are written by hand to teach the same ideas visually.
