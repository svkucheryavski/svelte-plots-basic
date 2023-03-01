<script>
   /****************************************************
   * Lines                                             *
   * --------------------                              *
   * shows lines connected sequence of points          *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { val2p } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let xValues;                       // vector or array with x-coordinates of the points
   export let yValues;                       // vector or array with y-coordinates of the points
   export let lineWidth = 1;                 // width (thickness) of the lines
   export let lineColor = Colors.PRIMARY;    // color of the lines
   export let lineType = 1;                  // type of the lines (1 - solid, 2 - dashed, 3 - dotted, 4 - dashdot)
   export let title = '';                    // title of the bar series (reserved for future use)


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context
   const axes = getContext('axes');

   const scale = axes.scale;
   const isOk = axes.isOk;
   const tX = axes.tX;
   const tY = axes.tY;

   // compute polynomial coordinates as string
   $: p = $isOk ? val2p(xValues, yValues, $tX, $tY, axes) : undefined;

   // reactive variables for coordinates of data points in pixels
   $: lineStyleStr = `fill:transparent;stroke:${lineColor};stroke-width: ${lineWidth}px; stroke-dasharray:${axes.LINE_STYLES[$scale][lineType-1]}`;
</script>

{#if $isOk && p !== undefined}
   <g class="series series_line" style={lineStyleStr} title={title}>
      <polyline class="line" points={p}/>
   </g>
{/if}

