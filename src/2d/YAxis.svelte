<!--
@component Adds y-axis with ticks, label, etc.

   Main properties:
   - `label` - text label for the axis (optional).
   - `showGrid` - logical, show or not horizontal grid lines, default: `false`.
   - `ticks` - array or vector with tick positions (by default will be generated automatically based on `limX`).
   - `tickLabels` - array with tick labels to show at each tick (by default will be generated automatically).
   - `las` - orientation of tick labels (`1` - horizontal - default, `2` - vertical).
   - `whole` - logical, show numeric tick labels as whole numbers (without decimals) or not, default: `false`.

   Example:
   ```svelte
   <script>
      import {Axes, YAxis} from 'svelte-plots-basic/2d';
   </script>
   <Axes>
      <YAxis label="y-axis label" showGrid={true} />
   </Axes>
   ```
-->
<script>

   import { getContext } from 'svelte';
   import { text2svg, validateTicks, validateTickLabels } from '../methods';


   let {
      label,             // text label
      ticks,             // vector with numeric tick positions (by default is computed automatically)
      tickLabels,        // vector with labels for each tick (by default tick values will be used)
      las = 1,           // orientation of tick labels (1 - horizontal, 2 - vertical)
      whole = false,     // should the ticks be a whole number or not
      show = true,       // logical, use to hide the element
      showGrid = false,  // logical, show or not grid lines
   } = $props();


   // get axes context and send axis parameters to parent
   const axes = getContext('axes');

   // reactive effects to validate and activate user input
   $effect(() => {

      // process label text in case if there are sub or superscripts and adjust height of label correspondingly
      const axisLabel = text2svg(label);
      const labelHeight = axisLabel ? (axisLabel.length === label.length ? 1.0 : 1.4) : 0;


      // if ticks are provided check if they are valid and preprocess them
      let ticksProcessed, error = '';
      if (ticks) {
         [ticksProcessed, error] = validateTicks(ticks, axes.limY());
      }

      // if tick labels are provided check if they are valid and preprocess them
      let tickLabelsProcessed;
      if (!error && tickLabels) {
         [tickLabelsProcessed, error] = validateTickLabels(tickLabels, ticksProcessed);
      }

      // activate axis
      axes.setYAxis({show, error: error, label: axisLabel, ticks: ticksProcessed,
         labelHeight, showGrid, las, whole, tickLabels: tickLabelsProcessed, pos: 4});
   });
</script>
