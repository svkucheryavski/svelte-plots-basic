<!--
@component Adds a series of lines connecting points with provided coordinates (polyline).

   Main properties:
   - `xValues` - array of vector with x-coordinates of the points.
   - `yValues` - array of vector with y-coordinates of the points.
   - `lineColor` - lines color, default: `Colors.PRIMARY`.
   - `lineWidth` - width (thickness) of the lines in pixels, defailt: `1`.
   - `lineType` -  type of lines (`1` - solid, `2` - dashed, `3` - dotted, `4` - dashdot).
   - `title` - title of the line series group.
   - `onclick` - function (callback) to be called when user clicks on a polyline.

   Example:
   ```jsx
   <script>
      import { Axes, Lines } from 'svelte-plots-basic/2d';

      const xValues = [-3, -2, -1, 0, 1, 2, 3];
      const yValues = [9, 4, 1, 0, 1, 4, 9];
   </script>

   <Axes limX={[-4, 4]} limY={[-2, 10]}>
      <Lines {xValues} {yValues}  />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
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
   const xv = $derived(checkCoords(xValues, 'Lines'));
   const yv = $derived(xv ? checkCoords(yValues, 'Lines', xv.length) : null);

   // get axes context and compute coordinates of polyline
   const axes = getContext('axes');
   const p = $derived(xv && yv ? val2p(xv, yv, axes.tX(), axes.tY()) : null);

   // reactive variables for coordinates of data points in pixels
   const lineStyleStr = $derived(`fill:transparent;stroke:${lineColor};stroke-width: ${lineWidth}px; stroke-dasharray:${LINE_STYLES[axes.scales().plot][lineType-1]}`);
</script>

{#if p}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g onclick={(e) => handleClick(e, 'polyline', onclick)}
   class="series series-line" style={lineStyleStr} title={title} >
   <polyline class="line" points={p}/>
</g>
{/if}

