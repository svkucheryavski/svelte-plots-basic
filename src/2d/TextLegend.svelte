<script>
   import { getContext } from 'svelte';
   import { Colors } from '../constants';
   import { checkCoords, transformCoords } from '../methods';

   let {
      left,                                // vector/array with coordinates of lef side of each text box
      top,                                 // vector/array with coordinates of top side of each text box
      dx = "0",                            // horizontal margin between left size and text in 'em' units
      dy = "1.25em",                       // vertical margin between elements in 'em' units
      elements,                            // array with text elements (svg tags are acceptable)
      faceColor = Colors.PRIMARY_TEXT,     // face color of the text symbols
      lineColor = "transparent",           // border color of the text symbols
      lineWidth = 0,                       // border width of the text symbols
      textSize = 1,                        // size of the text symbols
   } = $props()

   const axes = getContext('axes');
   const lx = $derived(
      left !== undefined && left !== null ? checkCoords([left], 'TextLegend (left)') : null
   );
   const ty = $derived(
      top !== undefined && top !== null ? checkCoords([top], 'TextLegend (top)') : null
   );
   const x = $derived(lx ? transformCoords(lx, axes.tX()) : null);
   const y = $derived(ty ? transformCoords(ty, axes.tY()) : null);

   const validElements = $derived.by(() => {
      if (!Array.isArray(elements) || elements.length < 1) {
         console.error('TextLegend: parameter "elements" must be a non-empty array.');
         return null;
      }

      return elements;
   });

   // styles for bars and labels
   const textStyleStr = $derived(`fill:${faceColor};stroke-width:${lineWidth}px;stroke:${lineColor};font-size:${textSize}em;`);
</script>

{#if x && y && validElements}
   <text style={textStyleStr} x={x} y={y} dx={dx} dy={dy} dominant-baseline="middle" text-anchor="start">
      {#each validElements as el, i}
         <tspan {x} {dx} dy={i === 0 ? 0 : dy}>{@html el}</tspan>
      {/each}
   </text>
{/if}
