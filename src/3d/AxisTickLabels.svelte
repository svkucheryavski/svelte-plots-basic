<script>
   /****************************************************
   * AxisTickLabels for 3D plots                       *
   * ----------------------------                      *
   * shows a series of tick labels along an axis       *
   *****************************************************/

   import { getContext } from 'svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let tickCoords;
   export let textColor;
   export let tickLabels;


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const isOk = axes.isOk;
   const tM = axes.tM;

   let x, y = undefined;

   // reactive calculations triggered by changes in coordinates and plot parameters
   $: if ($isOk) {
      [x, y] = axes.transform(tickCoords, $tM);
   }

   // styles for the elements
   $: textStyleStr = `dominant-baseline:middle;fill:${textColor};font-size:0.85em; text-anchor:middle;`;
</script>

{#if x !== undefined && y !== undefined}
<g class="tick_labels" style={textStyleStr} >
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={0} dy={0}>{@html tickLabels[i]}</text>
   {/each}
</g>
{/if}

<style>
   text, text > :global(tspan) {
      cursor: default;
      user-select: none;
      dominant-baseline: middle;
   }
</style>