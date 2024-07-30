# Svelte components for creating plots

The library is under development and breaking changes may occur in the coming versions.

## Showcase

These websites and web-applications use `svelte-plots-basic` library:

* [graasta.com](https://graasta.com) — interactive web-apps for learning statistics and beyond.
* [mda.tools/ddsimca/](https://mda.tools/ddsimca/) — interactive web-app for one class classification using [DD-SIMCA](https://analyticalsciencejournals.onlinelibrary.wiley.com/doi/epdf/10.1002/cem.3556) method.

## News


### 2.3.0

* added possibility to save plot as SVG and PNG files (see details below).
* improved handling of markers in `Points` component.
* small improvements and bug fixes.
* added more detailed description with code example both here and Svelte REPL (see below).

### 2.2.0

* Better handling of axes labels and plot title (now they are part of SVG object).
* Other small improvements and bug fixes.

### 2.1.0

* Added new elements, `Heatmap` and `ColormapLegend`.
* Improvements to tick labels, in particular if values are too small (< 0.01) or too large (>99) the values are adjusted and a common factor is shown at the end of axis. This is applied only to automatic ticks, manually provided ticks and tick labels are shown as is.
* Small improvements and bug fixes.

### 2.0.0
New major release (v. 2.0.0) introduces many breaking changes as the library was completely re-written. If you use previous versions of `svelte-plots-basic` in your projects, and do not want to change anything, stick to the latest 1.x.x version (v. 1.1.4).

## Description

`svelte-plots-basic` is a [Svelte](https://svelte.dev) component library for creating simple responsive 2D and 3D plots/charts. The plots are created by generating [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) inside HTML document.

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

Below you will find several simple examples which help you to start with. It is assumed that you already know the basics of Svelte.

To make a plot, just create a new Svelte app following the [quick start guide](https://svelte.dev/blog/the-easiest-way-to-get-started). Then open `App.svelte` file, delete everything and write the following code, which creates a simple 2D bar chart:

```svelte
<script>
   import {Axes, XAxis, YAxis, Box, Bars} from 'svelte-plots-basic/2d';

   // test data for the plot
   const years = [2010, 2020, 2030, 2040, 2050];
   const amount = [100, 200, 150, 300, -100];
</script>

<div class="plot-container">
<Axes limX={[2005, 2055]} limY={[-150, 350]} margins={[1, 1, 0.5, 0.5]}
   xLabel="Years" yLabel="Income">

      <!-- series of bars for the defined data -->
      <Bars
         faceColor="#e0e0e0"
         edgeColor="#909090"
         xValues={years}
         yValues={amount}
      />

      <!-- x and y axis with automatic ticks and grid lines -->
      <XAxis slot="xaxis" />
      <YAxis slot="yaxis" />

      <!-- box around axes -->
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

[This example](https://svelte.dev/repl/ad0f5631137d4a16b3a9b0e9dff23169?version=4.2.18) in Svelte REPL.

You can also use all capabilities of the `mdatools` package, e.g. generating random numbers:

```svelte
<script>
   import { Axes, XAxis, YAxis, Box, Points } from 'svelte-plots-basic/2d';
   import { Vector } from 'mdatools/arrays';

   // generate random values from normal distribution
   const x = Vector.randn(200, 0, 1);
   const y = Vector.randn(200, 0, 2);
</script>

<div class="plot-container">
   <Axes limX={[-6, 6]} limY={[-5, 6]} xLabel="x" yLabel="y">
      <Points xValues={x} yValues={y} />
      <XAxis slot="xaxis" />
      <YAxis slot="yaxis" />
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

[This example](https://svelte.dev/repl/4763a7b8d49d4e268e1c68e0828403a6?version=4.2.18) in Svelte REPL.


Below is a brief description of available components for 2D plots.


### Axes

Main component of any plot, all other components must be located inside `Axes`. You can specify parameters defining the x- and y-axis limits, margins around axes pane (to make space for axis ticks and labels), plot title and axis labels, as well as several parameters for saving plot to graphical files.

Here is an example of using the component with all available parameters:

```svelte
<script>
   import { Axes } from 'svelte-plots-basic/2d';
</script>

<Axes
   limX={[0, 10]}
   limY={[-100, 100]}
   title="My super plot"
   xLabel="X-axis label"
   yLabel="Y-axis label"
   margins={[1.0, 0.75, 0.5, 0.5]}

   downloadLinks="hover"
   fileName="plot"
   pngWidth={8}
   pngHeight={8}
   pngRes={300}
>
</Axes>
```

Parameter `margin` must contain four values, relative margins for bottom, left, top and right sides around main plotting area. The larger margin value is the more space available for axis ticks, labels, etc.

The last five parameters are needed to save plot to a file. See corresponding section with more details below.

[This example](https://svelte.dev/repl/d818a241c85844249b34e75196ac308c?version=4.2.18) in Svelte REPL.


### Axis

Two components, `XAxis` and `YAxis`, add corresponding elements to the plot. Both have one mandatory argument, `slot`, which must have values `"xaxis"` and `"yaxis"` correspondingly. Other parameters let you define manual ticks and tick labels as well as turn on/off grid lines.

Here is an example where component `XAxis` is shown with all available parameters:

```svelte
<script>
   import { Axes, XAxis, YAxis } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[-6, 6]} limY={[-5, 6]} margins={[1.5, 1.5, 0.5, 0.5]}>
   <XAxis
      slot="xaxis"
      ticks={[-4, 0, 4]}
      tickLabels={["before", "now", "after"]}
      showGrid={true}
      las={2}
      lineColor="#a0a0a0"
      gridColor="#e0e0e0"
      textColor="#ff6666"
   />
</Axes>
```

The `YAxis` has identical parameters, just remember to change the `slot` value. The parameter `las` can be equal to `1` or `2` and it defines orientation of tick labels (horizontal or vertical).

[This example](https://svelte.dev/repl/fbc54e9359a84cd39b5e1da0787b7274?version=4.2.18) in Svelte REPL.



### Box

Simple component which adds a box (frame) around the main plotting area. Has only one parameter (it is mandatory), `slot`, which must always be `"box"`:

```svelte
<script>
   import { Axes, Box } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[-6, 6]} limY={[-5, 6]}>
   <Box slot="box" />
</Axes>
```

[This example](https://svelte.dev/repl/567b716dbe844ba1a79c72f4beff8d3d?version=4.2.18) in Svelte REPL.


### Points

Adds a series of points to a plot. Requires at least two sequence of values, x- and y-coordinates of the points, which can be specified as Javascript array or as a `Vector` instance (class from `mdatools` package).

Here is an example of using the component with all available parameters:

```svelte
<script>
   import { Axes, Points } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[-4, 4]} limY={[-1, 10]}>
   <Points
      xValues={[-3, -2, -1, 0, 1, 2, 3]}
      yValues={[9, 4, 1, 0, 1, 4, 9]}
      marker={1}
      faceColor="transparent"
      borderColor="#ff0000"
      borderWidth={2}
      markerSize={2}
      title="series1"
   />
</Axes>
```

Parameter `marker` must be a number between 1 and 8, which corresponds to the following marker symbols: `["●", "◼", "▲", "▼", "⬥", "＋", "*", "✕"]`. First five markers may have different colors for the border (stroke) and the face (fill) as well as different border width. The last three markers are shown using same color and have fixed border width.

The size of markers is defined in `"em"` units.

Parameter `title` is needed only if you want to handle click events, for example, to select a particular point. See specific section below with more details below.

[This example](https://svelte.dev/repl/edc090cb1c184fee88aedebd8731a87e?version=4.2.18) in Svelte REPL.


### Segments

Use this component if you want to show a series of line segments. The component has four mandatory parameters — x- and y-coordinates of start and end points of the segments. The coordinates can be provided as Javascript array or as a `Vector` instance.

Here is an example of using the component with all available parameters:

```svelte
<script>
   import { Axes, Segments } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[-4, 4]} limY={[0, 10]}>
   <Segments
      xStart={[-3, -2, -1, 0, 1, 2, 3]}
      yStart={[1, 2, 3, 4, 3, 2, 1]}
      xEnd={[-3, -2, -1, 0, 1, 2, 3]}
      yEnd={[9, 8, 7, 6, 7, 8, 9]}
      lineColor="#ff0000"
      lineType={3}
      lineWidth={2}
   />
</Axes>
```

Parameter `lineType` can have the following values `1` - solid, `2` - dashed, `3` - dotted, `4` - dash dot lines.

[This example](https://svelte.dev/repl/41285c86fe6e4e6c9abc50fb08faa7d9?version=4.2.18) in Svelte REPL.


### Rectangles

Use this component if you want to show a series of rectangles. The component has four mandatory parameters — coordinates of left-top corner, width and height of each rectangle. The coordinates and sizes can be provided as Javascript array or as a `Vector` instance.

Here is an example of using the component with all available parameters:


```svelte
<script>
   import { Axes, Rectangles } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[-4, 4]} limY={[0, 10]}>
   <Rectangles
      left={[-3, -2, -1, 0, 1, 2, 3]}
      top={[9, 8, 7, 6, 7, 8, 9]}
      width={[0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75]}
      height={[8, 6, 7, 5, 6, 7, 8]}
      faceColor="#ff000080"
      borderColor="#ff0000"
      lineWidth={2}
   />
</Axes>
```

[This example](https://svelte.dev/repl/8ef24c0380474d2a9ff15ab66f2d0572?version=4.2.18) in Svelte REPL.

### Area

Use this component if you want to show a filled area of arbitrary shape. The component has two mandatory parameters — x- and y-coordinates of the corner points of the area. The coordinates can be provided as Javascript array or as a `Vector` instance.

Here is an example of using the component with all available parameters:

```svelte
<script>
   import { Axes, Area } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[0, 6]} limY={[-7, 21]}>
   <Area
      xValues={[3, 2, 1, 4, 5]}
      yValues={[-5, 10, 20, 10, -2]}
      fillColor="#ffc00080"
      lineColor="#ff0000"
      lineWidth={2}
      lineType={3}
   />
</Axes>
```

[This example](https://svelte.dev/repl/478b77501386469b93a1160e46809644?version=4.2.18) in Svelte REPL.

### Text labels

This component is similar to `Points` but it let you show any text values on the plot instead of markers. You can specify the location of the values relative to the points, rotation angle and other settings.

Here is an example of using the component with all available parameters:

```svelte
<script>
   import { Axes, TextLabels } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[-4, 4]} limY={[-1, 10]}>
   <TextLabels
      xValues={[-3, -2, -1, 0, 1, 2, 3]}
      yValues={[9, 4, 1, 0, 1, 4, 9]}
      labels={["😀", "$$$", "oo", "x", "oo", "$$$", "😀"]}
      pos={0}
      faceColor="#ffcc0080"
      borderColor="#aa0000"
      borderWidth={1}
      textSize={4}
   />
</Axes>
```

Parameter `pos` defines position of the text label relative to the coordinate of corresponding point. It can be one of the following: `0` (on the point), `1` (under), `2` (on the left side), `3` (over), `4` (on the right side).

It can be specified as a single value, like in the example above, or as array of values — individual for each label.

Same about parameter `labels` — it can be a single value for all points or an array of individual values for each point like in the example above.

[This example](https://svelte.dev/repl/ae58b8d4e92f4e748a679b60c4876347?version=4.2.18) in Svelte REPL.


### Bars

Use this component to add bar series to the plot. You just need to specify x-coordinates of middle points of each bar and y-coordinate of its top.

Here is an example of using the component with all available parameters:

```svelte
<script>
   import { Axes, Bars } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[-4, 4]} limY={[-1, 10]}>
   <Bars
      xValues={[-3, -2, -1, 0, 1, 2, 3]}
      yValues={[9, 4, 1, 0.1, 1, 4, 9]}
      faceColor="#ffcc0080"
      borderColor="#ff0000"
      borderWidth={2}
   />
</Axes>
```

[This example](https://svelte.dev/repl/3afb9d8acd824d64ba1c42226fb01fa9?version=4.2.18) in Svelte REPL.


### Lines

Use this component to show lines connected sequence of points (polyline), usually known as line series. Requires two sequence of values, x- and y-coordinates of the points, which can be specified as Javascript array or as a `Vector` instance (class from `mdatools` package).

Here is an example of using the component with all available parameters:

```svelte
<script>
   import { Axes, Lines } from 'svelte-plots-basic/2d';
</script>

<Axes limX={[-4, 4]} limY={[-1, 10]}>
   <Lines
      xValues={[-3, -2, -1, 0, 1, 2, 3]}
      yValues={[9, 4, 1, 0, 1, 4, 9]}
      lineColor="#ff0000"
      lineWidth={2}
      lineType={3}
   />
</Axes>
```

The line parameters are similar to the ones used in `Segments` component.

[This example](https://svelte.dev/repl/2006ca1441f845eb9ed40b3e583d0094?version=4.2.18) in Svelte REPL.


### Multilines

This component is similar to `Lines` but it lets you showing multiple lines whose x-coordinates are the same but each line has its own y-coordinates. The parameters are similar to `Lines` component except one — `yValues` must be provided as an instance of `Matrix` class (from `mdatools` package). Every column of this matrix contains y-coordinates of corresponding line.

Here is an example of using the component with all available parameters:

```svelte
<script>
   import { Axes, Multilines } from 'svelte-plots-basic/2d';
   import { Vector, cbind } from 'mdatools/arrays';

   // create x-values
   const x = Vector.seq(0, 15, 0.1);

   // compute y-values for four lines
   const y1 = x.apply(v => Math.sin(v));
   const y2 = y1.add(0.2);
   const y3 = y2.add(0.2);
   const y4 = y3.add(0.2);

   // combine y-values into a matrix
   const Y = cbind(y1, y2, y3, y4);
</script>

<Axes limX={[0, 15]} limY={[-2, 2]}>
   <Multilines
      xValues={x}
      yValues={Y}
      lineColor="#ff0000"
      lineWidth={2}
      lineType={1}
   />
</Axes>
```

[This example](https://svelte.dev/repl/d642a8fb78fd4a4f8381438d9bf427a2?version=4.2.18) in Svelte REPL.


### Legend

This component makes sense to use if you show several series on the same plot. It has two arguments — a position of the legend and array with JSON objects specifying legend text and parameters of the corresponding series.

Here is an example:

```svelte
<script>
   import { Axes, Lines, Points, Legend } from 'svelte-plots-basic/2d';
	 import {Vector} from 'mdatools/arrays';

   // create x-values
   const x = Vector.seq(-5, 5, 0.1);

   // compute y-values
   const y1 = x.apply(v => Math.pow(v, 2));
   const y2 = x.apply(v => Math.pow(v, 3));
   const y3 = x.apply(v => Math.pow(v, 4));
</script>

<Axes limX={[-5, 5]} limY={[-20, 20]}>

   <!-- series 1: dotted red line -->
   <Lines xValues={x} yValues={y1} lineColor="red" lineType={3} />

   <!-- series 2: solid blue line and circle markers -->
   <Lines xValues={x} yValues={y2} lineColor="blue" lineType={1} />
   <Points xValues={x} yValues={y2} borderColor="blue" faceColor="white"/>

   <!-- series 3: markers in form of diamonds with green stroke and yellow fill -->
   <Points xValues={x} yValues={y3} marker={5} faceColor="yellow" borderColor="green"  />

   <!-- legend with one JSON for each series -->
   <Legend
      position="right"
      items = {[
         {"label": 'y=x^2', "lineType": 3, "lineColor": "red"},
         {"label": "y=x^3", "lineType": 1, "lineColor": "blue", "marker": 1, "faceColor": "white", "borderColor": "blue"},
         {"label": "y=x^4", "marker": 5, "faceColor": "yellow", "borderColor": "green"},
      ]}
   />
</Axes>
```

The `position` parameter can be one of the follows: `"topleft"`, `"top"`, `"topright"`, `"right"`, `"bottomright"` and so on.

[This example](https://svelte.dev/repl/1c5e21e2153a4229afb630809fe545bd?version=4.2.18) in Svelte REPL.

### Heatmap

This component lets you visualizing values of a matrix (instance of class `Matrix`). Matrix with values is the only mandatory parameter for the component, the other two are optional.

```svelte
<script>
   import { Axes, Heatmap } from 'svelte-plots-basic/2d';
   import { matrix, vector } from 'mdatools/arrays';

   // create values for a matrix
   const values = matrix([0.9, 0.7, 0.5, 0.3, 0.9, 0.1, 0.1, 0.5, 0.9], 3, 3);

	 // create vector of breaks
	 const breaks = vector([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);

	// colmap
	const colmap = ["blue", "green", "yellow", "orange", "red"]
</script>

<Axes limX={[0, 4]} limY={[0, 4]}>
   <Heatmap
	   {values}
		{breaks}
		{colmap}
   />
</Axes>
```

Parameter `breaks` defines vector (instance of `Vector` class) with interval breaks. If a value from the matrix `values` falls into one of the intervals defined by `breaks`, it will be shown using a corresponding color from the `colormap` parameter. For example if value is between 0.2 and 0.4 it will be shown as green rectangle in the example above.

Both `breaks` and `colmap` are defined automatically by default.

[This example](https://svelte.dev/repl/fde87fe5dad24c419314eeb7b9fa469f?version=4.2.18) in Svelte REPL.


### Colormap legend

This component is useful when you have series of points or other primitives (including heatmap) shown using different colors. Especially if the colors are sequential.

Here is an example from above with added `ColormapLegend`  component.

```svelte
<script>
   import { Axes, Heatmap, ColormapLegend } from 'svelte-plots-basic/2d';
   import { matrix, vector } from 'mdatools/arrays';

   // create values for a matrix
   const values = matrix([0.9, 0.7, 0.5, 0.3, 0.9, 0.1, 0.1, 0.5, 0.9], 3, 3);

	// create vector of breaks
	const breaks = vector([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);

	// colmap
	const colmap = ["blue", "green", "yellow", "orange", "red"]
</script>

<Axes limX={[0, 4]} limY={[0, 4]}>
   <Heatmap
	   {values}
		{breaks}
		{colmap}
   />

	<ColormapLegend {breaks} {colmap} />
</Axes>
```

[This example](https://svelte.dev/repl/f91380c18b3346599b45baf06b9b8819?version=4.2.18) in Svelte REPL.

In addition to two mandatory parameters, `breaks` and `colmap`, it has the following optional parameters:

* `decNum` — number of decimals to show the breaks with (by default 1).
* `labels` — optional vector with labels for interval boundaries (instead of breaks values).
* `labelColor` — color of the label values (by default `'#909090'`).
* `fontSize`— font size for the labels in em (by default `0.85`).


### Handle mouse events

Elements of points and bar series as well as axes component. When user clicks on axes area outside any series elements, the `Axes` component dispatches event `'axesclick'`.

When user clicks on element (marker) of `Points` component it dispatches `'markerclick'` event supplements with data value which correspond to the marker index (position of the values with marker coordinates).

Here is an example which utilizes this functionality to select a point (marker) when user clicks on it and removes the selection if user clicks outside the markers (but inside the plotting area).

```svelte
<script>
   import { Axes, XAxis, YAxis, Box, Points, Lines, TextLabels } from 'svelte-plots-basic/2d';

	// values for series
   const x = [2000, 2001, 2002, 2003];
   const y = [179.7, 185.3, 189.0, 193.5]

   // currently selected bar
   let selected = -1;

	 // handler click event on marker
   function selectMarker(e) {
      const id = parseInt(e.detail.elementID)
      if (id >= 0) {
         selected = Number.parseFloat(e.detail.elementID);
      }
   }

	 // handler click event on axes
   function resetSelection(e) {
      selected = -1;
   }
</script>

<Axes limX={[1999, 2004]} limY={[0, 220]}
		xLabel="Years" yLabel="bn US$ PPP" title="GDP of Denmark"
		on:markerclick={selectMarker}
	  on:axesclick={resetSelection}
	>

	<Lines xValues={x} yValues={y} />
	<Points xValues={x} yValues={y} markerSize="1.5" faceColor="#fff" borderWidth="2"/>

	{#if selected > -1}
	<Points xValues={[x[selected]]} yValues={[y[selected]]} markerSize="1.6" faceColor="#ffcc00"
		borderColor="crimson" borderWidth="2"/>
	<TextLabels xValues={[x[selected]]} yValues={[y[selected]]} labels={[y[selected]]} pos={3} />
	{/if}

	<XAxis slot="xaxis" ticks={x}/>
	<YAxis slot="yaxis" showGrid={true} />
	<Box slot="box" />

</Axes>
```

Play with [this example](https://svelte.dev/repl/e4705e10f1604e4cabc21f5543376717?version=4.2.18) in Svelte REPL.


### Save plot to a file

From version *2.3.0* it is possible to save any plot as an SVG or PNG file. In order to use this you need to add additional parameter to `Axes` component, `downloadLinks`. This parameter may have the following values:

* `"none"` — turns this functionality off (default value).
* `"hover"` — buttons with download options appear when user hovers mouse over the plot.
* `"fixed"` — buttons with download options are always shown.

You can also specify parameter `fileName` which should be the desired filename for the plot without extension (e.g. `fileName="myplot"`).

In case of SVG file, the plot is downloaded as is. In case of PNG the plot is being rasterized and you can define additional options, also as parameters of `Axes` component:

* `pngWidth` — width of PNG image in cm (default is 8 cm).
* `pngHeight` — height of PNG image in cm (default is 8 cm).
* `pngRes` — resolution of the PNG image in pixels per inch (default is 300).

If the first two parameters do not match the aspect ratio of the plot they will be adjusted accordingly.

Here is a full example:

```svelte
<script>
   import { Axes, XAxis, YAxis, Box, BarSeries } from 'svelte-plots-basic/2d';
   import { Vector } from 'mdatools/arrays';

   // generate random values from normal distribution
   const x = Vector.randn(200, 0, 1);
   const y = Vector.randn(200, 0, 2);
</script>

<div class="plot-container">
   <Axes
      limX={[-6, 6]} limY={[-5, 6]}
      xLabel="x" yLabel="y"
      downloadLinks="hover"
      fileName="myplot"
      pngWidth={5}
      pngHeight={5}
      pngRes={300}
   >

      <ScatterSeries xValues={x} yValues={y} />
      <XAxis slot="xaxis" />
      <YAxis slot="yaxis" />
      <Box slot="box" />
   </Axes>
</div>
```

[This example](https://svelte.dev/repl/29a021768ca14496a1f659f186958a9a?version=4.2.18) in Svelte REPL.

## Quick start (3D plots)

3D plots can be created similar to 2D plots but its components must be imported from `svelte-plots-basic/3d`. Plus all elements must have three coordinates (x, y and z). Plot elements include axes pane, x-, y- and z-axis, as well as points, lines, segments and mesh series.

The plots are also made as SVG elements, by using [isometric projection](https://en.wikipedia.org/wiki/Isometric_projection). The orientation of the projection plane is defined by parameters `phi` and `theta`. Parameter `zoom` defines the distance between the plane and the scene.

Here is an example of simple 3D scatter plot:

```svelte
<script>
  import { Mesh, Points, Axes, XAxis, YAxis, ZAxis } from 'svelte-plots-basic/3d';
	import { Matrix, Vector } from 'mdatools/arrays';

  // generate coordinates for scatter plot
  const xValues = Vector.rand(100, -9, 9);
  const zValues = Vector.rand(100, -9, 9);
  const yValues = xValues.add(zValues).divide(2).apply(v => 2 - v);

  // orientation and zoom for scene
  let phi = -25.264 / 180 * Math.PI
  let theta = 215 / 180 * Math.PI;
  let zoom = 0.5;
</script>

<Axes limX={[-10, 10]} limY={[-10, 10]} limZ={[-10, 10]} {zoom} {phi} {theta}>
	<Points {xValues} {yValues} {zValues} />
	<XAxis showGrid={true} title="X" slot="xaxis" />
	<YAxis showGrid={true} title="Y" slot="yaxis" />
	<ZAxis showGrid={true} title="Z" slot="zaxis" />
</Axes>
```

[This example](https://svelte.dev/repl/2294eecba7d7477ab9a09c1734d32ac2?version=4.2.18) in Svelte REPL.

You can also add `Lines`, `Segments` and `Mesh` series to 3D plots.


