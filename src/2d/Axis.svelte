<script>
   /****************************************************
   * Axis                                              *
   * ---------------------------------                 *
   * generic element for X- or Y-axis                  *
   * !!! not for users !!!                             *
   *****************************************************/

   import { Colors } from '../Colors.js';
   import AxisLines from './AxisLines.svelte';
   import AxisTickLabels from './AxisTickLabels.svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let tickLabels = [];               // vector with labels for each tick
   export let showGrid = false;              // logical, show or not grid lines
   export let las = 1;                       // rotation of tick labels

   export let pos = 1;                       // position of tick labels
   export let className = "";                // name of CSS class for the axis
   export let grid = [];                     // array with grid coordinates
   export let axisLine = [];                 // array with coordinates of main axis line
   export let tickCoords = [];               // array with axis tick coordinates
   export let tfCoords = [];                 // array with tick factor coordinates
   export let tickFactor = 0;                // tick factor (as power of 10)

   export let lineColor = Colors.DARKGRAY;   // color of main axis line
   export let gridColor = Colors.MIDDLEGRAY; // color of grid lines
   export let textColor = Colors.DARKGRAY;   // color of tick labels

   // generate text for tick factor label
   function getTickFactorLabel(tf) {
      if (tf === 0) return '';
      if (tf < 0) {
         return `&times;10<tspan baseline-shift = "super">${(tf).toString()}</tspan>`;
      } else {
         return `&times;10<tspan baseline-shift = "super">${(tf).toString()}</tspan>`;
      }
   }
</script>

<g class="mdaplot__axis {className}">
   <!-- grid -->
   {#if showGrid }
      <AxisLines lineCoords={grid} lineColor={gridColor} lineType={3} />
   {/if}

   <!-- main axis line -->
   <AxisLines lineCoords={axisLine} lineColor={lineColor} lineType={1} />

   <!-- ticks-->
   <AxisLines lineCoords={tickCoords} lineColor={lineColor} lineType={1} />

   <!-- labels -->
   {#if tickCoords.length === 2 && tickLabels.length === tickCoords[1][0].length}
   <AxisTickLabels {las} {pos} {tickCoords} {tickLabels} {textColor} />
   {/if}

   <!-- tick factor -->
   {#if tickFactor !== 0}
   <AxisTickLabels {pos} tickCoords={tfCoords} tickLabels={[getTickFactorLabel(tickFactor)]} {textColor} />
   {/if}
</g>

