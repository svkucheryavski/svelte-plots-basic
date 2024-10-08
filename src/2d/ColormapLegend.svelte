<script>
   /*********************************************************
   * ColormapLegend                                         *
   * --------------------                                   *
   * shows color map legend on a plot                       *
   **********************************************************/

   import { getContext } from 'svelte';
   import { checkCoords, getTickLabels, getTickFactorLabel } from '../Utils';
   import { Vector, isvector } from 'mdatools/arrays';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let breaks;                  // vector with breaks for color intervals or vector with their indices
   export let colmap;                  // array with colors for each interval
   export let decNum = 1;              // number of decimals to show the interval boundaries with
   export let labels = null;           // optional vector with labels for interval boundaries or elements
   export let labelColor = '#909090';  // color of labels
   export let fontSize = 0.85;         // font size for labels in em

   // if number of breaks is the same as number of elements in color map
   // the corresponding labels will be placed in the middle inder each color element in the legend
   // if this number is by one larger, the labels will be placed on the boundaries

   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // constant parameters
   const WIDTH_RATIO = 0.80;    // legend will span 80% of plot width
   const HEIGHT_RATIO = 0.02;   // legend will span 2% of plot height
   const TOP_MARGIN = 0.25;     // legend top margin is 25% of its height

   // height of the legend elements in pixels
   const EL_HEIGHTS_PX = {'small': 5, 'medium': 8, 'large': 12, 'xlarge': 15};

   // check breaks values
   $: if (!breaks || breaks.length < 2) {
      throw new Error('ColormapLegend: breaks values must be provided.');
   }

   // check colormap values
   $: if (!colmap || !(colmap.length === breaks.length - 1 || colmap.length === breaks.length )) {
      throw new Error('ColormapLegend: number of color values in colormap does not match number of intervals defined by breaks.');
   }

   // define local variables for breaks and prepare breaks labels
   $: lBreaks = isvector(breaks) ? breaks.v : breaks;

   let breakFactor, breakLabels;
   $: if (lBreaks) {
      [breakFactor, breakLabels] = getTickLabels(lBreaks);
   } else {
      breakFactor = null;
      breakLabels = null;
   }

   $: lLabels = labels && labels.length === lBreaks.length ? labels : breakLabels;

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
   $: isCentered = lLabels && lLabels.length === n;

   // compute screen coordinates of the elements
   let dxl, rx, ry, rw, rh = undefined;
   $: {
      if ($isOk) {
         // compute size of the whole block in plot coordinates
         const axesWidth = $xLim[1] - $xLim[0];
         const axesHeight = $yLim[1] - $yLim[0];
         const width = axesWidth * WIDTH_RATIO;
         const height = axesHeight * HEIGHT_RATIO;

         // compute elements size and position
         const elWidth = width / (n + (breakFactor !== 0));
         const left = $xLim[0] + axesWidth * (1 - WIDTH_RATIO) * 0.5 ;
         const elTop = $yLim[1] - height * TOP_MARGIN;

         // compute screen coordinates and sized
         ry = axes.transform(checkCoords([elTop], 'Rectangles'), $tY.coords);
         rx = axes.transform(Vector.seq(0, n).apply(v => left + v * elWidth), $tX.coords);
         rw = axes.transform([elWidth], $tX.objects);
         rh = EL_HEIGHTS_PX[$scale];
         dxl = isCentered ? rw[0] / 2 : 0
      }
   };
</script>

{#if $isOk && rx.length > 0}
   <g class="series colormap_legend" style="stroke:0;stroke-width:0px;">
   {#each colmap as col, i}
      <rect x={rx[i]} y={ry} width={rw} height={rh} fill="{col}"/>
      <text x={rx[i]} y={ry} dx={dxl} dy={rh * 1.25} dominant-baseline="hanging" fill={labelColor} font-size="{fontSize}em" text-anchor="middle">{@html lLabels[i]}</text>
   {/each}
   {#if !isCentered}
   <text x={rx[n]} y={ry} dx={0} dy={rh * 1.25} dominant-baseline="hanging" fill={labelColor} font-size="{fontSize}em" text-anchor="middle">{@html lLabels[n]}</text>
   {/if}

   {#if breakFactor !== 0}
   <text x={rx[n] + rw[0] * 0.85} y={ry[0] + rh * 2.2} dx={0} dy={0} dominant-baseline="hanging" fill={labelColor} font-size="{fontSize}em" text-anchor="middle">{@html getTickFactorLabel(breakFactor)}</text>
   {/if}

   </g>


{/if}



