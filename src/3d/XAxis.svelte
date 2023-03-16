<script>
   /****************************************************
   * X-Axis for 3D plots                               *
   * --------------------                              *
   * shows x-axis and its elements (ticks, grid, etc.) *
   *****************************************************/

   import { cbind, matrix, Vector } from 'mdatools/arrays';
   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { getAxisTicks } from '../Utils.js';
   import Axis from './Axis.svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let slot = 'xaxis';         // slot the component must be placed in
   export let ticks = undefined;      // vector with numeric tick positions in plot units
   export let tickLabels = ticks;     // vector with labels for each tick
   export let showGrid = false;       // logical, show or not grid lines
   export let title = '';             // axis title

   export let lineColor = Colors.DARKGRAY;
   export let gridColor = Colors.MIDDLEGRAY;
   export let textColor = Colors.DARKGRAY;


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   if (slot !== 'xaxis') {
      throw('Component XAxis must have "slot=\'xaxis\'" attribute.');
   }

   // get axes context and adjust x margins
   const axes = getContext('axes');

   // get reactive variables needed to compute coordinates
   const xLim = axes.xLim;
   const yLim = axes.yLim;
   const zLim = axes.zLim;
   const scale = axes.scale;
   const isOk = axes.isOk;

   // prepare variables for coordinates
   let titleCoords = [];
   let grid1 = [];
   let grid2 = [];
   let axisLine = [];
   let tickCoords = [];

   // compute tick x-coordinates
   $: if ($isOk) {
      const dX = ($xLim[1] - $xLim[0]) / 100; // 1% of axis size
      const ticksX = getAxisTicks(ticks, $xLim, axes.TICK_NUM[$scale], true);
      const tickNum = ticksX.length;

      // compute tick y-coordinates (middle, up and bottom)
      const dY = ($yLim[1] - $yLim[0]) / 100; // 1% of axis size
      const ticksY  = Vector.fill($yLim[0], tickNum);
      const ticksY1 = ticksY.subtract(dY * 1.5);
      const ticksY2 = ticksY.add(dY * 1.5);
      const ticksY3 = ticksY.subtract(dY * 5);

      // tick z-coordinates (middle, up and bottom)
      const dZ = ($zLim[1] - $zLim[0]) / 100; // 1% of axis size
      const ticksZ  = Vector.fill($zLim[0], tickNum);
      const ticksZ1 = ticksZ.subtract(dZ * 1.5);
      const ticksZ2 = ticksZ.add(dZ * 1.5);
      const ticksZ3 = ticksZ.subtract(dZ * 2);

      // coordinates for the ends of grid
      const gridYEnd = Vector.fill($yLim[1], tickNum);
      const gridZEnd = Vector.fill($zLim[1], tickNum);

      // tick labels
      tickLabels = (ticks === undefined || tickLabels === undefined) ? ticksX.v : tickLabels;
      if (tickLabels.length !== ticksX.length) {
         throw Error('XAxis: "tickLabels" must be a array of the same size as ticks.');
      }

      // combine all coordinates together
      grid1 = [
         cbind(ticksX, ticksY, ticksZ),
         cbind(ticksX, gridYEnd, ticksZ)
      ];

      grid2 = [
         cbind(ticksX, ticksY, ticksZ),
         cbind(ticksX, ticksY2, gridZEnd)
      ];

      axisLine = [
         matrix([$xLim[0], $yLim[0], $zLim[0]], 1, 3),
         matrix([$xLim[1], $yLim[0], $zLim[0]], 1, 3)
      ]

      tickCoords = [
         cbind(ticksX, ticksY, ticksZ),   // middle point
         cbind(ticksX, ticksY2, ticksZ),  // middle point with positive shift along Y
         cbind(ticksX, ticksY, ticksZ2),  // middle point with positive shift along Z
         cbind(ticksX, ticksY1, ticksZ1),  // middle point with negative shift along Y and Z
         cbind(ticksX, ticksY3, ticksZ3)  // middle point with negative shift along Y and Z for ticks
      ];

      // here we do not need to make a matrix as the three values will be used as vectors
      titleCoords = [
         [$xLim[1] + dX], [$yLim[0] - 2 * dY], [$zLim[0] - 2 * dZ]
      ];
   }
</script>

{#if $isOk && axisLine.length > 0}
<Axis
   className="mdaplot__xaxis"
   {title} {lineColor} {gridColor} {textColor} {titleCoords}
   {showGrid} {grid1} {grid2} {axisLine} {tickCoords} {tickLabels}
/>
{/if}

