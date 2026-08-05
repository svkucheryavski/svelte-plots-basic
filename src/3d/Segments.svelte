<!--
@component Adds a series with line segments.

   Main properties:
   - `xStart` - vector or array with x-coordinates of starting points.
   - `xEnd` -  or array with x-coordinates of end points.
   - `yStart` - vector or array with y-coordinates of starting points.
   - `yEnd` - vector or array with y-coordinates of end points.
   - `zStart` - vector or array with z-coordinates of starting points.
   - `zEnd` - vector or array with z-coordinates of end points.
   - `lineColor` - color of segment lines, default: `Colors.PRIMARY`.
   - `lineType` -  type of segment lines (`1` - solid, `2` - dashed, `3` - dotted, `4` - dashdot).
   - `lineWidth` - width (thickness) of segment lines in pixels, default: `1`.
   - `title` - title of the segment series group.

   Example:
   ```jsx
   <script>
      import { Axes, Segments } from 'svelte-plots-basic/3d';

      const xStart = [1, 2, 3, 4];
      const xEnd = [1, 2, 3, 4];
      const yStart = [-2, -1, 0, -1, -2];
      const yEnd = [2, 1, 0, 1, 2];
      const zStart = [1, 2, 3, 4];
      const zEnd = [1, 2, 3, 4];
   </script>

   <Axes limX={[0, 5]} limY={[-3, 3]} >
      <Segments {xStart} {yStart} {zStart} {xEnd} {yEnd} {zEnd} lineColor="red" lineType={3} />
   </Axes>
   ```
-->
<script>
   import { cbind } from 'mdatools/arrays';
   import { getContext } from 'svelte';
   import { Colors, LINE_STYLES } from '../constants';
   import { checkCoords, transform3D, normalizeLineType } from '../methods';


   let {
	   xStart,
      xEnd,
      yStart,
      yEnd,
      zStart,
      zEnd,
      lineColor = Colors.PRIMARY,
      lineType = 1,
      lineWidth = 1,
      title = '',
   } = $props();


   // check user defined coordinates
   const ux1 = $derived(checkCoords(xStart, 'Segments (3D)'));
   const uy1 = $derived(ux1 ? checkCoords(yStart, 'Segments (3D)', ux1.length) : null);
   const uz1 = $derived(uy1 ? checkCoords(zStart, 'Segments (3D)', ux1.length) : null);

   const ux2 = $derived(uz1 ? checkCoords(xEnd, 'Segments (3D)', ux1.length) : null);
   const uy2 = $derived(ux2 ? checkCoords(yEnd, 'Segments (3D)', ux1.length) : null);
   const uz2 = $derived(uy2 ? checkCoords(zEnd, 'Segments (3D)', ux1.length) : null);
   const validLineType = $derived(normalizeLineType(lineType, 'Segments (3D)'));

   // combine world coordinates to matrices
   const uW1 = $derived(ux1 && uy1 && uz1 ? cbind(ux1, uy1, uz1) : null);
   const uW2 = $derived(ux2 && uy2 && uz2 ? cbind(ux2, uy2, uz2) : null);

   // get axes context and compute screen coordinates
   const axes = getContext('axes');
   const s1 = $derived(uW1 ? transform3D(uW1, axes.tM()) : null);
   const s2 = $derived(uW2 ? transform3D(uW2, axes.tM()) : null);

   const lineStyleStr = $derived(`stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${LINE_STYLES[axes.scale()][validLineType - 1]}`);
</script>

{#if s1 && s2}
<g class="series series-segments" data-title={title} style={lineStyleStr}>
   {#each s1.x as v, i}
      <line x1={s1.x[i]} x2={s2.x[i]} y1={s1.y[i]} y2={s2.y[i]} />
   {/each}
</g>
{/if}
