<script>
   /****************************************************
   * TextLabels for 3D plots                           *
   * -----------------------                           *
   * shows a series of text labels on the plot         *
   *****************************************************/

   import { cbind } from 'mdatools/arrays';
   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { checkCoords } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let title = '';
	export let xValues;
   export let yValues;
   export let zValues;
   export let labels;

   export let faceColor = Colors.PRIMARY_TEXT;
   export let borderColor = 'transparent';
   export let borderWidth = 0;
   export let textSize = 1;
   export let className = 'series_textlabel';


   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const tM = axes.tM;
   const isOk = axes.isOk;

   // compute screen coordinates
   let x, y = undefined;
   $: {
      if ($isOk) {

         [x, y] = axes.transform(
            cbind(
               checkCoords(xValues, 'TextValues'),
               checkCoords(yValues, 'TextValues'),
               checkCoords(zValues, 'TextValues')
            ), $tM
         );

         if (Array.isArray(labels) && labels.length !== x.length ) {
            throw('TextLabels: number of elements in "labels" does not match number of coordinates.')
         }
      }
   }

   // styles for the elements
   $: textStyleStr = `dominant-baseline:middle;fill:${faceColor};stroke-width:${borderWidth}px;stroke:${borderColor};
      font-size:${textSize}em; text-anchor:middle;`;
</script>

{#if $isOk && x !== undefined && y !== undefined}
<g class="series {className}" title={title} style={textStyleStr} >

   {#if typeof labels === 'string'}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={0} dy={0}>{@html labels}</text>
   {/each}
   {:else}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={0} dy={0}>{@html labels[i]}</text>
   {/each}
   {/if}
</g>
{/if}

<style>
   text, text > :global(tspan) {
      dominant-baseline: middle;
   }
</style>