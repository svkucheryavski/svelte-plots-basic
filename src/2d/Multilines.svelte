<!--
@component Adds a series of polylines (like `<Lines>` but with several of those).

   Main properties:
   - `xValues` - array of vector with x-coordinates of the points.
   - `yValues` - Matrix (object of class `Matrix` from `mdatools/array`) with y-coordinates of the points.
   - `lineColor` - lines color, default: `Colors.PRIMARY`.
   - `lineWidth` - width (thickness) of the lines in pixels, defailt: `1`.
   - `lineType` -  type of segment lines (`1` - solid, `2` - dashed, `3` - dotted, `4` - dashdot).
   - `title` - title of the multiline series group.
   - `onclick` - function (callback) to be called when user clicks on a polyline.

   Example:
   ```jsx
   <script>
      import { Vector, cbind } from 'mdatools/arrays';
      import { Axes, Multilines } from 'svelte-plots-basic/2d';

      const xValues = Vector.seq(0, 100, 100);
      const YY = cbind(
         xValues.apply(v => Math.sin(v)),
         xValues.apply(v => Math.sin(v + 0.5) + 0.1),
         xValues.apply(v => Math.sin(v - 0.5) - 0.1),
         xValues.apply(v => Math.sin(v + 1.0) + 0.2),
         xValues.apply(v => Math.sin(v - 1.0) - 0.2)
      )
   </script>

   <Axes limX={[0, 10]} limY={[-1.2, 1.2]}>
      <Multilines {xValues} {yValues}  />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
   import { ismatrix } from 'mdatools/arrays';
   import { Colors } from '../constants';
   import { val2p, checkCoords, handleClick } from '../methods';
   import { LINE_STYLES } from '../constants';

   /** @type {Props} */
   let {
	   xValues,                       // vector or array with x-coordinates of the points
      yValues,                       // vector or array with y-coordinates of the points
      lineColor = Colors.PRIMARY,    // color of segment lines
      lineType = 1,                  // type of segment lines (1 - solid, 2 - dashed, 3 - dotted, 4 - dashdot)
      lineWidth = 1,                 // width (thickness) of segment lines
      title = '',                    // title of the point series group
      onclick,                       // function to be called if onclick event fires
   } = $props();

   // check user provided coordinates
   const xv = $derived(checkCoords(xValues, 'Multilines'));
   const yv = $derived.by(() => {

      if (!xv) return null;

      if (!ismatrix(yValues)) {
         console.error('Multilines: parameter "yValues" must be a matrix.');
         return null;
      }

      if (xv.length !== yValues.nrows) {
         console.error('Multilines: parameter "xValues" must have the same number of values as number of rows in "yValues".');
      }

      return yValues;
   });


   // get axes context and compute coordinates of the polylines
   const axes = getContext('axes');
   const pp = $derived.by(() => {
      if (!xv || !yv) return null;
      const lpp = new Array(yv.ncols);
      for (let i = 0; i < lpp.length; i++) {
         lpp[i] = val2p(xv, yv.getcolumn(i + 1), axes.tX(), axes.tY());
      }
      return lpp;
   });

   // reactive variables for coordinates of data points in pixels
   const lineStyleStr = $derived(`fill:transparent;stroke:${lineColor};stroke-width: ${lineWidth}px; stroke-dasharray:${LINE_STYLES[axes.scales().plot][lineType-1]}`);
</script>

{#if pp && pp.length > 0}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g  onclick={(e) => handleClick(e, 'polyline', onclick)} class="series series-multiline" style={lineStyleStr} {title}>
   {#each pp as p}
   <polyline class="line" points={p}/>
   {/each}
</g>
{/if}

