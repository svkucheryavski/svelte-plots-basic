<script>
   /****************************************************
   * Points                                            *
   * --------------------                              *
   * shows series of points/markers on a plot          *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import TextLabels from './TextLabels.svelte';


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

   let markerSymbol;
   $: {
      if (typeof(marker) !== "number" || marker < 1 || marker > axes.MARKER_SYMBOLS.length) {
         throw Error(`ScatterSeries: parameter "marker" must be a number from 1 to ${axes.MARKER_SYMBOLS.length}.`);
      }

      markerSymbol = axes.MARKER_SYMBOLS[marker - 1];
   }

</script>

<TextLabels
   {xValues} {yValues} {faceColor} {borderColor} {borderWidth} {title}
   className="series_scatter"
   labels={markerSymbol}
   textSize={markerSize}
/>

