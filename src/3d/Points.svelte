<script>
   /****************************************************
   * ScatterSeries component                           *
   * --------------------                              *
   * shows a series of points on the plot              *
   *                                                   *
   *****************************************************/

   import { Colors } from '../Colors';
   import TextLabels from './TextLabels.svelte';

   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   // input parameters
	export let xValues;
   export let yValues;
   export let zValues = undefined
   export let marker = 1
   export let title = "";
   export let faceColor = "transparent";
   export let borderColor = Colors.PRIMARY;
   export let borderWidth = 1;
   export let markerSize = 1;

   /* constants for internal use */
   const markers = ["●", "◼", "▲", "▼", "⬥", "+", "*", "⨯"];
   let markerSymbol;

   /* sanity check of input parameters */
   if (typeof(marker) !== "number" || marker < 1 || marker > markers.length) {
      throw(`Points: parameter 'marker' must be a number from 1 to ${markers.length}."`);
   }

   // reactive variables for coordinates of data points in pixels (and line style)
   $: markerSymbol = markers[marker - 1];
</script>

<TextLabels
   {xValues} {yValues} {zValues} {faceColor} {borderColor} {borderWidth} {title}
   className="series_scatter"
   labels={markerSymbol}
   textSize={markerSize}
/>

<style>
   :global(.series_scatter > text) {
      font-size: 1em;
      cursor: default;
   }

   :global(.series_scatter > text:hover) {
      opacity: 90%;
   }

   :global(.series_scatter > *:hover + .labels_hover) {
      visibility: visible;
      opacity: 1;
   }
</style>
