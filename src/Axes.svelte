<script>
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

   /* input parameters */
   export let limX = [undefined, undefined];    // limits for x-axis (in plot units) [min, max]
   export let limY = [undefined, undefined];    // limits for y-axis (in plot units) [min, max]
   export let title = "";                       // title of the plot
   export let xLabel = "";                      // label for x-axis
   export let yLabel = "";                      // label for y-axis

   /* constants for internal use */

   // how big are margins (number of pixels in unit margin value) between axis and plot area if axis are shown
   const AXES_MARGIN_FACTORS = {
      "small": 30,
      "medium": 40,
      "large": 50
   }

   // number of ticks along each axis
   const TICK_NUM = {
      "small": 5,
      "medium": 8,
      "large": 12
   };

   // margin between plot series elements and data labels
   const LABELS_MARGIN = {
      "small": 15,
      "medium": 20,
      "large": 25
   };

   // constant to make clip path ID unique
   const clipPathID = "plottingArea" + Math.round(Math.random() * 10000);

   /* parameters for internal use inside the component */
   let axesWrapper;                                   // pointer to axes wrapper DOM element
   let axesMargins = [0.034, 0.034, 0.034, 0.034];    // initial margins (will be multiplied to FACTORS)

   /* reactive parameters to be shared with children via context */
   const width = writable(100);        // actual width of plotting area in pixels
   const height = writable(100);       // actual height of plotting area in pixels
   const xLim = writable(limX);        // actual limits for x-axis in plot units
   const yLim = writable(limY);        // actual limits for y-axis in plot units
   const scale = writable("medium");   // scale factor (how big the shown plot is)
   const isOk = writable(false);       // are axes ready for drawing

   /** Adds margins for x-axis (e.g. when x-axis must be shown) */
   const addXAxisMargins = function() {
      axesMargins[1] = 1;
      axesMargins[3] = 0.5;
   }

   /** Adds margins for y-axis (e.g. when y-axis must be shown) */
   const addYAxisMargins = function() {
      axesMargins[0] = 1;
      axesMargins[2] = 0.25;
   }

   /** Adjusts limits for x-axis (e.g. when new series is added)
    *  @param {Array} newLim - vector with new limits  (two values)
    */
   const adjustXAxisLimits = function(newLim) {
      if (!limY.some(v => v === undefined)) return;
      xLim.update(lim => adjustAxisLimits(lim, newLim));
   }

   /** Adjusts limits for y-axis (e.g. when new series is added)
    *  @param {Array} newLim - vector with new limits  (two values)
    */
   const adjustYAxisLimits = function(newLim) {
      if (!limY.some(v => v === undefined)) return;
      yLim.update(lim => adjustAxisLimits(lim, newLim));
   }

   /** Adjusts x- or y- axis limits (e.g. when new elements are added)
    *  @param {Array} lim - vector with limits for current axis (two values)
    *  @param {Array} newLim - vector with new limits  (two values)
    *  @returns {Array} vector with rescaled values
    *
    *  The new limits are set separately for min and max. Either if current value is undefined or
    *  if new value is outside the current limits (smaller than min or larger than max).
    */
   const adjustAxisLimits = function(lim, newLim) {
      return [
         lim[0] === undefined || lim[0] > newLim[0] ? newLim[0] : lim[0],
         lim[1] === undefined || lim[1] < newLim[1] ? newLim[1] : lim[1]
      ];
   }

   /** Rescales x-values from plot coordinates to screen (SVG) coordinates
    *  @param {Array} x - vector with coordinates (or objects size) in original plot coordinates
    *  @param {Array} xLim - vector with current limits for x-axis in original plot coordinates
    *  @param {number} width - width of coordinate system in pixels
    *  @param {boolean} doSizeScreen - scale size of objects (true) or coordinates
    *  @returns {Array} vector with rescaled values
    */
   const scaleX = function(x, xLim, width, doSizeScale = false) {
      if (!$isOk  || x === undefined) return undefined;

      if (doSizeScale) {
         // scale size of objects instead of coordinates
         return x.map(v => v / (xLim[1] - xLim[0]) * (width - margins[1] - margins[3]));
      }

      return x.map(v => (v - xLim[0]) / (xLim[1] - xLim[0]) * (width - margins[1] - margins[3]) + margins[1]);
   }

   /** Rescales x-values from plot coordinates to screen (SVG) coordinates
    *  @param {Array} x - vector with coordinates (or objects size) in original plot coordinates
    *  @param {Array} xLim - vector with current limits for x-axis in original plot coordinates
    *  @param {number} width - width of coordinate system in pixels
    *  @param {boolean} doSizeScreen - scale size of objects (true) or coordinates
    *  @returns {Array} vector with rescaled values
    */
   const scaleY = function(y, yLim, height, doSizeScale = false) {
      if (!$isOk  || y === undefined) return undefined;

      if (doSizeScale) {
         // scale size of objects instead of coordinates
         return y.map(v => v / (yLim[1] - yLim[0]) * (height - margins[0] - margins[2]));
      }

      // for coordinates we also need to invert (flip) the y-axis
      return y.map(v => (yLim[1] - v) / (yLim[1] - yLim[0]) * (height - margins[0] - margins[2]) + margins[2]);
   }

   // computes nice tick values for axis
   const getAxisTicks = function(ticks, lim, maxTickNum, round = true) {

      // if ticks are already provided do not recompute them
      if (ticks !== undefined) return ticks;

      // check if limits are ok
      if (!Array.isArray(lim) || lim[0] === undefined || lim[1] === undefined) return undefined;

      // get range as a nice number and compute min, max and steps for the tick sequence
      const range = niceNum(lim[1] - lim[0], round);
      const tickSpacing = niceNum(range / (maxTickNum - 1), round);
      const tickMin = Math.ceil(lim[0] / tickSpacing) * tickSpacing;
      const tickMax = Math.floor(lim[1] / tickSpacing) * tickSpacing;

      // recompute maxTickNum
      maxTickNum = Math.round((tickMax - tickMin + 1) / tickSpacing) + 1;

      // create a sequence and return
      ticks = [...Array(maxTickNum)].map((x, i) => tickMin + i * tickSpacing);

      // make sure the ticks are not aligned with axes limits
      return ticks.filter(x => x >= lim[0] & x <= lim[1]);
   }

   // computes nice number for the ticks
   // inspired by:
   function niceNum( localRange,  round) {

      const exponent = Math.floor(Math.log10(localRange));
      const fraction = localRange / Math.pow(10, exponent);
      let niceFraction;
      if (round) {
         if (fraction < 1.5)
            niceFraction = 1;
         else if (fraction < 3)
            niceFraction = 2;
         else if (fraction < 7)
            niceFraction = 5;
         else
            niceFraction = 10;
      } else {
         if (fraction <= 1)
            niceFraction = 1;
         else if (fraction <= 2)
            niceFraction = 2;
         else if (fraction <= 5)
            niceFraction = 5;
         else
            niceFraction = 10;
      }

      return niceFraction * Math.pow(10, exponent);
   }

   // returns a scale category based on the plotting area size in pixels
   function getScale(width, height) {
      if (height < 300 || width < 400) return "small";
      if (height < 600 || width < 800) return "medium";
      return "large";
   }

   // context to share with children
   let context = {

      // methods
      addXAxisMargins: addXAxisMargins,
      addYAxisMargins: addYAxisMargins,
      adjustXAxisLimits: adjustXAxisLimits,
      adjustYAxisLimits: adjustYAxisLimits,
      getAxisTicks: getAxisTicks,
      scaleX: scaleX,
      scaleY: scaleY,

      // variables
      isOk: isOk,
      scale: scale,
      width: width,
      height: height,
      xLim: xLim,
      yLim: yLim,

      // constants
      LABELS_MARGIN: LABELS_MARGIN,
      TICK_NUM: TICK_NUM,
   }

	setContext('axes', context);

   // plot size observer
   var ro = new ResizeObserver(entries => {
      for (let entry of entries) {
         const cr = entry.contentRect;
         width.update(x => cr.width);
         height.update(x => cr.height);
         scale.update(x => getScale(cr.width, cr.height));
      }
   });

   onMount(() => {
      ro.observe(axesWrapper);
   });

   // real margins in pixels
   $: margins = axesMargins.map(v => v * AXES_MARGIN_FACTORS[$scale]);

   // status which tell that axes limits look fine and it is safe to draw
   $: isOk.update(v => Array.isArray($yLim) && Array.isArray($xLim) && !$yLim.some(v => v === undefined) && !$xLim.some(v => v === undefined))

   // coordinates for clip path box
   $: cpx = $isOk ? scaleX($xLim, $xLim, $width) : [0, 1];
   $: cpy = $isOk ? scaleY($yLim, $yLim, $height) : [1, 0];
</script>


<div class="plot {'plot_' + $scale}"  class:plot_error="{!$isOk}">

   <!-- plot title and axis labels -->
   {#if title !== ""}<div class="axes__title">{title}</div>{/if}
   {#if yLabel !== ""}<div class="axes__ylabel"><span>{yLabel}</span></div>{/if}
   {#if xLabel !== ""}<div class="axes__xlabel"><span>{xLabel}</span></div>{/if}

   <!-- axes (coordinate system) -->
   <div class="axes-wrapper" bind:this="{axesWrapper}" >
      <svg preserveAspectRatio="none" class="axes">
         <!-- clipping path -->
         <defs>
            <clipPath id="{clipPathID}">
               <rect x="{cpx[0]}" y="{cpy[1]}" width = "{cpx[1] - cpx[0]}" height="{cpy[0] - cpy[1]}"></rect>
            </clipPath>
         </defs>

         <!-- axis and box -->
         <slot name="xaxis"></slot>
         <slot name="yaxis"></slot>
         <slot name="box"></slot>

         <!-- main plot content -->
         <g clip-path="url(#{clipPathID})">
            <slot></slot>
         </g>
      </svg>
   </div>


   {#if !$isOk}
   <p class="message_error">Axes component was not properly initialized. <br />Add plot series or define axes limits manually.</p>
   {/if}

</div>

<style>

   /* Plot (main container) */
   .plot {
      font-family: Arial, Helvetica, sans-serif;

      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto 1fr auto;
      grid-template-areas:
         ". title"
         "ylab axes"
         ". xlab";

      box-sizing: border-box;
      background: #fefefe;
      min-width: 200px;
      min-height: 200px;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
   }

   .plot_small {
      font-size: 12px;
   }

   .plot_medium {
      font-size: 14px;
   }

   .plot_large {
      font-size: 18px;
   }

   .plot_error {
      display: flex;
   }

   .plot_error > .axes-wrapper {
      display: none;
   }

   .message_error {
      font-size: 1.2em;
      color: crimson;
      padding: 20px;
      text-align: center;
   }

   /* Axes (coordinate system) */
   .axes-wrapper {
      grid-area: axes;
      display: flex;
      padding: 0;
      margin: 0;
   }

   .axes {
      box-sizing: border-box;
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      max-height: 100%;
      max-width: 100%;
      min-height: 100%;
      min-width: 100%;
   }

   .axes__xlabel {
      grid-area: xlab;
      font-size: 1.0em;
      font-weight: 600;
      padding: 0.25em;
      text-align: center;
   }


   .axes__ylabel {
      grid-area: ylab;
      font-size: 1.0em;
      font-weight: 600;
      padding: 0.25em;
      text-align: center;
      vertical-align: middle;
      display: flex;
   }

   .axes__ylabel > span {
      width: 1.5em;
      line-height: 1.5em;
      display: inline-block;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
   }


   .axes__title {
      background: transparent;
      grid-area: title;

      font-size: 1.3em;
      font-weight: bold;
      line-height: 1.2em;
      padding: 0.4em;
      text-align: center;
   }

   /* Axis */
   .axis-labels {
      fill: #303030;
      font-size: 0.95em;
   }

   /* Data labels */
   .labels {
      fill: #606060;
      font-size: 0.90em;
   }

   .labels {
      visibility: hidden;
      transition:visibility 0.25s linear, opacity 0.25s linear;
      opacity: 0;
   }

</style>