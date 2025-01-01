<!--
@component Adds a series of points (markers).

   Main properties:
   - `xValues` - array of vector with x-coordinates of the points.
   - `yValues` - array of vector with y-coordinates of the points.
   - `zValues` - array of vector with z-coordinates of the points.
   - `marker` - marker number (from 1 to 8), default: `1`.
   - `faceColor` - face (fill) color of the markers, default: `'transparent'`.
   - `borderColor` - color markers' borders, default: `Colors.PRIMARY`.
   - `borderWidth` - width (thickness) of the markers' borders in pixels, default: `1`.
   - `markerSize` - size of the markers in em, default: `1`.
   - `title` - title of the line series group.

   Example:
   ```jsx
   <script>
      import { Axes, Points } from 'svelte-plots-basic/3d';

      const xValues = [-3, -2, -1, 0, 1, 2, 3];
      const yValues = [ 9,  4,  1, 0, 1, 4, 9];
      const zValues = [-3, -2, -1, 0, 1, 2, 3];
   </script>

   <Axes limX={[-4, 4]} limY={[-2, 10]} limZ={[-4, 4]}>
      <Points {xValues} {yValues} {zValues} />
   </Axes>
   ```
-->
<script>

   import { Colors, MARKER_SYMBOLS } from '../constants';
   import TextLabels from './TextLabels.svelte';

   let {
      xValues,
      yValues,
      zValues,
      marker = 1,
      title = '',
      faceColor = "transparent",
      borderColor = Colors.PRIMARY,
      borderWidth = 1,
      markerSize = 1,
   } = $props();

   // reactive variables for coordinates of data points in pixels (and line style)
   const markerSymbol = $derived.by(() => {
      if (typeof(marker) !== "number" || marker < 1 || marker > MARKER_SYMBOLS.length) {
         console.error(`Points (3D): parameter 'marker' must be a number from 1 to ${MARKER_SYMBOLS.length}."`);
         return null;
      }

      return MARKER_SYMBOLS[marker - 1];
   });
</script>

{#if markerSymbol}
<TextLabels
   {xValues} {yValues} {zValues} {faceColor} {borderColor} {borderWidth} {title}
   className="series-scatter"
   labels={markerSymbol}
   textSize={markerSize}
/>
{/if}

<style>
   :global(.series-scatter > text) {
      font-size: 1em;
      cursor: default;
   }

   :global(.series-scatter > text:hover) {
      opacity: 90%;
   }

   :global(.series-scatter > *:hover + .labels-hover) {
      visibility: visible;
      opacity: 1;
   }
</style>
