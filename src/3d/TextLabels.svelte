<!--
@component Adds a series of text labels at given coordinates.

   Main properties:
   - `xValues` - array of vector with x-coordinates of the points.
   - `yValues` - array of vector with y-coordinates of the points.
   - `zValues` - array of vector with z-coordinates of the points.
   - `labels` - array with labels.
   - `faceColor` - face (fill) color of the markers, default: `'transparent'`.
   - `borderColor` - color markers' borders, default: `Colors.PRIMARY`.
   - `borderWidth` - width (thickness) of the markers' borders in pixels, default: `1`.
   - `textSize` - size of the markers in em, default: `1`.
   - `title` - title of the line series group.

   Example:
   ```jsx
   <script>
      import { Axes, TextLabels } from 'svelte-plots-basic/3d';

      const xValues = [-3, -2, -1, 0, 1, 2, 3];
      const yValues = [ 9,  4,  1, 0, 1, 4, 9];
      const zValues = [-3, -2, -1, 0, 1, 2, 3];
      const labels = ["A", "B", "C", "D", "E", "F", "G"];
   </script>

   <Axes limX={[-4, 4]} limY={[-2, 10]} limZ={[-4, 4]}>
      <TextLabels {xValues} {yValues} {zValues} {labels} />
   </Axes>
   ```
-->
<script>
   import { cbind } from 'mdatools/arrays';
   import { getContext } from 'svelte';
   import { Colors } from '../constants';
   import { checkCoords, transform3D } from '../methods';

   let {
      title = '',
	   xValues,
      yValues,
      zValues,
      labels,
      faceColor = Colors.PRIMARY_TEXT,
      borderColor = 'transparent',
      borderWidth = 0,
      textSize = 1,
      className = 'series-textlabel',
      fontWeight = 'normal'
   } = $props();


   const ux = $derived(checkCoords(xValues, 'TextLabels (3D)'));
   const uy = $derived(ux ? checkCoords(yValues, 'TextLabels (3D)', ux.length) : null);
   const uz = $derived(uy ? checkCoords(zValues, 'TextLabels (3D)', uy.length) : null);
   const U = $derived(ux && uy && uz ? cbind(ux, uy, uz) : null);

   const l = $derived.by(() => {
      if(Array.isArray(labels) && labels.length !== ux.length ) {
         console.error('TextLabels: labels provided as an array should have the same number of elements as number of coordinates.');
         return null;
      }
      return labels;
   });

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const s = $derived(U && l ? transform3D(U, axes.tM()) : null);

   // styles for the elements
   const textStyleStr = $derived(`dominant-baseline:middle;fill:${faceColor};stroke-width:${borderWidth}px;stroke:${borderColor};
      font-size:${textSize}em; text-anchor:middle;font-weight:${fontWeight}`);
</script>

{#if s}
<g class="series {className}" title={title} style={textStyleStr} >

   {#if typeof labels === 'string'}
   {#each s.x as v, i}
      <text data-id={i} x={s.x[i]} y={s.y[i]} dx={0} dy={0}>{@html l}</text>
   {/each}
   {:else}
   {#each x as v, i}
      <text data-id={i} x={s.x[i]} y={s.y[i]} dx={0} dy={0}>{@html l[i]}</text>
   {/each}
   {/if}
</g>
{/if}

<style>
   text, text > :global(tspan) {
      dominant-baseline: middle;
   }
</style>