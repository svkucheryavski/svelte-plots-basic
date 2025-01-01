<!--
@component Adds y-axis with ticks, label, etc.

   Main properties:
   - `label` - text label for the axis (optional).
   - `showGrid` - logical, show or not vertical grid lines, default: `false`.
   - `ticks` - array or vector with tick positions (by default will be generated automatically based on `limX`).
   - `tickLabels` - array with tick labels to show at each tick (by default will be generated automatically).
   - `lineColor` - color of axis line, default: `Colors.DARKGRAY`.
   - `gridColor` - color of axis grid line, default: `Colors.MIDDLEGRAY`.
   - `textColor` - color of axis text labels, default: `Colors.DARKGRAY`.

   Example:
   ```jsx
   <script>
      import {Axes, YAxis} from 'svelte-plots-basic/3d';
   </script>
   <Axes>
      // all other plotting components are here
      <YAxis label="Y" showGrid={true} />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
   import { Colors } from '../constants';

   let {
      ticks,                           // vector with numeric tick positions in plot units
      tickLabels = ticks,              // vector with labels for each tick
      showGrid = false,                // logical, show or not grid lines
      label = '',                      // axis label
      lineColor = Colors.DARKGRAY,
      gridColor = Colors.MIDDLEGRAY,
      textColor = Colors.DARKGRAY,
   } = $props();


   // get axes context and adjust x margins
   const axes = getContext('axes');
   $effect(() => {
      axes.setYAxis({show: true, ticks, tickLabels, showGrid, label, lineColor, gridColor, textColor});
   });
</script>


