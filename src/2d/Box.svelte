<!--
@component Shows box around axes.

   Main properties:
   - `lineWidth` - width of box line in pixels, default: `1`.
   - `lineColor` - color of the box line, default: `'#606060'`.

   Example:
   ```svelte
   <script>
      import {Axes, Box} from 'svelte-plots-basic/2d';
   </script>
   <Axes>
      <Box />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';

   let {lineWidth = 1, lineColor = '#606060'} = $props();
   const axes = getContext('axes');

   $effect(() => {
      axes.setBox({show:true, lineWidth, lineColor});
   });
</script>

