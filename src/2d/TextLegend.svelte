<script>
   /****************************************************
   * TextLegend                                        *
   * --------------------                              *
   * shows list of several formatted text elements     *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let left;                                // vector/array with coordinates of lef side of each text box
   export let top;                                 // vector/array with coordinates of top side of each text box
   export let dx = "0";                            // horizontal margin between left size and text in 'em' units
   export let dy = "1.25em";                       // vertical margin between elements in 'em' units
   export let elements;                            // array with text elements (svg tags are acceptable)
   export let faceColor = Colors.PRIMARY_TEXT;     // face color of the text symbols
   export let borderColor = "transparent";         // border color of the text symbols
   export let borderWidth = 0;                     // border width of the text symbols
   export let textSize = 1;                        // size of the text symbols


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   const axes = getContext('axes');
   const tX = axes.tX;
   const tY = axes.tY;
   const isOk = axes.isOk;

   // reactive variables for coordinates of data points in pixels
   let x, y = undefined;
   $: if ($isOk) {
      x = axes.transform([left], $tX.coords);
      y = axes.transform([top], $tY.coords);
   }

   // styles for bars and labels
   $: textStyleStr = `fill:${faceColor};stroke-width:${borderWidth}px;stroke:${borderColor};font-size:${textSize}em;`;
</script>

{#if $isOk && x !== undefined && y !== undefined && elements.length > 0}
   <text style={textStyleStr} x={x} y={y} dx={dx} dy={dy} dominant-baseline="middle" text-anchor="start">
      {#each elements as el, i}
         <tspan {x} {dx} dy={i === 0 ? 0 : dy}>{@html el}</tspan>
      {/each}
   </text>
{/if}