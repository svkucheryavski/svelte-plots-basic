<script>
   /****************************************************
   * Y-Axis                                            *
   * --------------------                              *
   * shows y-axis and its elements (ticks, grid, etc.) *
   *****************************************************/

   import { getContext } from 'svelte';
   import { vector } from 'mdatools/arrays';
   import { Colors } from '../Colors.js';
   import { getAxisTicks } from '../Utils.js';
   import Axis from './Axis.svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let slot = 'yaxis';                // slot the component must be placed in (must be "yaxis")
   export let ticks = undefined;             // vector with numeric tick positions (by default is computed automatically)
   export let tickLabels = undefined;        // vector with labels for each tick (by default tick values will be used)
   export let showGrid = false;              // logical, show or not grid lines
   export let las = 1;                       // orientation of tick labels (1 - horizontal, 2 - vertical)

   export let lineColor = Colors.DARKGRAY;   // color of axis and tick lines
   export let gridColor = Colors.MIDDLEGRAY; // color og grid lines
   export let textColor = Colors.DARKGRAY;   // color of text tick labels


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // sanity checks of input parameters
   if (slot !== 'yaxis') {
      throw('Component YAxis must have "slot=\'yaxis\'" attribute.');
   }

   // get axes context and adjust x margins
   const axes = getContext('axes');

   // get reactive variables needed to compute coordinates
   const xLim = axes.xLim;
   const yLim = axes.yLim;
   const scale = axes.scale;
   const isOk = axes.isOk;
   const tX = axes.tX;

   // prepare variables for coordinates
   let grid = [];
   let axisLine = [];
   let tickCoords = [];

   // compute tick x-coordinates
   $: if ($isOk) {

      // compute x-coordinates of the ticks or take the ones manually specified by user
      const ticksY = getAxisTicks(ticks, $yLim, axes.TICK_NUM[$scale], true);
      const tickNum = ticksY.length;

      // compute tick y-coordinates (up and bottom)
      const dX = axes.invTransform([axes.TICK_SIZE[$scale]], $tX.objects)[0];
      const ticksX1 = vector([$xLim[0]]).rep(tickNum)
      const ticksX2 = ticksX1.add(dX)

      // coordinates for the ends of grid
      const gridXEnd = vector([$xLim[1]]).rep(tickNum);

      // tick labels
      tickLabels = (ticks === undefined || tickLabels === undefined) ? ticksY.v : tickLabels;
      if (tickLabels.length !== ticksY.length) {
         throw('YAxis: "tickLabels" must be a array of the same size as ticks.')
      }

      // combine all coordinates together
      grid = [
         [ticksX1, ticksY],
         [gridXEnd, ticksY]
      ];

      axisLine = [
         [vector([$xLim[0]]), vector([$yLim[0]])],
         [vector([$xLim[0]]), vector([$yLim[1]])]
      ]

      tickCoords = [
         [ticksX1, ticksY],
         [ticksX2, ticksY]
      ];
   }
</script>

{#if $isOk && axisLine.length > 0}
<Axis
   className="mdaplot__yaxis" pos={4}
   {lineColor} {gridColor} {textColor}
   {showGrid} {grid} {axisLine} {tickCoords} {tickLabels} {las}
/>
{/if}