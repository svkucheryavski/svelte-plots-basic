<script>
   /****************************************************
   * Y-Axis for 3D plots                               *
   * --------------------                              *
   * shows y-axis and its elements (ticks, grid, etc.) *
   *****************************************************/

   import { cbind, matrix, Vector } from 'mdatools/arrays';
   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { getAxisTicks } from '../Utils.js';
   import Axis from './Axis.svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let slot = 'yaxis';         // slot the component must be placed in
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

   if (slot !== 'yaxis') {
      throw('Component YAxis must have "slot=\'yaxis\'" attribute.');
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
      const dY = ($yLim[1] - $yLim[0]) / 100; // 1% of axis size
      const ticksY = getAxisTicks(ticks, $yLim, axes.TICK_NUM[$scale], true);
      const tickNum = ticksY.length;

      // compute tick y-coordinates (middle, up and bottom)
      const dX = ($xLim[1] - $xLim[0]) / 100; // 1% of axis size
      const ticksX  = Vector.fill($xLim[0], tickNum);
      const ticksX1 = ticksX.subtract(dX * 1.5);
      const ticksX2 = ticksX.add(dX * 1.5);
      const ticksX3 = ticksX.subtract(dX * 3);

      // tick z-coordinates (middle, up and bottom)
      const dZ = ($zLim[1] - $zLim[0]) / 100; // 1% of axis size
      const ticksZ  = Vector.fill($zLim[0], tickNum);
      const ticksZ1 = ticksZ.subtract(dZ * 1.5);
      const ticksZ2 = ticksZ.add(dZ * 1.5);
      const ticksZ3 = ticksZ.subtract(dZ * 2);

      // coordinates for the ends of grid
      const gridXEnd = Vector.fill($xLim[1], tickNum);
      const gridZEnd = Vector.fill($zLim[1], tickNum);

      // tick labels
      tickLabels = (ticks === undefined || tickLabels === undefined) ? ticksY.v : tickLabels;
      if (tickLabels.length !== ticksY.length) {
         throw Error('YAxis: "tickLabels" must be a array of the same size as ticks.');
      }

      // combine all coordinates together
      grid1 = [
         cbind(ticksX, ticksY, ticksZ),
         cbind(gridXEnd, ticksY, ticksZ)
      ];

      grid2 = [
         cbind(ticksX, ticksY, ticksZ),
         cbind(ticksX, ticksY, gridZEnd)
      ];

      axisLine = [
         matrix([$xLim[0], $yLim[0], $zLim[0]], 1, 3),
         matrix([$xLim[0], $yLim[1], $zLim[0]], 1, 3)
      ]

      tickCoords = [
         cbind(ticksX, ticksY, ticksZ),   // middle point
         cbind(ticksX2, ticksY, ticksZ),  // middle point with positive shift along X
         cbind(ticksX, ticksY, ticksZ2),  // middle point with positive shift along Z
         cbind(ticksX1, ticksY, ticksZ1),  // middle point with negative shift along X and Z
         cbind(ticksX3, ticksY, ticksZ3)  // middle point with negative shift along X and Z for ticks
      ];

      // here we do not need to make a matrix as the three values will be used as vectors
      titleCoords = [
         [$xLim[0] - 2 * dX], [$yLim[1] + 3 * dY], [$zLim[0] - 2 * dZ]
      ];
   }
</script>

{#if $isOk && axisLine.length > 0}
<Axis
   className="mdaplot__yaxis"
   {title} {lineColor} {gridColor} {textColor} {titleCoords}
   {showGrid} {grid1} {grid2} {axisLine} {tickCoords} {tickLabels}
/>
{/if}

