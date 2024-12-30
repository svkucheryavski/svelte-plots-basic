<!--
@component Adds axis tick labels.

   Main properties:
   - `tickCoords` - coordinates of the positions of the ticks line segments in world coordinates.
   - `textColor` - color of the labels' text.
   - `tickLabels` - array with the labels (strings).
   - `pos` - position of the labels related to coordinates (`0` - on, `1` - under - default, `2` - left, `3` - over, `4` - right).
   - `las` - orientation of the labels (`1` - horizontal - default, `2` - vertical).

   **Description:**

   The ticks coordinates are provided in form of nested arrays. Each element of this array contains
   `Vector` or `Array` with the coordinates in world (not screen) coordinate system:
   - `tickCoords[0][0]` - x-coordinates of start points of tick segments.
   - `tickCoords[1][0]` - x-coordinates of end points of tick segments.
   - `tickCoords[0][1]` - y-coordinates of start points of tick segments.
   - `tickCoords[1][1]` - y-coordinates of end points of tick segments.

   ```
-->
<script>

   import { getContext } from 'svelte';
   import { transformCoords } from '../methods';
   import { LABELS_MARGIN } from '../constants';


   /** @type {Props} */
   let {
	   tickCoords,  // nested array with tick coordinates
      textColor,   // color of tick labels
      tickLabels,  // array with tick labels
      pos = 1,     // position of tick labels
      las = 1,     // rotation of tick labels (1 - horizontal, 2 - vertical)
   } = $props();


   // reactive selection of labels' position and line style
   let textAnchor = $derived((['middle', 'middle', 'start', 'middle', 'end'])[pos]);
   let textStyleStr = $derived(`fill:${textColor};`);

   // get axes context and compute screen coordinates
   const axes = getContext('axes');
   let x = $derived(transformCoords(tickCoords[1][0], axes.tX()));
   let y = $derived(transformCoords(tickCoords[1][1], axes.tY()));

   // compute coordinate shifts based on position and plot scales
   let m = $derived(LABELS_MARGIN[axes.scales().plot]);
   let dx = $derived(([0, 0, m,  0, -m])[pos]);
   let dy = $derived(([0, m, 0, -m, 0])[pos]);
</script>

<g class="tick-labels" style={textStyleStr} >
   {#if las === 2 && pos === 4}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={0} dy={dx*1.25} transform={`rotate(-90, ${x[i]}, ${y[i]})`} text-anchor={"middle"}>{@html tickLabels[i]}</text>
   {/each}
   {:else if las === 2 && pos === 1}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={-dy/2} dy={0} transform={`rotate(-90, ${x[i]}, ${y[i]})`} text-anchor={"end"}>{@html tickLabels[i]}</text>
   {/each}
   {:else}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={dx} dy={dy} text-anchor={textAnchor}>{@html tickLabels[i]}</text>
   {/each}
   {/if}
</g>
