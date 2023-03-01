<script>
   /****************************************************
   * ColorLegend                                       *
   * --------------------                              *
   * shows color legend on top part of the plot        *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let colormap;    // colormap returned by method getcolormap() from colors

   /*****************************************/
   /* Component code                        */
   /*****************************************/

   const axes = getContext('axes');
   const xLim = axes.xLim;
   const yLim = axes.yLim;
   const tX = axes.tX;
   const tY = axes.tY;
   const isOk = axes.isOk;


   // TODO: will be implemented as a sequence of rectangles and text labels beneath them

   // compute coordinates of rectangles and their colors

   // compute coordinates of text labels
</script>

