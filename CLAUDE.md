# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**svelte-plots-basic** is a Svelte 5 component library for creating responsive 2D and 3D SVG plots/charts. Components are composable "Lego bricks" — small pieces combined to build visualizations. It requires `mdatools ^1.5.0` as a peer dependency for vector/matrix operations.

This is a **library** (not an app) — there is no application build step or bundler config. The `src/` directory is distributed directly via npm. Validation uses a local Node script and Svelte's compiler, while regression tests use Node's built-in test runner.

## Development

To install dependencies: `npm install`

Useful commands:

- `npm run check` — compile/validate all Svelte components and JavaScript modules.
- `npm test` — run the dependency-free regression tests in `tests/`.
- `npm run prepack` — run both validation and tests; npm invokes this automatically before packaging/publishing.
- `npm pack --dry-run --cache /private/tmp/svelte-plots-basic-npm-cache` — inspect the files that would be included in the npm package without publishing it.

The `prepack` check does not run automatically while editing or when an application imports the library. Run `npm run check` or `npm test` manually during development; npm runs `prepack` automatically for `npm pack` and `npm publish`.

## Collaboration Workflow

The repository owner prefers changes to be handled one issue at a time. Before changing code:

1. Explain the issue and why it matters.
2. Propose and explain the specific solution, including any compatibility risk.
3. Wait for explicit approval.
4. Implement only the approved change and validate it before moving to the next issue.

Do not combine unapproved cleanup or refactoring with an approved fix.

## Current Handoff (version 4.1.0, unreleased)

Version 4.0.0 is tagged and published to npm. Version 4.1.0 is in progress and currently uncommitted. `NEWS.md` holds the full release history and is the authoritative user-facing summary; the `README.md` News section carries only the four most recent releases, ending with a link to `NEWS.md`. A new release therefore has to be written in both files.

The 4.1.0 work is a packaging fix in `package.json`, plus matching documentation:

- Rewrote every `exports` entry from a plain string to a `{ "svelte", "default" }` conditional object. Both branches point at the same file, so path resolution is unchanged; the `svelte` key exists so `@sveltejs/vite-plugin-svelte` classifies the package as a Svelte library via `isFrameworkPkgByJson`. This only changes behavior when a consumer sets `prebundleSvelteLibraries: false`, in which case 4.1.0 is added to `optimizeDeps.exclude` and 4.0.0 is not. Under default settings it is a no-op, because `prebundleSvelteLibraries` defaults to `true` in dev and clears that list.
- Added `./package.json` to `exports`. On 4.0.0 that subpath throws `ERR_PACKAGE_PATH_NOT_EXPORTED`; tools that read the manifest need it.
- Chose 4.1.0 over 4.0.1 because adding export entries is additive.
- Documented in `README.md` that there is no root import, and why.
- Moved the full release history out of `README.md` into a new `NEWS.md`, leaving 4.1.0 through 3.3.0 in the README. `NEWS.md` was added to the `files` array so it ships in the npm tarball, and the README links to it by absolute GitHub URL so the link also works when rendered on npmjs.com.

The version was raised to 4.1.0 in `package.json`; no git tag exists yet.

The completed work in 4.0.0, since 3.4.0, was:

- Improved PNG/SVG/clipboard export reliability, form-safe controls, ExportDialog defaults, modal keyboard behavior, focus indication, and unavailable-Clipboard-API handling.
- Stronger finite-number, range, coordinate, tick, line-style, and export-setting validation while preserving floating-point values and numeric strings where supported.
- Faster rendering through reduced reactive work, repeated allocations, text measurement, colormap generation, and heatmap interval lookup.
- Improved component cleanup, documentation, marker rendering, colormap legend factor alignment, and automatic axis tick behavior.
- Added a non-wrapping horizontal `Legend` layout while preserving the existing vertical default.
- Made subscript, superscript, and tick-factor SVG labels align consistently in current Safari, Chrome, and Firefox using explicit `baseline-shift` values.
- Upgraded local development to Svelte 5.56.8 while retaining the `svelte ^5.0.0` peer range.
- Moved `mdatools` from a bundled runtime dependency to matching dev and peer dependencies at `^1.5.0`. A shared instance is required because `Matrix` and `Vector` validation relies on constructor identity.
- Expanded the dependency-free Node test suite from 5 to 30 regression tests.

Validation run for 4.0.0 passed in full: `npm run check`, `npm test`, `npm run prepack`, `npm pack --dry-run`, `npm ls mdatools svelte --depth=0`, and manual browser smoke testing of PNG, PNG+, SVG, Copy, modal keyboard navigation, horizontal legends, and script labels in Safari and Chrome.

Validation run so far for 4.1.0:

- `npm run check` — 30 Svelte components and 4 JavaScript modules passed.
- `npm test` — all 30 regression tests passed.
- Subpath resolution, probed with `import.meta.resolve` against a packed tarball installed into a scratch consumer. All seven subpaths resolve identically under default conditions and under `--conditions=svelte`. The bare root throws `ERR_PACKAGE_PATH_NOT_EXPORTED` on both versions, and `./package.json` resolves only on the new one.
- Vite dependency classification, compared against published 4.0.0 on both Vite 8 with vite-plugin-svelte 7 and Vite 5 with vite-plugin-svelte 3. Identical under default settings; `optimizeDeps.exclude` gains the package only under `prebundleSvelteLibraries: false`.
- A real `vite build` of a small app importing `Axes`, `XAxis`, `YAxis`, and `Points` — succeeded on both versions and produced byte-identical bundles.
- `npm run prepack` — passed at version 4.1.0.
- `npm pack --dry-run` — passed at version 4.1.0, producing a 38-file `svelte-plots-basic-4.1.0.tgz` manifest that includes `NEWS.md`.

Still to do before releasing 4.1.0: commit the changes, tag, and publish. No manual browser smoke testing was repeated for 4.1.0, and none of the runtime code changed.

A resolution regression test covering the seven subpaths and the intentionally absent root was proposed and explicitly declined, to keep `tests/` focused on component behavior rather than packaging.

Known intentional limitations and deferred work:

- The 2D `Axes` clip-path ID uses `Math.random()`, which can produce an SSR hydration mismatch. SSR is not used by the owner, so this was explicitly deferred. Using `$props.id()` would require raising the Svelte peer dependency to at least 5.20.0.
- Horizontal legends use a single row and do not wrap; this is intentional and documented.
- Script positioning uses `baseline-shift`, which is supported by current browsers but not Firefox ESR 140. Older Firefox renders the smaller script text without the intended vertical shift.
- `src/methods.js` still contains a TODO for dynamic font-family measurement. The plot currently uses Arial consistently, so this is not an active bug.
- There is no `"."` root export, so `import ... from 'svelte-plots-basic'` fails to resolve. This is deliberate: the 2D and 3D barrels share nine names, including `Axes`, `XAxis`, `YAxis`, `TextLabels`, `Segments`, `Lines`, `Points`, `getcolmap`, and `Colors`, so a flat root barrel would require renaming components. Documented in `README.md`.

No known client-side bug remains pending. Resume from a newly reported bug or enhancement, and continue following the approval-first collaboration workflow above.

## Architecture

### Entry Points

Consumers import from subpaths only; there is no root export:
- `svelte-plots-basic/2d` — all 2D components (`src/2d/index.js`)
- `svelte-plots-basic/3d` — all 3D components (`src/3d/index.js`)
- `svelte-plots-basic/utils` — utility functions (`src/methods.js`)
- `svelte-plots-basic/constants` — theme constants (`src/constants.js`)

Individual components are also importable as `svelte-plots-basic/2d/Name.svelte` and `svelte-plots-basic/3d/Name.svelte`. Since `exports` is a closed allowlist, any new public entry point must be added there or it will be unresolvable.

### Context-Based Component Communication

The `Axes` component (both 2D and 3D) is the required parent for all plot components. It uses `setContext('axes', {...})` to share:
- Coordinate transformation functions (`tX`, `tY`, `tZ` for 3D)
- Axis limit getters (`limX`, `limY`)
- Scale info and setter methods for child configuration (`setXAxis`, `setYAxis`, `setBox`, `setColmapLegend`)

All child components call `getContext('axes')` to access this shared state. Components cannot function outside an `Axes` parent.

### Component Categories

**2D (`src/2d/`):**
- **Parent:** `Axes` — manages coordinate system, margins, responsive sizing, download/copy, mouse events
- **Axes:** `XAxis`, `YAxis`, `Box`
- **Series** (data-driven, support `onclick`): `Points`, `Lines`, `Multilines`, `Segments`, `Rectangles`, `Bars`
- **Elements:** `Area`, `Heatmap` (both support `onclick`)
- **Legends:** `Legend`, `TextLegend`, `ColormapLegend`
- **Internal** (used by Axes only): `AxisLines`, `AxisTickLabels`

**3D (`src/3d/`):**
- Same pattern with `Axes` parent, adds `ZAxis`
- Series: `Points`, `Lines`, `Segments`, `Mesh`
- 3D uses isometric projection via `phi`/`theta` angles and `zoom`

### Shared Code

- **`src/methods.js`** (~1500 lines) — coordinate transforms, tick generation, axis parameter calculation, text-to-SVG conversion (subscript/superscript via `_` and `^`), download/clipboard functions, colormap generation
- **`src/constants.js`** — responsive size breakpoints (`small`/`medium`/`large`/`xlarge`), color palette (`Colors`), marker symbols, line style patterns

### Key Patterns

- **Svelte 5 runes:** Components use `$props()`, `$derived`, `$effect()`, `$state()`
- **Responsive sizing:** Constants are keyed by size category; the `Axes` component determines the current size category based on container dimensions
- **Props accept both arrays and mdatools Vector/Matrix objects** — validated via `checkArray()`/`checkCoords()` in `methods.js`
- **Text rendering:** `text2svg()` converts strings with `_subscript` and `^superscript` notation into SVG tspan elements
- **Marker symbols:** 8 predefined Unicode markers in `MARKER_SYMBOLS` constant, referenced by 1-based index
