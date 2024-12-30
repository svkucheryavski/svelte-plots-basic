<!--
@component Draws line segments for axis elements (axis, ticks, etc.).

   Main properties:
   - `lineCoords` - coordinates of the line segments as 2D array.
   - `lineColor` - color of the box line, default: `Colors.DARKGRAY`.
   - `lineWidth` - width of box line in pixels, default: `1`.
   - `lineType` - line type (`1` - solid (default), `2` - dashed, `3` - dotted, `4` - dashdot).
   - `className` - string with classname to be added to `<g></g>` tag wrapping the lines.

   **Description:**

   The coordinates msut be provided in form of nested arrays. Each element of this array contains
   `Vector` or `Array` with the coordinates in world (not screen) coordinate system:
   - `lineCoords[0][0]` - x-coordinates of start points of segments.
   - `lineCoords[1][0]` - x-coordinates of end points of segments.
   - `lineCoords[0][1]` - y-coordinates of start points of segments.
   - `lineCoords[1][1]` - y-coordinates of end points of segments.

   ```
-->
<script>
   import { getContext } from 'svelte';
   import { Colors, LINE_STYLES } from '../constants.js';
   import { transformCoords } from '../methods.js';


   /** @type {Props} */
   let {
      lineCoords = [],               // coordinates of start and end points of the lines
      lineColor = Colors.DARKGRAY,   // line color
      lineType = 1,                  // line type
      lineWidth = 1,                 // lined width (thickness)
      className = ''                 // CSS class name for the component
   } = $props();

   // get axes context and adjust x margins
   const axes = getContext('axes');

   // reactive variables for coordinates of axis lines
   let x1 = $derived(transformCoords(lineCoords[0][0], axes.tX()));
   let x2 = $derived(transformCoords(lineCoords[1][0], axes.tX()));
   let y1 = $derived(transformCoords(lineCoords[0][1], axes.tY()));
   let y2 = $derived(transformCoords(lineCoords[1][1], axes.tY()));

   // line style
   let lineStyleStr = $derived(`stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${LINE_STYLES[axes.scales().plot][lineType-1]}`);
</script>

{#if x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined}
<g class={className}>
   {#each x1 as v, i}
   <line vector-effect="non-scaling-stroke" x1={x1[i]} x2={x2[i]} y1={y1[i]} y2={y2[i]} style={lineStyleStr} />
   {/each}
</g>
{/if}
