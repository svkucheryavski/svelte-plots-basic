<script>
   /****************************************************
   * Segments for 3D plot                              *
   * --------------------                              *
   * shows a series of line segments on the plot       *
   *****************************************************/

   import { cbind } from 'mdatools/arrays';
   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { checkCoords } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let title = '';
	export let xStart;
   export let xEnd;
   export let yStart;
   export let yEnd;
   export let zStart;
   export let zEnd;

   export let lineColor = Colors.PRIMARY;
   export let lineType = 1;
   export let lineWidth = 1;

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const scale = axes.scale;
   const tM = axes.tM;
   const isOk = axes.isOk;

   let x1, y1, x2, y2 = undefined;
   $: {
      if ($isOk) {

         [x1, y1] = axes.transform(
            cbind(
               checkCoords(xStart, 'Segments'),
               checkCoords(yStart, 'Segments'),
               checkCoords(zStart, 'Segments')
            ), $tM
         );

         [x2, y2] = axes.transform(
            cbind(
               checkCoords(xEnd, 'Segments'),
               checkCoords(yEnd, 'Segments'),
               checkCoords(zEnd, 'Segments')
            ), $tM
         );

      }
   }

   $: lineStyleStr = `stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${axes.LINE_STYLES[$scale][lineType-1]}`;
</script>

<g class="series series_segment" data-title="{title}" style={lineStyleStr}>
{#if $isOk && x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined}
   {#each x1 as v, i}
      <line vector-effect="non-scaling-stroke" x1={x1[i]} x2={x2[i]} y1={y1[i]} y2={y2[i]} />
   {/each}
{/if}
</g>

