<script>
   /*********************************************************
   * ColormapLegend                                         *
   * --------------------                                   *
   * shows color map legend on a plot                       *
   **********************************************************/

   import { getContext } from 'svelte';
   import { checkCoords } from '../Utils';
   import { Vector, isvector } from 'mdatools/arrays';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let breaks;                  // vector with breaks for color intervals
   export let colmap;                  // array with colors for each interval
   export let decNum = 1;              // number of decimals to show the interval boundaries with
   export let labels = null;           // optional vector with labels for interval boundaries
   export let labelColor = '#909090';  // color of labels
   export let fontSize = 0.85;         // font size for labels in em


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // constant parameters
   const WIDTH_RATIO = 0.80;    // legend will span 80% of plot width
   const HEIGHT_RATIO = 0.02;   // legend will span 2% of plot height
   const TOP_MARGIN = 0.25;     // legend top margin is 25% of its height

   // height of the legend elements in pixels
   const EL_HEIGHTS_PX = {'small': 5, 'medium': 10, 'large': 15, 'xlarge': 20};

   // check breaks values
   $: if (!breaks || breaks.length < 2) {
      throw new Error('ColormapLegend: breaks values must be provided.');
   }

   // check colormap values
   $: if (!colmap || colmap.length !== breaks.length - 1) {
      throw new Error('ColormapLegend: number of color values in colormap does not match number of intervals defined by breaks.');
   }

   // define local variables for breaks and prepare breaks labels
   $: lBreaks = isvector(breaks) ? breaks.v : breaks;
   $: lLabels = labels && labels.length === lBreaks.length ?
         labels :
         Array.from(lBreaks).map(v => v.toFixed(decNum).toString());

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const tX = axes.tX;
   const tY = axes.tY;
   const xLim = axes.xLim;
   const yLim = axes.yLim;
   const scale = axes.scale;
   const isOk = axes.isOk;

   // number of elements
   $: n = colmap.length;

   // compute screen coordinates of the elements
   let rx, ry, rw, rh = undefined;
   $: {
      if ($isOk) {
         // compute size of the whole block in plot coordinates
         const axesWidth = $xLim[1] - $xLim[0];
         const axesHeight = $yLim[1] - $yLim[0];
         const width = axesWidth * WIDTH_RATIO;
         const height = axesHeight * HEIGHT_RATIO;

         // compute elements size and position
         const elWidth = width / n;
         const left = $xLim[0] + axesWidth * (1 - WIDTH_RATIO) * 0.5 ;
         const elTop = $yLim[1] - height * TOP_MARGIN;

         // compute screen coordinates and sized
         ry = axes.transform(checkCoords([elTop], 'Rectangles'), $tY.coords);
         rx = axes.transform(Vector.seq(0, n).apply(v => left + v * elWidth), $tX.coords);
         rw = axes.transform([elWidth], $tX.objects);
         rh = EL_HEIGHTS_PX[$scale];
      }
   };
</script>

{#if $isOk && rx.length > 0}
   <g class="series colormap_legend" style="stroke:0;stroke-width:0px;">
   {#each colmap as col, i}
      <rect x={rx[i]} y={ry} width={rw} height={rh} fill="{col}"/>
      <text x={rx[i]} y={ry} dx={0} dy={rh * 1.25} alignment-baseline="hanging" fill={labelColor} font-size="{fontSize}em" text-anchor="middle">{@html lLabels[i]}</text>
   {/each}
   <text x={rx[n]} y={ry} dx={0} dy={rh * 1.25} alignment-baseline="hanging" fill={labelColor} font-size="{fontSize}em" text-anchor="middle">{@html lLabels[n]}</text>
   </g>
{/if}



