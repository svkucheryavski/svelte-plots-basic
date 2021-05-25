<script>

   import { getContext } from 'svelte';
   import { Colors } from './Colors';
   import { mrange } from './stats'
   import TextLabels from './TextLabels.svelte';

   // input parameters
	export let xValues;
   export let yValues;
   export let marker = 1
   export let title = "";
   export let labels = yValues;
   export let showLabels = "no"; // can be "no", "hover", "always"
   export let faceColor = "transparent";
   export let borderColor = Colors.PRIMARY;
   export let borderWidth = 1;
   export let markerSize = 1;

   const markers = ["●", "◼", "▲", "▼", "⬥", "+", "*", "⨯"];
   let markerSymbol;

   /* sanity check of input parameters */
   if (typeof(marker) !== "number" || marker < 1 || marker > markers.length) {
      throw(`ScatterSeries: parameter 'marker' must be a number from 1 to ${markers.length}."`);
   }

   // to access shared parameters and methods from Axes
   const axes = getContext('axes');

   /* reactive actions related to x-values, fires when there are changes in:
    * - xValues
    * - marker
    */
   $: {
      if (!Array.isArray(xValues)) {
         throw("ScatterSeries: parameter 'xValues' must be a numeric vector.");
      }

      const xValuesRange = mrange(xValues, 0.05);
      axes.adjustXAxisLimits(xValuesRange);

      markerSymbol = "";
      markerSymbol = markers[marker - 1];
   }

   /* reactive actions related to y-values, fires when there are changes in:
    * - yValues
    */
   $: {
      if (!Array.isArray(yValues) || xValues.length != yValues.length) {
         throw("BarSeries: parameter 'yValues' must be a numeric vector of the same length as 'xValues'.");
      }

      const yValuesRange = mrange(yValues, 0.05);
      axes.adjustYAxisLimits(yValuesRange);
   }

</script>

<g class="series series_scatter" title="{title}">
   <TextLabels xValues={xValues} yValues={yValues} labels="{markerSymbol}"
      textSize="{markerSize}" {faceColor} {borderColor} {borderWidth}></TextLabels>
</g>

<style>
   .marker {
      font-size: 1em;
      cursor: default;
   }

   .marker:hover {
      opacity: 90%;
   }

   .series_scatter > *:hover + .labels_hover {
      visibility: visible;
      opacity: 1;
   }

</style>
