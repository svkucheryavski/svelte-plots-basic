<!--
@component Adds z-axis with ticks, label, etc.

   Main properties:
   - `label` - text label for the axis (optional).
   - `showGrid` - logical, show or hide grid lines, default: `false`.
   - `ticks` - array or vector with tick positions (by default will be generated automatically based on `limZ`).
   - `tickLabels` - array with tick labels to show at each tick (by default will be generated automatically).
   - `lineColor` - color of axis line, default: `Colors.DARKGRAY`.
   - `gridColor` - color of axis grid line, default: `Colors.MIDDLEGRAY`.
   - `textColor` - color of axis text labels, default: `Colors.DARKGRAY`.

   Example:
   ```svelte
   <script>
      import {Axes, ZAxis} from 'svelte-plots-basic/3d';
   </script>
   <Axes>
      <ZAxis label="Z" showGrid={true} />
   </Axes>
   ```
-->
<script>
   import { getContext, onDestroy } from 'svelte';
   import { Colors } from '../constants';

   let {
      ticks,                           // vector with numeric tick positions in plot units
      tickLabels = ticks,              // vector with labels for each tick
      showGrid = false,                // logical, show or not grid lines
      label = '',                      // axis title
      lineColor = Colors.DARKGRAY,
      gridColor = Colors.MIDDLEGRAY,
      textColor = Colors.DARKGRAY,
   } = $props();


   // get axes context and synchronize z-axis settings
   const axes = getContext('axes');
   $effect(() => {
      axes.setZAxis({show: true, ticks, tickLabels, showGrid, label, lineColor, gridColor, textColor});
   });

   onDestroy(() => {
      axes.setZAxis({show: false});
   });
</script>
