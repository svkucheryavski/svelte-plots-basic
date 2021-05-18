<script>
   import { getContext } from 'svelte';
   import { Colors } from './Colors';
   import { max, mrange, diff } from './stats'
   import Rectangles from './Rectangles.svelte';

   /* input parameters */
	export let xValues;
   export let yValues;
   export let barWidth = 0.8;
   export let title = "";
   export let labels = yValues;
   export let showLabels = "no"; // can be "no", "hover", "always"
   export let faceColor = Colors.PRIMARY;
   export let borderColor = Colors.PRIMARY;

   /* sanity check of input parameters */

   if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length != yValues.length) {
      throw("BarSeries: parameters 'xValues' and 'yValues' must be numeric vectors of the same length.");
   }

   if (barWidth <= 0 || barWidth > 1) {
      throw("BarSeries: parameters 'barWidth' should be between 0 and 1.");
   }

   // compute ranges for x and y values
   const yValuesRange = mrange(yValues, showLabels === "no" ? 0.05 : 0.20);
   const xValuesRange = mrange(xValues, 0.1);
   xValuesRange[0] = xValuesRange[0] - barWidth * diff(xValuesRange) / xValues.length * 0.5
   xValuesRange[1] = xValuesRange[1] + barWidth * diff(xValuesRange) / xValues.length * 0.5

   // get axes context and adjust axes limits
   const axes = getContext('axes');
   axes.adjustXAxisLimits(xValuesRange);
   axes.adjustYAxisLimits(yValuesRange);

   // reactive variables for the bar elements (width, left, top, height)
   $: width = max(diff(xValues)) * barWidth;
   $: left = xValues.map(v => v - width/2);
   $: top = yValues.map(v => v > 0 ? v : 0);
   $: height = yValues.map(v => Math.abs(v));

</script>

<g class="series series_bar" title="{title}">
   <Rectangles left="{left}" top="{top}" width="{width}" height="{height}" borderColor="{borderColor}" faceColor="{faceColor}"></Rectangles>
</g>

<style>

   :global(.series_bar > rect){
      stroke-width: 1px;
   }

   :global(.series_bar > rect:hover){
      opacity: 90%;
   }

</style>
