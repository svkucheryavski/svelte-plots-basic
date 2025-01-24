<!--
@component Adds a series with line segments.

   Main properties:
   - `xStart` - vector or array with x-coordinates of starting points.
   - `xEnd` -  or array with x-coordinates of end points.
   - `yStart` - vector or array with y-coordinates of starting points.
   - `yEnd` - vector or array with y-coordinates of end points.
   - `lineColor` - color of segment lines, default: `Colors.PRIMARY`.
   - `lineType` -  type of segment lines (`1` - solid, `2` - dashed, `3` - dotted, `4` - dashdot).
   - `lineWidth` - width (thickness) of segment lines in pixels, default: `1`.
   - `onclick` - function (callback) to be called when user clicks on any segment.

   Example:

   ```svelte
   <script>
      import { Axes, Segments } from 'svelte-plots-basic/2d';

      const xStart = [1, 2, 3, 4];
      const xEnd = [1, 2, 3, 4];
      const yStart = [-2, -1, 0, -1, -2];
      const yEnd = [2, 1, 0, 1, 2];
   </script>

   <Axes limX={[0, 5]} limY={[-3, 3]} >
      <Segments {xStart} {yStart} {xEnd} {yEnd} lineColor="red" lineType={2} />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
   import { Colors } from '../constants';
   import { checkCoords, transformCoords, handleClick } from '../methods';
   import { LINE_STYLES } from '../constants';

   let {
	   xStart,                        // vector or array with x-coordinates of starting points
      xEnd,                          // vector or array with x-coordinates of end points
      yStart,                        // vector or array with y-coordinates of starting points
      yEnd,                          // vector or array with y-coordinates of end points
      lineColor = Colors.PRIMARY,    // color of segment lines
      lineType = 1,                  // type of segment lines (1 - solid, 2 - dashed, 3 - dotted, 4 - dashdot)
      lineWidth = 1,                 // width (thickness) of segment lines
      onclick,                       // function to be called if onclick event fires
   } = $props();


   // check user defined coordinates
   const sx = $derived(checkCoords(xStart, 'Segments'));
   const sy = $derived(sx ? checkCoords(yStart, 'Segments', sx.length) : null);
   const ex = $derived(sy ? checkCoords(xEnd, 'Segments', sx.length) : null);
   const ey = $derived(ex ? checkCoords(yEnd, 'Segments', sx.length) : null);

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const x1 = $derived(sx ? transformCoords(sx, axes.tX()) : null);
   const x2 = $derived(ex ? transformCoords(ex, axes.tX()) : null);
   const y1 = $derived(sy ? transformCoords(sy, axes.tY()) : null);
   const y2 = $derived(ey ? transformCoords(ey, axes.tY()) : null);

   // reactive variables for coordinates of data points in pixels (and line style)
   const lineStyleStr = $derived(`stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${LINE_STYLES[axes.scales().plot][lineType-1]}`);

   // local status
   const isOk = $derived(x1 && x2 && y1 && y2);
</script>

{#if isOk}
   <!-- svelte-ignore a11y_click_events_have_key_events -->
   <!-- svelte-ignore a11y_no_static_element_interactions -->
   <g class="series series-segment" style={lineStyleStr} onclick={(e) => handleClick(e, 'line', onclick)}>
   {#each x1 as v, i}
      <line x1={x1[i]} x2={x2[i]} y1={y1[i]} y2={y2[i]} />
   {/each}
   </g>
{/if}

