<!--
@component Adds a series of points.

   Main properties:
   - `xValues` - array of vector with x-coordinates of the points.
   - `yValues` - array of vector with y-coordinates of the points.
   - `marker` - index for a point symbol (from 1 - default - to 8): `"●", "◼", "▲", "▼", "⬥", "＋", "*", "✕"`.
   - `faceColor` - face (fill) color of the markers, default: `'transparent'`.
   - `lineColor` - border color of the markers, default: `Colors.PRIMARY`.
   - `lineWidth` - width (thickness) of the markers' border in pixels, defailt: `1`.
   - `markerSize` - size of the markers in em, defailt: `1`.
   - `onclick` - function (callback) to be called when user clicks on a marker.

   Example:

   ```svelte
   <script>
      import { Axes, Points } from 'svelte-plots-basic/2d';

      const xValues = [-3, -2, -1, 0, 1, 2, 3];
      const yValues = [9, 4, 1, 0, 1, 4, 9];
   </script>

   <Axes limX={[-4, 4]} limY={[-2, 10]}>
      <Points {xValues} {yValues}  />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
   import { Colors, MARKER_SYMBOLS } from '../constants';
   import { checkCoords, transformCoords, handleClick } from '../methods';

   /** @type {Props} */
   let {
	   xValues,                          // array of vector with x-coordinates of points
      yValues,                          // array of vector with y-coordinates of points
      marker = 1,                       // index for point symbol (from 1 to 8): "●", "◼", "▲", "▼", "⬥", "＋", "*", "✕"
      faceColor = 'transparent',        // face (fill) color of the points
      lineColor = Colors.PRIMARY,     // border color of the points
      lineWidth = 1,                  // width (thickness) of the points
      markerSize = 1,                   // size of the marker symbols
      onclick,                          // function to be called if onclick event fires
   } = $props();


   // select which symbol to use as a marker
   const markerSymbol = $derived.by(() => {
      if (typeof(marker) !== 'number' || marker < 1 || marker > MARKER_SYMBOLS.length) {
         console.error('Points: parameter "marker" must be a number from 1 to ' + MARKER_SYMBOLS.length + '.');
         return null;
      }
      return MARKER_SYMBOLS[marker - 1]
   });

   // check user provided coordinates
   const xv = $derived(checkCoords(xValues, 'Points'));
   const yv = $derived(xv ? checkCoords(yValues, 'Points', xv.length) : null);

   // get axes context and compute screen coordinates
   const axes = getContext('axes');
   const x = $derived(xv ? transformCoords(xv, axes.tX()) : null);
   const y = $derived(x && yv ? transformCoords(yv, axes.tY()) : null);

   // styles for the markers
   const textStyleStr = $derived(['＋', '✳', '✕'].includes(markerSymbol)  ?
       `fill:${lineColor && lineColor !== 'transparent' ? lineColor : faceColor};stroke-width:0px;font-size:${markerSize}em;` :
       `fill:${faceColor};stroke-width:${lineWidth}px;stroke:${lineColor}; font-size:${markerSize}em;`
   );

   const alignStyleStr = $derived(['◼', '⬥', '＋', '✳', '✕'].includes(markerSymbol)  ?
       `dominant-baseline:central;alignment-baseline:mathematical;` :
       `dominant-baseline:middle;alignment-baseline:middle;`
   );
   // check if all coordinates are correct
   const isOk = $derived(x && y && x.length === y.length);
</script>

{#if isOk}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g onclick={(e) => handleClick(e, 'text', onclick)}
   class="series series-points"
   title={title} style={textStyleStr + alignStyleStr} text-anchor="middle">
   {#each x as v, i}
      <text x={x[i]} y={y[i]}>{markerSymbol}</text>
   {/each}
</g>
{/if}
