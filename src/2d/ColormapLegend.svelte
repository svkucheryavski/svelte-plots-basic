<!--
@component Adds colormap legend.

   Main properties:
   - `breaks` - array (or vector) with interval breaks boundaries.
   - `colmap` - array with colors for each break.
   - `labels` - array with the labels (strings) for breaks or boundaries (optional).
   - `labelColor` - color of labels, default: `Colors.CLEGEND_LABELS`.
   - `fontSize` - font size for the labels in em, default `0.85`.

   **Description:**

   Shows legend as a sequence of colors from `colormap` which correspond to the breaks. Number of
   colors must be equal to the number of elements in array `breaks` minus one.

   The labels can correspond to each value of the `breaks` array (boundaries) or to each break.
   In the latter the labels will be shown in the middle of each break. If `labels` are not provided,
   the values from `breaks` will be used as the labels.

   Example:

   ```svelte
   <script>
      import { Axes, ColormapLegend } from 'svelte-plots-basic/2d';

      const breaks = [0, 1, 2, 3, 4];
      const colmap = ['blue', 'green', 'orange', 'red'];
      const labels = ['A', 'B', 'C', 'D'];
   </script>
   <Axes>
      // all other plotting components are here
      <ColormapLegend {breaks} {colmap} {labels} />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
   import { Colors } from '../constants';


   let {
      breaks,                                // vector with breaks for color intervals or vector with their indices
      colmap,                                // array with colors for each interval
      labels = null,                         // optional vector with labels for interval boundaries or elements
      labelColor = Colors.CLEGEND_LABELS,    // color of labels
      fontSize = 0.85,                       // font size for labels in em
   } = $props();

   // get axes context and set the parameters of colormap legend (the rest will be done by Axes component)
   const axes = getContext('axes');
   $effect(() => {
      axes.setColmapLegend({show: true, breaks, colmap, labels, labelColor, fontSize})
   });
</script>



