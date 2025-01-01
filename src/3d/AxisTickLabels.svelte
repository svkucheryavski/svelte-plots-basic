<!--
@component shows tick labels.
-->
<script>

   import { getContext } from 'svelte';
   import { transform3D } from '../methods';

   let {
	   tickCoords, // nested array with coordinates of axis ticks.
      textColor,  // color of tick labels text.
      tickLabels, // array with the labels.
   } = $props();

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const s = $derived(transform3D(tickCoords, axes.tM()));

   // styles for the elements
   const textStyleStr = $derived(`dominant-baseline:middle;fill:${textColor};font-size:0.85em; text-anchor:middle;`);
</script>

{#if s}
<g class="tick-labels" style={textStyleStr} >
   {#each s.x as v, i}
      <text data-id={i} x={s.x[i]} y={s.y[i]} dx={0} dy={0}>{@html tickLabels[i]}</text>
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