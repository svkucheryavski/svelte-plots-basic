<script>
   /****************************************************
   * Rectangles                                        *
   * --------------------                              *
   * shows series of rectangles                        *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Vector } from 'mdatools/arrays';
   import { Colors } from '../Colors';
   import { checkCoords } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let left;                          // array of vector with coordinates of left sides of the bars
   export let top;                           // array of vector with coordinates of top sides of the bars
   export let width;                         // single value (same for all) or vector/array with bar width
   export let height;                        // single value (same for all) or vector/array with bar height
   export let faceColor = Colors.PRIMARY;    // color of bar faces (fill)
   export let borderColor = faceColor;       // color of bar borders
   export let lineWidth = 1;                 // width (thickness) of bar border lines
   export let className = 'series-rect';     // CSS class name of the SVG group
   export let title = '';                    // title of the rectangle series (reserved for future use)


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const tX = axes.tX;
   const tY = axes.tY;
   const isOk = axes.isOk;

   let rx, ry, rw, rh = undefined;
   $: {
      if ($isOk) {
         rx = axes.transform(checkCoords(left, 'Rectangles'), $tX.coords);
         ry = axes.transform(checkCoords(top, 'Rectangles'), $tY.coords);

         if (rx.length !== ry.length) {
            throw Error('Rectangles: parameters "left" and "top" must be vectors of the same length.');
         }

         if (typeof width !== 'object') {
            width = Vector.fill(width, left.length);
         }

         if (typeof height !== 'object') {
            height = Vector.fill(height, left.length);
         }

         rw = axes.transform(width, $tX.objects);
         rh = axes.transform(height, $tY.objects);
      }
   }

   // styles for bars and labels
   $: barsStyleStr = `fill:${faceColor};stroke:${borderColor};stroke-width:${lineWidth}px;`;
</script>

{#if $isOk}
   <g class="series {className}" title={title} style={barsStyleStr}>
   {#each left as v, i}
      <rect x={rx[i]} y={ry[i]} width={rw[i]} height={rh[i]} />
   {/each}
   </g>
{/if}


