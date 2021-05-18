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

   /* sanity check of input parameters */
   if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length != yValues.length) {
      throw("ScatterSeries: parameters 'xValues' and 'yValues' must be numeric vectors of the same length.");
   }

   if (marker < 1 || marker > markers.length) {
      throw(`ScatterSeries: parameter 'marker' must be a number from 1 to ${markers.length}."`);
   }

   // compute ranges for x and y values
   const xValuesRange = mrange(xValues, 0.05);
   const yValuesRange = mrange(yValues, 0.05);

   // get axes context and adjust axes limits
   const axes = getContext('axes');
   axes.adjustXAxisLimits(xValuesRange);
   axes.adjustYAxisLimits(yValuesRange);

</script>

<g class="series series_scatter" title="{title}">
   <TextLabels xValues={xValues} yValues={yValues} labels="{markers[marker - 1]}"
      textSize="{markerSize}" {faceColor} {borderColor} {borderWidth}></TextLabels>
</g>

<style>
   .marker{
      font-size: 1em;
      cursor: default;
   }

   .marker:hover{
      opacity: 90%;
   }

   .series_scatter > *:hover + .labels_hover {
      visibility: visible;
      opacity: 1;
   }

</style>
