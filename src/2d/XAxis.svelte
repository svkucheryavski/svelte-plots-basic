<script>
   /****************************************************
   * X-Axis                                            *
   * --------------------                              *
   * shows x-axis and its elements (ticks, grid, etc.) *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Vector, vector } from 'mdatools/arrays';
   import { Colors } from '../Colors.js';
   import { getAxisTicks, getTickLabels } from '../Utils.js';
   import Axis from './Axis.svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let slot = 'xaxis';                // slot the component must be placed in (must be "xaxis")
   export let ticks = undefined;             // vector with numeric tick positions (by default is computed automatically)
   export let tickLabels = undefined;        // vector with labels for each tick (by default tick values will be used)
   export let showGrid = false;              // logical, show or not grid lines
   export let las = 1;                       // orientation of tick labels (1 - horizontal, 2 - vertical)
   export let whole = false;                 // should the ticks be a whole number or not

   export let lineColor = Colors.DARKGRAY;   // color of axis and tick lines
   export let gridColor = Colors.MIDDLEGRAY; // color og grid lines
   export let textColor = Colors.DARKGRAY;   // color of text tick labels


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // sanity checks of input parameters
   if (slot !== 'xaxis') {
      throw('Component XAxis must have "slot=\'xaxis\'" attribute.');
   }

   // get axes context and adjust x margins
   const axes = getContext('axes');

   // get reactive variables needed to compute coordinates
   const xLim = axes.xLim;
   const yLim = axes.yLim;
   const scale = axes.scale;
   const isOk = axes.isOk;
   const tY = axes.tY;

   // prepare variables for coordinates
   let grid = [];
   let axisLine = [];
   let tickCoords = [];
   let tfCoords = [];
   let tickFactor = 0;

   // compute coordinates for ticks, grid and axis line
   $: if ($isOk) {

      // compute x-coordinates of the ticks or take the ones manually specified by user
      const ticksX = getAxisTicks(ticks, $xLim, axes.TICK_NUM[$scale], true, whole);
      const tickNum = ticksX.length;

      // compute tick y-coordinates (up and bottom)
      const dY = axes.invTransform([axes.TICK_SIZE[$scale]], $tY.objects)[0];
      const ticksY1 = Vector.fill($yLim[0], tickNum);
      const ticksY2 = ticksY1.add(dY);

      // compute coordinates for the ends of grid
      const gridYEnd = Vector.fill($yLim[1], tickNum);

      // tick labels and tick factor
      if (ticks === undefined || tickLabels === undefined) {
         [tickFactor, tickLabels] = getTickLabels(ticksX.v);
      }

      if (tickLabels.length !== ticksX.length) {
         throw('XAxis: "tickLabels" must be a array of the same size as ticks.')
      }

      // combine all coordinates together
      grid = [
         [ticksX, ticksY1],
         [ticksX, gridYEnd]
      ];

      axisLine = [
         [vector([$xLim[0]]), vector([$yLim[0]])],
         [vector([$xLim[1]]), vector([$yLim[0]])]
      ]

      tickCoords = [
         [ticksX, ticksY2],
         [ticksX, ticksY1]
      ];

      tfCoords = [
         [null, null],
         [[$xLim[1]], [ticksY1.v[tickNum - 1] - 1.5 * dY]],
      ];
   }
</script>

{#if $isOk && axisLine.length > 0}
<Axis
   className="mdaplot__xaxis" pos={1}
   {lineColor} {gridColor} {textColor} {showGrid} {grid} {axisLine}
   {tickCoords} {tickLabels} {tfCoords} {tickFactor} {las}
/>
{/if}