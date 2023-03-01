<script>
   /****************************************************
   * LineSeries                                        *
   * --------------------                              *
   * shows series of lines/curves                      *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { val2p3d } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let xValues;
   export let yValues;
   export let zValues;
   export let title = '';
   export let lineWidth = 1;
   export let lineColor = Colors.PRIMARY;
   export let lineType = 1;


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context
   const axes = getContext('axes');

   const scale = axes.scale;
   const isOk = axes.isOk;
   const tM = axes.tM;

   // compute polynomial coordinates as string
   $: p = $isOk ? val2p3d(xValues, yValues, zValues, $tM, axes) : undefined;

   // reactive variables for coordinates of data points in pixels
   $: lineStyleStr = `fill:transparent;stroke:${lineColor};stroke-width: ${lineWidth}px; stroke-dasharray:${axes.LINE_STYLES[$scale][lineType-1]}`;
</script>

{#if $isOk && p !== undefined}
   <g class="series series_line" style={lineStyleStr} title={title}>
      <polyline class="line" points={p}/>
   </g>
{/if}

