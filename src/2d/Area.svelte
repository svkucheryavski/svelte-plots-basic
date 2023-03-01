<script>
   /****************************************************
   * Area                                              *
   * --------------------                              *
   * shows area of a polygon defined by set of points  *
   *****************************************************/

   import { getContext } from 'svelte';
   import { vector } from 'mdatools/arrays';
   import { Colors } from '../Colors';
   import { checkCoords, val2p } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let xValues;                       // x-coordinates of polygon (array or vector)
   export let yValues;                       // y-coordinates of polygon (array or vector)
   export let lineWidth = 1;                 // width of polygon lines
   export let lineColor = Colors.PRIMARY;    // color for polygon lines
   export let fillColor = Colors.PRIMARY;    // color of area inside polygon
   export let opacity = 1;                   // opacity of the area color
   export let lineType = 1;                  // type of lines connected the points (1 - solid, 2 - dashed, 3 - dotted)
   export let title = '';                    // title of this element (reserved for future use)


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context
   const axes = getContext('axes');

   const scale = axes.scale;
   const isOk = axes.isOk;
   const tX = axes.tX;
   const tY = axes.tY;

   // reactive variables for coordinates of data points in pixels
   let p, xs, y0, xe = undefined;
   $: {

      if ($isOk) {
         const xv = checkCoords(xValues, 'AreaSeries');
         p = val2p(xv, yValues, $tX, $tY, axes);
         y0 = axes.transform(vector([0]), $tY.coords)[0];
         xs = axes.transform(xv.subset(1), $tX.coords)[0];
         xe = axes.transform(xv.subset(xValues.length), $tX.coords)[0];
      }
   }

   $: areaStyleStr = `opacity:${opacity};fill:${fillColor};stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${axes.LINE_STYLES[$scale][lineType - 1]}`;
</script>

{#if $isOk && p !== undefined}
   <g class="series series_area" style={areaStyleStr} title={title}>
   <polygon points="{xs + "," + y0 + " " + p + " " + xs + "," + y0}"/>
   </g>
{/if}

