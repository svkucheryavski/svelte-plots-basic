<script>

   import { getContext } from 'svelte';
   import { Colors } from './Colors';
   import { mrange } from './stats'

   // input parameters
	export let xValues;
   export let yValues;
   export let lineWidth = 1;
   export let lineStyle = "-"; // can be "--", ":", "-."
   export let lineColor = Colors.PRIMARY;
   export let title = "";

   // TODO: implement sanity check of input parameters


   // styles for markers and labels
   const lineStyleStr = `fill:none;stroke:${lineColor};stroke-width:${lineWidth};`;

   // compute ranges for x and y values
   const xValuesRange = mrange(xValues, 0.10);
   const yValuesRange = mrange(yValues, 0.10);

   // get axes context and adjust axes limits
   const axes = getContext('axes');
   axes.adjustXAxisLimits(xValuesRange);
   axes.adjustYAxisLimits(yValuesRange);

   // get reactive variables needed to compute coordinates
   const xLim = axes.xLim;
   const yLim = axes.yLim;
   const axesWidth = axes.width;
   const axesHeight = axes.height;
   const scale = axes.scale;

   // reactive variables for coordinates of data points in pixels
   $: x = axes.scaleX(xValues, $xLim, $axesWidth);
   $: y = axes.scaleY(yValues, $yLim, $axesHeight);
   $: p = x !== undefined && y !== undefined ? x.map((v, i) => `${v},${y[i]}`).join(' ') : undefined;
</script>

{#if p !== undefined}
   <g class="series lineseries" style="{lineStyleStr}" title="{title}">
   <polyline class="line" points="{p}"/>
   </g>
{/if}

<style>
</style>
