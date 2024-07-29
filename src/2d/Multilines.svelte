<script>
   /****************************************************
   * Multilines                                        *
   * --------------------                              *
   * shows series of lines components                  *
   *****************************************************/

   import { getContext } from 'svelte';
   import { ismatrix } from 'mdatools/arrays';
   import { Colors } from '../Colors';
   import { val2p } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let xValues;                       // vector or array with x-coordinates of the points
   export let yValues;                       // matrix (!) with y-coordinates of the points - every column is separate line
   export let lineWidth = 1;                 // width (thickness) of the lines
   export let lineColor = Colors.PRIMARY;    // color of the lines
   export let lineType = 1;                  // type of the lines (1 - solid, 2 - dashed, 3 - dotted, 4 - dashdot)
   export let title = '';                    // title of the bar series (reserved for future use)


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context
   const axes = getContext('axes');

   const scale = axes.scale;
   const isOk = axes.isOk;
   const tX = axes.tX;
   const tY = axes.tY;

   // compute polynomial coordinates as string
   let pp;
   $: if ($isOk) {

      if (!ismatrix(yValues)) {
         throw Error('Multilines: parameter "yValues" must be a matrix.');
      }

      if (xValues.length !== yValues.nrows) {
         throw Error('Multilines: parameter "xValues" must have the same number of values as number of rows in "yValues".');
      }

      pp = new Array(yValues.ncols);
      for (let i = 0; i < pp.length; i++) {
         pp[i] = val2p(xValues, yValues.getcolumn(i + 1), $tX, $tY, axes);
      }
   }

   // reactive variables for coordinates of data points in pixels
   $: lineStyleStr = `fill:transparent;stroke:${lineColor};stroke-width: ${lineWidth}px; stroke-dasharray:${axes.LINE_STYLES[$scale][lineType-1]}`;
</script>

{#if $isOk && pp !== undefined && pp.length > 0}
   <g class="series series-multiline" style={lineStyleStr} title={title}>
      {#each pp as p}
      <polyline class="line" points={p}/>
      {/each}
   </g>
{/if}

