<script>
   /****************************************************
   * Points                                            *
   * --------------------                              *
   * shows series of points/markers on a plot          *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { checkCoords } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let xValues;                          // array of vector with x-coordinates of points
   export let yValues;                          // array of vector with y-coordinates of points
   export let marker = 1                        // index for point symbol (from 1 to 8): "●", "◼", "▲", "▼", "⬥", "＋", "*", "✕"
   export let faceColor = 'transparent';        // face (fill) color of the points
   export let borderColor = Colors.PRIMARY;     // border color of the points
   export let borderWidth = 1;                  // width (thickness) of the points
   export let markerSize = 1;                   // size of the marker symbols
   export let title = '';                       // title of the point series - required for handling mouse click events


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context and adjust x margins
   const axes = getContext('axes');
   const tX = axes.tX;
   const tY = axes.tY;
   const isOk = axes.isOk;

   let x, y, markerSymbol;

   // reactive calculations triggered by changes in coordinates and plot parameters
   $: if ($isOk) {

      if (typeof(marker) !== "number" || marker < 1 || marker > axes.MARKER_SYMBOLS.length) {
         throw Error(`Points: parameter "marker" must be a number from 1 to ${axes.MARKER_SYMBOLS.length}.`);
      }

      markerSymbol = axes.MARKER_SYMBOLS[marker - 1];

      x = axes.transform(checkCoords(xValues, 'Points'), $tX.coords);
      y = axes.transform(checkCoords(yValues, 'Points'), $tY.coords);

      // sanity check for input parameters
      if (x.length !== y.length) {
         throw Error('Points: parameters "xValues" and "yValues" must be vectors of the same length.')
      }
   }

   // styles for the elements
   $: textStyleStr = ['＋', '✳', '✕'].includes(markerSymbol)  ?
       `fill:${borderColor && borderColor !== 'transparent' ? borderColor : faceColor};stroke-width:0px;font-size:${markerSize}em;` :
       `fill:${faceColor};stroke-width:${borderWidth}px;stroke:${borderColor}; font-size:${markerSize}em;`;

</script>

{#if $isOk && x !== undefined && y !== undefined}
<g class="series series-points" title={title} style={textStyleStr} dominant-baseline="middle" text-anchor="middle">
   {#each x as v, i}
      <text x={x[i]} y={y[i]}>{markerSymbol}</text>
   {/each}
</g>
{/if}
