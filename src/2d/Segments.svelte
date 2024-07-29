<script>
   /****************************************************
   * Segments                                          *
   * --------------------                              *
   * shows series of line segments                     *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { checkCoords } from '../Utils';

   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let xStart;                        // vector or array with x-coordinates of starting points
   export let xEnd;                          // vector or array with x-coordinates of end points
   export let yStart;                        // vector or array with y-coordinates of starting points
   export let yEnd;                          // vector or array with y-coordinates of end points
   export let lineColor = Colors.PRIMARY;    // color of segment lines
   export let lineType = 1;                  // type of segment lines (1 - solid, 2 - dashed, 3 - dotted, 4 - dashdot)
   export let lineWidth = 1;                 // width (thickness) of segment lines
   export let className = 'series-seg';      // CSS class name of the SVG group
   export let title = '';                    // title of the segment series (reserved for future use)


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const scale = axes.scale;
   const isOk = axes.isOk;
   const tX = axes.tX;
   const tY = axes.tY;

   let x1, x2, y1, y2 = undefined;
   $: {
      if ($isOk) {

         x1 = axes.transform(checkCoords(xStart, 'Segments'), $tX.coords);
         y1 = axes.transform(checkCoords(yStart, 'Segments'), $tY.coords);
         x2 = axes.transform(checkCoords(xEnd, 'Segments'), $tX.coords);
         y2 = axes.transform(checkCoords(yEnd, 'Segments'), $tY.coords);

         const n = x1.length;
         if (x2.length !== n || y1.length !== n || y2.length !== n) {
            throw Error('Segments: parameters "xStart", "yStart", "xEnd" and "yEnd" should have the same length.');
         }
      }
   }

   // reactive variables for coordinates of data points in pixels (and line style)
   $: lineStyleStr = `stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${axes.LINE_STYLES[$scale][lineType-1]}`;
</script>

{#if $isOk}
   <g class="series {className}" title={title} style={lineStyleStr}>
   {#each x1 as v, i}
      <line x1={x1[i]} x2={x2[i]} y1={y1[i]} y2={y2[i]} />
   {/each}
   </g>
{/if}

