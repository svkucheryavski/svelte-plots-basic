<script>
   /****************************************************
   * Axis for 3D plots                                 *
   * --------------------                              *
   * shows main elements for axis (ticks, grid, etc.)  *
   *****************************************************/

   import { Colors } from '../Colors';
   import AxisLines from './AxisLines.svelte';
   import TextLabels from './TextLabels.svelte';
   import AxisTickLabels from './AxisTickLabels.svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let tickLabels = [];     // vector with labels for each tick
   export let showGrid = false;    // logical, show or not grid lines
   export let title = '';          // axis title

   export let className = '';
   export let grid1 = [];
   export let grid2 = [];
   export let axisLine = [];
   export let tickCoords = [];
   export let titleCoords = [];

   export let lineColor = Colors.DARKGRAY;
   export let gridColor = Colors.MIDDLEGRAY;
   export let textColor = Colors.DARKGRAY;
</script>

<g class="mdaplot__axis {className}">

   <!-- grid -->
   {#if showGrid }
      <AxisLines lineCoords={grid1} lineColor={gridColor} lineType={3} />
      <AxisLines lineCoords={grid2} lineColor={gridColor} lineType={3} />
   {/if}

   <!-- main axis line -->
   <AxisLines lineCoords={axisLine} lineColor={lineColor} lineType={1} />

   <!-- ticks-->
   <AxisLines lineCoords={[tickCoords[0], tickCoords[1]]} lineColor={lineColor} lineType={1} />
   <AxisLines lineCoords={[tickCoords[0], tickCoords[2]]} lineColor={lineColor} lineType={1} />
   <AxisLines lineCoords={[tickCoords[0], tickCoords[3]]} lineColor={lineColor} lineType={1} />

   <!-- labels -->
   {#if tickCoords !== undefined }
   <AxisTickLabels tickCoords={tickCoords[4]} {textColor} {tickLabels}  />
   {/if}

   <!-- title -->
   {#if titleCoords !== undefined && title !== ''}
   <TextLabels
      xValues={titleCoords[0]} yValues={titleCoords[1]} zValues={titleCoords[2]}
      faceColor={textColor}
      labels={title}
   />
   {/if}
</g>

