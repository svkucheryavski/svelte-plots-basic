<!--
@component Adds a series of rectangles.

   Main properties:
   - `left` - array or vector with world coordinates of left side of the rectangles.
   - `top` - array or vector with world coordinates of left side of the rectangles.
   - `width` - width of the rectangles (one value or array/vector with individual values).
   - `height` - height of the rectangles (one value or array/vector with individual values).
   - `facColor` - face color of the rectangles (same for all).
   - `lineColor` - border color of each rectangle.
   - `lineWidth` - width (thickness) of border lines in pixels.
   - `className`- CSS class name for the labels group, default: `'series-rect'`.
   - `onclick` - function (callback) to be called when user clicks on any rectangle.


   Example:
   ```jsx
   <script>
      import { Matrix } from 'mdatools/arrays';
      import { Axes, Rectangles } from 'svelte-plots-basic/2d';

      const left = [0, 10, 20, 30];
      const top = [10, 20, 30, 40];
      const width = 5;
      const height = 10;
   </script>

   <Axes limX={[0, 40]} limY={[0, 50]}>
      <Rectangles {left} {top} {width} {height} lineColor="red" faceColor="pink"  />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
   import { Vector } from 'mdatools/arrays';
   import { Colors } from '../constants';
   import { checkCoords, transformCoords, transformObjects, handleClick } from '../methods';

   /** @type {Props} */
   let {
	   left,                          // array of vector with coordinates of left sides of the bars
      top,                           // array of vector with coordinates of top sides of the bars
      width,                         // single value (same for all) or vector/array with bar width
      height,                        // single value (same for all) or vector/array with bar height
      faceColor = Colors.PRIMARY,    // color of bar faces (fill)
      lineColor = faceColor,       // color of bar borders
      lineWidth = 1,                 // width (thickness) of bar border lines
      className = 'series-rect',     // CSS class name of the SVG group
      onclick,                       // function to be called if onclick event fires
   } = $props();

   // process provided values and compute world coordinates of rectangles
   const l = $derived(checkCoords(left, 'Rectangles (left)'));
   const t = $derived(l ? checkCoords(top, 'Rectangles (top)', l.length) : null);
   const w = $derived(t ? (typeof width !== 'object' ? Vector.fill(width, l.length) : width) : null);
   const h = $derived(t ? (typeof height !== 'object' ? Vector.fill(height, l.length) : height) : null);

   // get axes context and compute screen coordinates
   const axes = getContext('axes');

   const rx = $derived(l ? transformCoords(l, axes.tX()) : null);
   const ry = $derived(t ? transformCoords(t, axes.tY()) : null);
   const rw = $derived(w ? transformObjects(w, axes.tX()) : null);
   const rh = $derived(h ? transformObjects(h, axes.tY()) : null);

   // styles for bars and labels
   const barsStyleStr = $derived(`fill:${faceColor};stroke:${lineColor};stroke-width:${lineWidth}px;`);

   // check if all coordinates are correct
   const isOk = $derived(rx && ry && rw && rh && (rw.length === rx.length) && (rh.length === rx.length));
</script>

{#if isOk}
   <!-- svelte-ignore a11y_click_events_have_key_events -->
   <!-- svelte-ignore a11y_no_static_element_interactions -->
   <g class="series {className}"  style={barsStyleStr} onclick={(e) => handleClick(e, 'rect', onclick)} >
   {#each left as v, i}
      <rect x={rx[i]} y={ry[i]} width={rw[i]} height={rh[i]} />
   {/each}
   </g>
{/if}


