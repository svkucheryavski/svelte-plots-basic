<script>
   /****************************************************
   * Axis lines for 3D plot                            *
   * ----------------------                            *
   * shows lines for axis (main, grid, etc)            *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let lineCoords = [];
   export let lineColor = Colors.DARKGRAY;
   export let lineType = 1;
   export let lineWidth = 1;


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const scale = axes.scale;
   const tM = axes.tM;
   const isOk = axes.isOk;

   // compute coordinates of start and end points for each line
   let x1, x2, y1, y2, lineStyleStr = undefined;
   $: if (lineCoords.length == 2) {
      [x1, y1] = axes.transform(lineCoords[0], $tM);
      [x2, y2] = axes.transform(lineCoords[1], $tM);
   }

   // line style
   $: lineStyleStr = `stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${axes.LINE_STYLES[$scale][lineType-1]}`;
</script>

{#if $isOk && x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined}
<g class="axis__grid">
   {#each x1 as v, i}
   <line vector-effect="non-scaling-stroke" x1={x1[i]} x2={x2[i]} y1={y1[i]} y2={y2[i]} style={lineStyleStr} />
   {/each}
</g>
{/if}

