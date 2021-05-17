<script>

   import { getContext } from 'svelte';
   import { Colors } from './Colors';
   import { mrange } from './stats'

   // input parameters
	export let xValues;
   export let yValues;
   export let marker = "●"
   export let title = "";
   export let labels = yValues;
   export let showLabels = "no"; // can be "no", "hover", "always"
   export let faceColor = Colors.PRIMARY;
   export let edgeColor = Colors.PRIMARY;
   export let labelsColor = Colors.GRAY;

   // TODO: implement sanity check of input parameters


   // styles for markers and labels
   const markerStyleStr = `fill:${faceColor};stroke:${edgeColor}`;
   const labelsStyleStr = `fill:${labelsColor};stroke-width:0`;

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
   $: yzero = axes.scaleY([0], $yLim, $axesHeight);
   $: x = axes.scaleX(xValues, $xLim, $axesWidth);
   $: y = axes.scaleY(yValues, $yLim, $axesHeight);
   $: dy = -axes.LABELS_MARGIN[$scale];

</script>

{#if x !== undefined && y !== undefined}
   <g class="series series_scatter" style="{markerStyleStr}" title="{title}">
   {#each x as x, i}
      <text class="marker" x="{x}" y="{y[i]}" dominant-baseline="middle" text-anchor="middle">{marker}</text>
      {#if showLabels !== "no"}
      <text style="{labelsStyleStr}" class="labels labels_{showLabels}" x="{x}" y="{y[i]}" dy="{y[i] < yzero ? dy : -dy}" dominant-baseline="middle" text-anchor="middle">{labels[i]}</text>
      {/if}
   {/each}
   </g>
{/if}

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
