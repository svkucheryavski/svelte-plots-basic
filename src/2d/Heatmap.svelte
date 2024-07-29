<script>
   /*********************************************************
   * Heatmap                                                *
   * --------------------                                   *
   * shows matrix values as a heatmap                       *
   **********************************************************/

   import { getContext } from 'svelte';
   import { Vector, ismatrix } from 'mdatools/arrays';
   import { expandgrid } from 'mdatools/misc';
   import { split } from 'mdatools/stat';

   import { getcolmap } from '../Colors';
   import { checkCoords } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let values;                        // Matrix with values to show heatmap for
   export let breaks = null;                 // vector with breaks to distribute the values in
   export let colmap = null;                 // array with colors for each interval

   export let className = 'series-heatmap';  // CSS class name of the SVG group
   export let title = '';                    // title of the rectangle series (reserved for future use)


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // check values
   $: if (!ismatrix(values) || values.v.length === 0) {
      throw new Error('Heatmap: parameter "values" must be a matrix.');
   }

   // check breaks values
   $: if (!lBreaks || lBreaks.length < 2) {
      throw new Error('Heatmap: breaks values are neither defined nor can not be computed.');
   }

   // check colormap values
   $: if (!lColmap || lColmap.length !== lBreaks.length - 1) {
      throw new Error('Heatmap: number of color values in colormap does not match number of intervals defined by breaks.');
   }

   // define local variables for breaks and colormap
   $: lBreaks = breaks ? breaks.v : split(values.v, 13).v;
   $: lColmap = colmap ? colmap : getcolmap(lBreaks.length - 1);

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const tX = axes.tX;
   const tY = axes.tY;
   const isOk = axes.isOk;

   // compute combinations of heatmap element positions
   let top, left;
   $: {
      const x = Vector.seq(1, values.ncols);
      const y = Vector.seq(1, values.nrows);
      [top, left] = expandgrid(y.v, x.v);
   }

   // compute screen coordinates of the elements for each interval
   let rx, ry, rw, rh = undefined;
   $: {
      if ($isOk) {
         rx = [];
         ry = [];
         for (let i = 1; i < lBreaks.length; i++) {
            let lleft = [];
            let ltop = [];
            for (let j = 0; j < values.v.length; j++) {
               const v = values.v[j];
               if (v > lBreaks[i - 1] && v <= lBreaks[i]) {
                  lleft.push(left.v[j] - 0.5);
                  ltop.push(top.v[j] + 0.5);
               }
            }
            rx.push(lleft.length === 0 ? [] : axes.transform(checkCoords(lleft, 'Rectangles'), $tX.coords));
            ry.push(ltop.length === 0 ? [] : axes.transform(checkCoords(ltop, 'Rectangles'), $tY.coords));
         };

         rw = axes.transform([1], $tX.objects);
         rh = axes.transform([1], $tY.objects);
      }
   };

</script>

{#if $isOk && rx.length > 0}
   <g class="series {className}" title={title} style="stroke:0;stroke-width:0px;">
   <!-- loop over colors/intervals -->
   {#each lColmap as col, i}
      <g title="heatmap-group" style="fill:{col};">
      {#if rx[i].length > 0}
         <!-- loop over elements which fall into the interval -->
         {#each rx[i] as v, j}
            <rect x={rx[i][j]} y={ry[i][j]} width={rw} height={rh} />
         {/each}
      {/if}
      </g>
   {/each}
   </g>
{/if}


