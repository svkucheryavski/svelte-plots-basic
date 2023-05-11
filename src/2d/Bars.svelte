<script>
   /****************************************************
   * Bars                                              *
   * --------------------                              *
   * shows series of bars on a plot                    *
   *****************************************************/

   import { max, diff } from 'mdatools/stat';
   import { Vector } from 'mdatools/arrays';
   import { Colors } from '../Colors';
   import { checkCoords } from '../Utils';

   import Rectangles from './Rectangles.svelte';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let xValues;                       // vector with x-coordinates of middle points of the bars
   export let yValues;                       // vector with y-coordinates of top points of the bars
   export let barWidth = 0.8;                // width of bars as per cent of maximum width
   export let faceColor = Colors.PRIMARY;    // face color of the bars
   export let borderColor = Colors.PRIMARY;  // border color of the bars
   export let title = '';                    // title of the bar series (reserved for future use)


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   let width, left, top, height;

   // reactive code for computing position of left sides and bar width
   $: {

      if (!barWidth) {
         barWidth = 0.8;
      }

      if (barWidth <= 0 || barWidth > 1) {
         throw Error('BarSeries: parameters "barWidth" should be between 0 and 1.');
      }

      // compute maximum bar width and position of left side
      const xv = checkCoords(xValues, 'BarSeries');
      const w = max(diff(xv)) * barWidth;
      left = xv.subtract(w/2);
      width = Vector.fill(w, xv.length);
   }

   // reactive code for computing position of top sides and bar height
   $: {

      const yv = checkCoords(yValues, 'BarSeries');
      if (yv.length !== left.length) {
         throw Error('BarSeries: parameters "yValues" must be vector of the same length as "xValues".');
      }

      top = yv.apply(v => v > 0 ? v : 0);
      height = yv.apply(v => Math.abs(v));
   }
</script>

<Rectangles className="series_bar" {left} {top} {width} {height} {borderColor} {faceColor} {title} />
