<script>
   /****************************************************
   * Z-Axis for 3D plots                               *
   * --------------------                              *
   * shows z-axis and its elements (ticks, grid, etc.) *
   *****************************************************/

   import { cbind, matrix, vector } from 'mdatools/arrays';
   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { getAxisTicks } from '../Utils.js';
   import Axis from './Axis.svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let slot = 'zaxis';         // slot the component must be placed in
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

   if (slot !== 'zaxis') {
      throw('Component ZAxis must have "slot=\'zaxis\'" attribute.');
   }

   // get axes context
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
   if ($isOk) {
      const dZ = ($zLim[1] - $zLim[0]) / 100; // 1% of axis size
      const ticksZ = getAxisTicks(ticks, $zLim, axes.TICK_NUM[$scale], true);
      const tickNum = ticksZ.length;

      // compute tick x-coordinates (middle, up and bottom)
      const dX = ($xLim[1] - $xLim[0]) / 100; // 1% of axis size
      const ticksX  = vector([$xLim[0]]).rep(tickNum);
      const ticksX1 = ticksX.subtract(dX);
      const ticksX2 = ticksX.add(dX);
      const ticksX3 = ticksX.subtract(dX * 3);

      // tick y-coordinates
      const dY = ($yLim[1] - $yLim[0]) / 100; // 1% of axis size
      const ticksY  = vector([$yLim[0]]).rep(tickNum);
      const ticksY1 = ticksX.subtract(dY);
      const ticksY2 = ticksX.add(dY);
      const ticksY3 = ticksX.subtract(dY * 3);

      // coordinates for the ends of grid
      const gridXEnd = vector([$xLim[1]]).rep(tickNum);
      const gridYEnd = vector([$yLim[1]]).rep(tickNum);

      // tick labels
      tickLabels = (ticks === undefined || tickLabels === undefined) ? ticksZ.v : tickLabels;
      if (tickLabels.length !== ticksZ.length) {
         throw Error('ZAxis: "tickLabels" must be a array of the same size as ticks.');
      }

      // combine all coordinates together
      grid1 = [
         cbind(ticksX, ticksY, ticksZ),
         cbind(gridXEnd, ticksY, ticksZ)
      ];

      grid2 = [
         cbind(ticksX, ticksY, ticksZ),
         cbind(ticksX, gridYEnd, ticksZ)
      ];

      axisLine = [
         matrix([$xLim[0], $yLim[0], $zLim[0]], 1, 3),
         matrix([$xLim[0], $yLim[0], $zLim[1]], 1, 3)
      ]

      tickCoords = [
         cbind(ticksX, ticksY, ticksZ),   // middle point
         cbind(ticksX2, ticksY, ticksZ),  // middle point with positive shift along X
         cbind(ticksX, ticksY2, ticksZ),  // middle point with positive shift along Y
         cbind(ticksX1, ticksY1, ticksZ), // middle point with negative shift along X and Y
         cbind(ticksX3, ticksY3, ticksZ)  // middle point with negative shift along X and Y for ticks
      ];

      // here we do not need to make a matrix as the three values will be used as vectors
      titleCoords = [
         [$xLim[0] - 2 * dX], [$yLim[0] - 2 * dY], [$zLim[1] + dZ]
      ];
   }
</script>

{#if $isOk && axisLine.length > 0}
<Axis
   className="mdaplot__zaxis"
   {title} {lineColor} {gridColor} {textColor} {titleCoords}
   {showGrid} {grid1} {grid2} {axisLine} {tickCoords} {tickLabels}
/>
{/if}

