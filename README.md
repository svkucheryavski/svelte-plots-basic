# Svelte components for creating plots

The library is under development and breaking changes may occur in the coming versions.

## News

New major release (v. 2.0.0) introduces many breaking changes as the library was completely re-written. If you use previous versions of `svelte-plots-basic` in your projects, and do not want to change anything, stick to the latest 1.x.x version (v. 1.1.4).

### 2.3.0

* added possibility to save plot as SNV and PNG files.
* improved handling of markers in `Points` component.

### 2.2.0

* Better handling of axes labels and plot title (now they are part of SVG object).
* Other small improvements and bug fixes.

### 2.1.0

* Added new elements, `Heatmap` and `ColormapLegend`.
* Improvements to tick labels, in particular if values are too small (< 0.01) or too large (>99) the values are adjusted and a common factor is shown at the end of axis. This is applied only to automatic ticks, manually provided ticks and tick labels are shown as is.
* Small improvements and bug fixes.

## Description

`svelte-plots-basic` is a [Svelte](https://svelte.dev) component library for creating simple 2D and 3D plots/charts. The plots are created by generating [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) inside HTML document and are re-scalable.

The library provides building blocks for creating plots, one can think of this library as "Lego" bricks for plots. It has two groups of components: for 2D and for 3D plots. In addition to `svelte` the library has one direct dependence, [mdatools-js](https://github.com/svkucheryavski/mdatools-js) library which is used for vector/matrix operations, statistics, and other manipulations with data values.


## Installation

The set up process is similar to any other Svelte component library. Just use:

```
npm -i -D svelte-plots-basic
```

or, to install it with yarn:

```
yarn add -D svelte-plots-basic
```


## Quick start (2D plots)

It is assumed that you already know the basics of Svelte.

Just create a new Svelte app following the [quick start guide](https://svelte.dev/blog/the-easiest-way-to-get-started). Then open `App.svelte` file, delete everything and write the following code, which creates a simple 2D bar chart:

```javascript
<script>
   import {Axes, XAxis, YAxis, Box, BarSeries} from 'svelte-plots-basic';

   // test data for the plot
   const years = [2010, 2020, 2030, 2040, 2050];
   const amount = [100, 200, 150, 300, -100];
</script>

<div class="plot-container">
<Axes limX={[2005, 2055]} limY={[-150, 350]} margins={[1, 1, 0.5, 0.5]} xLabel="Years" yLabel="Income">

      <BarSeries
         faceColor="#e0e0e0"
         edgeColor="#909090"
         xValues={years}
         yValues={amount}
      />

      // x and y axis with automatic ticks and grid lines
      <XAxis slot="xaxis" />
      <YAxis slot="yaxis" />

      // box around the axes
      <Box slot="box" />

   </Axes>
</div>

<style>
   .plot-container {
      width: 100%;
      height: 100%;
      min-width: 200px;
      min-height: 200px;
   }
</style>
```

Then run `npm run dev` in terminal and open the URL provided by npm in browser. That is it.

You can also use all capabilities of the `mdatools` package, e.g. generated random numbers:

```javascript
<script>
   import { Axes, BarSeries } from 'svelte-plots-basic';
   import { Vector } from 'mdatools/arrays';

   // generate random values from normal distribution
   const x = Vector.randn(200, 0, 1);
   const y = Vector.randn(200, 0, 2);
</script>

<div class="plot-container">
   <Axes limX={[-6, 6]} limY={[-5, 6]} xLabel="x" yLabel="y">

      <ScatterSeries
         xValues={x}
         yValues={y}
      />

      // x and y axis with automatic ticks and grid lines
      <XAxis slot="xaxis" />
      <YAxis slot="yaxis" />

      // box around the axes
      <Box slot="box" />

   </Axes>
</div>
```

See demo for more details.

### Save plot to a file

From version *2.3.0* it is possible to save any plot as SVG or PNG file. In order to use this you need to add additional parameter to `Axes` component, `downloadLinks`. This parameter may have the following values:

* `"none"` — turns this functionality off (default value).
* `"hover"` — buttons with download options appear when user hovers mouse on the plot.
* `"fixed"` — buttons with download options are always shown.

You can also specify parameter `fileName` which should be the desired filename for the plot without extension (e.g. `fileName="myplot"`).

In case of SVG file the plot is downloaded as is. In case of PNG the plot is rasterized and you can define additional options, also as parameters of `Axes` component:

* `pngWidth` — width of PNG image in cm (default is 8 cm).
* `pngHeight` — height of PNG image in cm (default is 8 cm).
* `pngRes` — resolution of the PNG image in pixels per inch (default is 300).

If the first two parameters do not match the aspect ratio of the plot they will be adjusted accordingly.

## Quick start (3D plots)



