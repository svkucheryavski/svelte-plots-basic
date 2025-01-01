<!--
@component draws line segments for axis elements (ticks. etc), not for manual use.
-->
<script>
   import { getContext } from 'svelte';
   import { Colors, LINE_STYLES } from '../constants';
   import { transform3D } from '../methods';

   let {
      lineCoords = [],                 // nested array for line segments coordinates (start and end points).
      lineColor = Colors.DARKGRAY,     // color of the lines.
      lineType = 1,                    // line type (1, 2, 3, 4).
      lineWidth = 1,                   // line width (thickness) in pixels.
   } = $props();

   // get axes context and and compute screen coordinates
   const axes = getContext('axes');
   const s1 = $derived(lineCoords.length == 2 ? transform3D(lineCoords[0], axes.tM()) : null);
   const s2 = $derived(s1 ? transform3D(lineCoords[1], axes.tM()) : null);

   // line style
   const lineStyleStr = $derived(`stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${LINE_STYLES[axes.scale()][lineType-1]}`);
</script>

{#if s1 && s2}
<g class="axis-lines" style={lineStyleStr}>
   {#each s1.x as v, i}
   <line x1={s1.x[i]} x2={s2.x[i]} y1={s1.y[i]} y2={s2.y[i]} />
   {/each}
</g>
{/if}

