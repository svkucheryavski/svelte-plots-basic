<script>
   import { getContext } from 'svelte';
   import { Colors } from '../constants';

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
   const x = $derived(left ? transformCoords([left], axes.tX()) : null);
   const y = $derived(top ? transformCoords([top], axes.tY()) : null );

   // styles for bars and labels
   const textStyleStr = $derived(`fill:${faceColor};stroke-width:${lineWidth}px;stroke:${lineColor};font-size:${textSize}em;`);
</script>

{#if x && y && elements.length > 0}
   <text style={textStyleStr} x={x} y={y} dx={dx} dy={dy} dominant-baseline="middle" text-anchor="start">
      {#each elements as el, i}
         <tspan {x} {dx} dy={i === 0 ? 0 : dy}>{@html el}</tspan>
      {/each}
   </text>
{/if}