# Release notes

This file contains the full release history of `svelte-plots-basic`. The [README](README.md) shows only the most recent releases.

## 4.1.0

* Added a `svelte` export condition to every entry point, so bundlers recognize the package as a Svelte library. This matters when `prebundleSvelteLibraries` is disabled, where the components must be excluded from dependency pre-bundling.
* Added `./package.json` to the exported paths, so tools that read the package manifest can resolve it.

## 4.0.0

* Added horizontal legend layout and improved legend sizing and alignment.
* Improved PNG/SVG export reliability, export-dialog accessibility, and clipboard handling.
* Strengthened validation, automatic axis ticks, marker rendering, and component cleanup.
* Made subscripts, superscripts, and tick-factor labels consistent across modern browsers.
* Updated to `mdatools ^1.5.0`, now declared as a peer dependency to prevent incompatible duplicate instances.

## 3.4.0

* Added the `plotActions` property to `Axes` for adding custom buttons to the download panel.
* Added advanced validation for axis limits, text-label positions, heatmap breaks, and custom plot actions.
* Fixed text-label positioning and rotation when individual positions are provided.
* Fixed heatmaps with automatic, custom, or constant-value breaks.
* Added support for rectangular and constant-height 3D meshes.
* Improved PNG, SVG, and clipboard export by serializing a clone instead of modifying the visible plot.
* Fixed the advanced PNG export dialog so a default resolution is always selected, falling back to 300 dpi when necessary.
* Prevented plot controls from submitting an enclosing HTML form.
* Added package validation before publishing and synchronized Svelte 5 peer-dependency metadata.
* Fixed conditionally rendered axes, boxes, and legends so their parent state is cleared when they are removed.
* Improved heatmap interval processing and added automatically generated colormaps with more than 16 colors.
* Fixed `TextLegend` positioning at zero and strengthened finite-range validation for 3D axes.
* Reduced reactive and repeated allocation overhead for axis configuration, text measurement, PNG export, and colormap generation.
* Added dependency-free regression tests and made them run automatically before packaging.
* Documented the trust requirements for labels rendered as SVG/HTML markup.

## 3.3.0

* Added advanced "save as PNG" option where user can select size and resolution of the image as well as change the filename.
* several small improvements and bug fixes.


## 3.2.1

* Added mouse click handler option for `Heatmap.svelte` component (returns row and column index of the element).


## 3.1.1-3.1.6

* Fixed bug which sometimes caused an error when manual text tick labels provided.
* Added `markerSize` specification to legend items.
* Small improvements and bug fixes.

## 3.1.0

* Added possibility to reverse the axis, just swap the limit values.


## 3.0.0

New major release (v. 3.0.0, released 20/01/2025) introduces many breaking changes as the library has been re-written using Svelte 5. If you use previous versions of `svelte-plots-basic` in your projects, and do not want to change anything, stick to the latest 2.x.x version.

In addition to Svelte 5 syntax and functionality, this release also introduces a lot of  improvements, such as better handling of axis ticks, new syntax for axis elements, etc. See examples below for inspiration. Here is a short list what has been changed from 2.x.x:

* **No more slots**  — components `<Box>`, `<XAxis>`, `<YAxis>`, and `<ZAxis>` (for 3D) do not require attribute `slot` anymore. Moreover, you have to remove this attribute from all your old code in order to use the new version.

* **Axis labels** — in version 2.x.x. labels for x- and y-axis were a part of `<Axes>` component. From 3.x.x. they are part of corresponding axis components, for example:<br> `<XAxis label="x-axis label"/>`.

* **Support for subscripts and superscripts**  — you can now use simple syntax for subscripts (`_`) and superscripts (`^`) in axis labels, tick labels, legend labels and plot title. For example, such labels as `'x^2'`, `x^-1` or `x_(34)` — will be correctly transformed to corresponding SVG text elements in order to visualize them correctly. You can also use HTML symbols, such as `&alpha;`.

* **Mouse events** — previosly, handling mouse events was done through a coplex system of manual events dispatched by `<Axes>` component. From 3.x.x this is much easier, almost every 2D series component (`<Rectangles>`, `<Bars>`, `<Points>`, `<Segments>`, `<Lines>`, `<Areas>`) can handle its own `onclick` event. You just need to provide a callback — a function that will be run if this event is fired. The callback should have one argument — id (position) of an element the click was made on. For example `<Points ... onclick={(id) => console.log(id)}>`. Because of this modification, the  property `title` has been removed from all components. 2D component `<Axes>` also supports `onclick` event, it provides coordinates of the clicked point as arguments for the callback function. 3D plots do not support mouse events.

* **Save and copy 3D plots** — from 3.x.x you can also save and copy to clipboard 3D plots (same way as for 2D).

* **Doc strings** — every component has a corresponding doc string with description of its properties and a simple code example. It should be available when you move your mouse over the component tag in your editor/IDE if it supports this option (works in VSCode).

* **Properites** — from 3.x.x the naming of the properties is more consistent. For example, before the library used properties `borderColor` and `borderWidth` for areas, rectangels, bars and markers, while for lines, segments and multilines the similar properties were named as `lineColor` and `lineWidth`. Now they all have prefix `line*` if it is something about lines or segments and `face*` if it is somthing inside a closed contour. So no more `border*` properties.
