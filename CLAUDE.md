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

## Current Handoff (version 4.1.2)

Version 4.1.2 is committed as `prepare 4.1.2 release` and tagged `4.1.2`. The owner runs `git push` and `npm publish`; confirm with `npm view svelte-plots-basic dist-tags`. 4.1.1 (`a88cba3`) was published to npm before it was tagged; the `4.1.1` tag was added afterwards, and the published tarball was verified to be identical to that commit.

### Changelog layout

`NEWS.md` holds the full release history and is the authoritative user-facing summary. The `README.md` News section carries only the four most recent releases and ends with a link to `NEWS.md`, so a new release has to be written in both files. That link is an absolute GitHub URL rather than a relative path, because a relative link would 404 when the README is rendered on npmjs.com. `NEWS.md` is listed in the `files` array so it also ships inside the npm tarball.

### What 4.1.1 and 4.1.2 changed

Both are bug-fix releases for reversed axes (`limX[0] > limX[1]` or `limY[0] > limY[1]`), which SVG cannot draw with negative `width`/`height`.

- 4.1.1 (`2a12d5c`): `Rectangles` draws `width={Math.abs(rw[i])}`, so rectangles show on a reversed x-axis. This made reversed-x `Bars` visible but shifted by one bar width.
- 4.1.2, `Bars` on reversed x (`831212f`): the left edge is `x - dir * w/2`.
- 4.1.2, `Bars`/`Rectangles` on reversed y (`20faaab`): `Rectangles` uses `Math.abs` for height too, and `Bars` passes `top = min(y, 0)` instead of `max(y, 0)` on a reversed y-axis.
- 4.1.2, `Heatmap` on reversed axes (`0562a50`): cells are anchored on the edge drawn on the left/top and sizes are made positive. Heatmaps were fully invisible on any reversed axis before.

The direction is read as `Math.sign(axes.tX().objects[0]) || 1` (and the same for `tY`); before `Axes` is ready the scale is `1` or `0`, which falls back to `1`. On non-reversed axes every changed expression takes the original branch, so output is identical to before.

How these were verified: each change was rendered in jsdom against the previous commit, comparing full SVG output on ascending axes (identical) and cell/bar geometry on reversed ones (correct), plus every `Rectangles`, `Bars` and `Heatmap` call site in mdatools-apps. Three independent reviewers and Codex approved each change. Components can be mounted in Node by compiling `.svelte` files in a `module.register()` load hook with `svelte/compiler`, adding a resolve fallback that appends `.js` (the library uses extensionless relative imports), running with `--conditions=browser --conditions=production`, and stubbing `clientWidth`/`clientHeight`, `ResizeObserver` and the canvas `getContext` used for text measurement. That harness was kept out of the repository, consistent with keeping `tests/` dependency-free.

Not changed: mdatools-apps' `PlotFoMHeatmap` overlays and `PlotSeries` bars compute their own geometry and assume ascending axes; neither currently uses a reversed axis.

### What 4.1.0 changed

A packaging-only release; no runtime code changed.

- Every `exports` entry became a `{ "svelte", "default" }` conditional object. Both branches point at the same file, so path resolution is unchanged. The `svelte` key exists only so `@sveltejs/vite-plugin-svelte` classifies the package as a Svelte library via `isFrameworkPkgByJson`, which drives `optimizeDeps.exclude` so esbuild never tries to parse `.svelte`. This changes behavior only when a consumer sets `prebundleSvelteLibraries: false`; under default settings it is a no-op, because that option defaults to `true` in dev and clears the exclude list. Do not also add a top-level `svelte` field — vite-plugin-svelte warns when that field is present without a matching export condition.
- `./package.json` was added to `exports`. On 4.0.0 that subpath threw `ERR_PACKAGE_PATH_NOT_EXPORTED`, which breaks tools that read the manifest.
- Released as a minor rather than a patch because adding export entries is additive.

Verified against the published package: a fresh install of 4.1.0 resolves all six documented subpaths plus `./package.json`, and `NEWS.md` is present in the tarball.

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

Both releases passed `npm run check`, `npm test`, `npm run prepack`, and `npm pack --dry-run` at their own version numbers. 4.0.0 additionally passed `npm ls mdatools svelte --depth=0` and manual browser smoke testing of PNG, PNG+, SVG, Copy, modal keyboard navigation, horizontal legends, and script labels in Safari and Chrome. That browser pass was not repeated for 4.1.0, since no runtime code changed.

The 4.1.0 packaging claims were checked empirically rather than by inspection, comparing a packed tarball against the published 4.0.0 in a scratch consumer project: subpath resolution via `import.meta.resolve` under both default and `--conditions=svelte`, Vite dependency classification on Vite 8 with vite-plugin-svelte 7 and on Vite 5 with vite-plugin-svelte 3, and a real `vite build` of a small app, which produced byte-identical bundles on both versions. Repeat that approach for any future `exports` change; reasoning about resolution without testing it is unreliable, and the useful signal only appeared under a non-default option.

A resolution regression test covering the documented subpaths and the intentionally absent root was proposed and explicitly declined, to keep `tests/` focused on component behavior rather than packaging.

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
- **Reversed axes:** swapping the limits reverses an axis. Rectangle-like elements are drawn with non-negative SVG sizes from the edge drawn on the left/top, so on a reversed x-axis `Rectangles` `left` is the larger x-value and on a reversed y-axis `top` is the smaller y-value. Components that compute their own edges (`Bars`, `Heatmap`) choose them from the sign of `axes.tX().objects[0]` / `axes.tY().objects[0]`. Changing this convention in `Rectangles` would break mdatools-apps, which relies on it.
