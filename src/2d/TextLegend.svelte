<!--
@component Adds a vertical text legend at a specified plot position.

   Main properties:
   - `left` - x-coordinate of the legend in plot units.
   - `top` - y-coordinate of the legend in plot units.
   - `elements` - non-empty array of text labels. SVG/HTML markup is supported.
   - `dx` - horizontal text offset, default: `"0"`.
   - `dy` - vertical spacing between labels, default: `"1.25em"`.
   - `faceColor` - text fill color, default: `Colors.PRIMARY_TEXT`.
   - `lineColor` - text outline color, default: `"transparent"`.
   - `lineWidth` - text outline width in pixels, default: `0`.
   - `textSize` - text size in em, default: `1`.

   Values in `elements` are rendered as raw SVG/HTML markup. Only pass trusted content.

   Example:

   ```svelte
   <script>
      import { Axes, TextLegend } from 'svelte-plots-basic/2d';

      const elements = ['First group', 'Second group'];
   </script>

   <Axes limX={[0, 10]} limY={[0, 10]}>
      <TextLegend left={1} top={9} {elements} />
   </Axes>
   ```
-->

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
