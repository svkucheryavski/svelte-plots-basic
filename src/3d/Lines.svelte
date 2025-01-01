<!--
@component Adds a series of lines connecting points with provided coordinates (polyline).

   Main properties:
   - `xValues` - array of vector with x-coordinates of the points.
   - `yValues` - array of vector with y-coordinates of the points.
   - `zValues` - array of vector with z-coordinates of the points.
   - `lineColor` - lines color, default: `Colors.PRIMARY`.
   - `lineWidth` - width (thickness) of the lines in pixels, defailt: `1`.
   - `lineType` -  type of lines (`1` - solid, `2` - dashed, `3` - dotted, `4` - dashdot).
   - `title` - title of the line series group.

   Example:
   ```jsx
   <script>
      import { Axes, Lines } from 'svelte-plots-basic/3d';

      const xValues = [-3, -2, -1, 0, 1, 2, 3];
      const yValues = [ 9,  4,  1, 0, 1, 4, 9];
      const zValues = [-3, -2, -1, 0, 1, 2, 3];
   </script>

   <Axes limX={[-4, 4]} limY={[-2, 10]} limZ={[-4, 4]}>
      <Lines {xValues} {yValues} {zValues} />
   </Axes>
   ```
-->
<script>
   import { cbind } from 'mdatools/arrays';
   import { getContext } from 'svelte';
   import { Colors, LINE_STYLES } from '../constants';
   import { checkCoords, transform3D } from '../methods';

   let {
	   xValues,
      yValues,
      zValues,
      lineWidth = 1,
      lineColor = Colors.PRIMARY,
      lineType = 1,
      title = '',
   } = $props();


   /* convert 2D coordinates to points string */
   function coords2points(s) {
      let p = '';
      for (let i = 0; i < s.x.length; i++) {
         p += s.x[i] + ',' + s.y[i] + ' ';
      }
      return p;
   }

   // check user defined coordinates
   const ux = $derived(checkCoords(xValues, 'Lines (3D)'));
   const uy = $derived(ux ? checkCoords(yValues, 'Lines (3D)', ux.length) : null);
   const uz = $derived(uy ? checkCoords(zValues, 'Lines (3D)', ux.length) : null);

   // combine world coordinates to matrices
   const uW = $derived(ux && uy && uz ? cbind(ux, uy, uz) : null);

   // get axes context and compute screen coordinates
   const axes = getContext('axes');
   const s = $derived(uW ? transform3D(uW, axes.tM()) : null);
   const p = $derived(s ? coords2points(s) : null);

   // reactive variables for coordinates of data points in pixels
   const lineStyleStr = $derived(`fill:transparent;stroke:${lineColor};stroke-width: ${lineWidth}px; stroke-dasharray:${LINE_STYLES[axes.scale()][lineType-1]}`);
</script>

{#if p}
   <g class="series series-line" style={lineStyleStr} title={title}>
      <polyline class="line" points={p}/>
   </g>
{/if}

