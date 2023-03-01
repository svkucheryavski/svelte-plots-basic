<script>
   /****************************************************
   * Axis lines                                        *
   * --------------------                              *
   * generic component for axis lines (main, grid, ...)*
   * !!! not for users !!!                             *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors.js';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let lineCoords = [];               // coordinates of start and end points of the lines
   export let lineColor = Colors.DARKGRAY;   // line color
   export let lineType = 1;                  // line type
   export let lineWidth = 1;                 // lined width (thickness)
   export let className = '';                // CSS class name for the component


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context and adjust x margins
   const axes = getContext('axes');
   const scale = axes.scale;
   const tX = axes.tX;
   const tY = axes.tY;

   // reactive variables for coordinates of axis lines
   let x1, x2, y1, y2 = undefined;
   $: if (lineCoords.length == 2) {
      x1 = axes.transform(lineCoords[0][0], $tX.coords);
      y1 = axes.transform(lineCoords[0][1], $tY.coords);
      x2 = axes.transform(lineCoords[1][0], $tX.coords);
      y2 = axes.transform(lineCoords[1][1], $tY.coords);
   }

   /* styles for axis and grid lines */
   $: lineStyleStr = `stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${axes.LINE_STYLES[$scale][lineType-1]}`;

</script>

{#if x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined}
<g class={className}>
   {#each x1 as v, i}
   <line vector-effect="non-scaling-stroke" x1={x1[i]} x2={x2[i]} y1={y1[i]} y2={y2[i]} style={lineStyleStr} />
   {/each}
</g>
{/if}
