<script>
   /****************************************************
   * AxisTickLabels                                    *
   * --------------------                              *
   * shows a series of tick labels along an axis       *
   * !!! not for users !!!                             *
   *****************************************************/

   import { getContext } from 'svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let tickCoords;  // array with tick coordinates
   export let textColor;   // color of tick labels
   export let tickLabels;  // array with tick labels
   export let pos = 1;     // position of tick labels
   export let las = 1;     // rotation of tick labels (1 - horizontal, 2 - vertical)


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const scale = axes.scale;
   const tX = axes.tX;
   const tY = axes.tY;
   const isOk = axes.isOk;

   let el;

   let x, y = undefined;
   let dx = 0, dy = 0, textAnchor;

   // reactive calculations triggered by changes in coordinates and plot parameters
   $: if ($isOk) {
      x = axes.transform(tickCoords[1][0], $tX.coords);
      y = axes.transform(tickCoords[1][1], $tY.coords);
   }

   // reactive calculations triggered by changes in scale
   $: m = axes.LABELS_MARGIN[$scale];

   // reactive calculations triggered by changes in pos
   $: {
      textAnchor = (['middle', 'middle', 'start', 'middle', 'end'])[pos];
      dx = ([0, 0, m,  0, -m])[pos];
      dy = ([0, m, 0, -m, 0])[pos];
   }

   // styles for the elements
   $: textStyleStr = `fill:${textColor};`;
</script>

{#if x !== undefined && y !== undefined}
<g class="tick-labels" bind:this={el} style={textStyleStr} >
   {#if las === 2 && pos === 4}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={0} dy={dx*1.25} transform={`rotate(-90, ${x[i]}, ${y[i]})`} text-anchor={"middle"}>{@html tickLabels[i]}</text>
   {/each}
   {:else if las === 2 && pos === 1}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={-dy/2} dy={0} transform={`rotate(-90, ${x[i]}, ${y[i]})`} text-anchor={"end"}>{@html tickLabels[i]}</text>
   {/each}
   {:else}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={dx} dy={dy} text-anchor={textAnchor}>{@html tickLabels[i]}</text>
   {/each}
   {/if}
</g>
{/if}
