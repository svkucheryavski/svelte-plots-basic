<script>
   /****************************************************
   * Axes                                              *
   * --------------------                              *
   * root item for any plot                            *
   *****************************************************/

	import { setContext, createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
   import { isvector, vector, Vector } from 'mdatools/arrays';
   import { roundCoords, getScale } from '../Utils.js';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let limX;                                   // array with limits for x-axis (in plot units) [min, max]
   export let limY         ;                          // array with limits for y-axis (in plot units) [min, max]
   export let title = '';                             // title of the plot
   export let xLabel = '';                            // label for x-axis
   export let yLabel = '';                            // label for y-axis
   export let margins = [0.034, 0.034, 0.034, 0.034]; // margins [bottom, left, top, right] )


   /*****************************************/
   /* Constants                             */
   /*****************************************/

   // event dispatcher
   const dispatch = createEventDispatcher();

   // how big are margins (number of pixels in unit margin value) between axis and plot area if axis are shown
   const AXES_MARGIN_FACTORS = {
      'small': 30,
      'medium': 40,
      'large': 50,
      'xlarge': 60
   }

   // number of ticks along each axis
   const TICK_NUM = {
      'small': 5,
      'medium': 8,
      'large': 12,
      'xlarge': 15
   };

   // size of ticks
   const TICK_SIZE = {
      'small': 4,
      'medium': 6,
      'large': 8,
      'xlarge': 10
   };

   // font size for legend items in pixels
   const LEGEND_FONT_SIZE = {
      "small": 10,
      "medium": 12,
      "large": 14,
      "xlarge": 16
   };

   // margin between plot series elements and data labels
   const LABELS_MARGIN = {
      'small': 10,
      'medium': 15,
      'large': 20,
      'xlarge': 25
   };

   // line styles for different scales and types
   const LINE_STYLES = {
      small: ['0', '3,3', '1,1', '3,1'],
      medium: ['0', '5,5', '2,2', '5,2'],
      large: ['0', '7,7', '3,3', '7,3'],
      xlarge: ['0', '9,9', '4,4', '9,3'],
   }

   // marker symbols
   const MARKER_SYMBOLS = ["●", "◼", "▲", "▼", "⬥", "＋", "*", "×"];

   // constant to make clip path ID unique
   const clipPathID = 'plottingArea' + Math.round(Math.random() * 10000);


   /*****************************************/
   /* Variable parameters for internal use  */
   /*****************************************/

   /* parameters for internal use inside the component */
   let plotElement;
   let axesElement;
   let width, height = 100;


   /*****************************************/
   /* Helper functions                      */
   /*****************************************/

   /**
    * Dispatcher for click events.
    * @param {string} eventName - name of the event.
    * @param {HTMLDOMElement} el - DOM element the click was registered for.
    *
    */
   function dispatchClickEvent(eventName, el) {
      const id = Array.prototype.indexOf.call(el.parentNode.children, el)
      dispatch(eventName, {seriesTitle: el.parentNode.getAttribute('title'), elementID: id});
   }

   /**
    * Handler (router) for click events.
    *
    * @param {event} e - event object.
    *
    * @description
    * Checks which element the click was made on and dispatch a corresponding event.
    *
    */
   function handleClick(e) {

      // click on scatter plot markers
      if (e.target.tagName === 'text' && e.target.parentNode.classList.contains('series_points')) {
         dispatchClickEvent('markerclick', e.target);
         return;
      }

      // click on bar plot bars
      if (e.target.tagName === 'rect' && e.target.parentNode.classList.contains('series_bar')) {
         dispatchClickEvent('barclick', e.target);
         return;
      }

      // click outside any plot element
      dispatch('axesclick');
   }

   /**
    * Generic function to transform x or y-values from plot coordinates to screen (SVG) coordinates.
    *
    * @param {Array|Vector} v - vector with coordinates (or objects size) in original plot coordinates.
    * @param {Object} tA - array with scaling and translation factors.
    *
    * @returns {Vector} vector with rescaled values
    *
    */
   const transform = function(v, tA) {

      if (!$isOk || v === undefined || v === null) return undefined;
      if (Array.isArray(v)) v = vector(v);
      if (!isvector(v) || v.length < 1) return undefined;

      return v.apply(a => roundCoords((a - tA[1]) * tA[0] + tA[2])).v;
   }


   /**
    * Generic function to transform x or y-values from screen (SVG) coordinates to plot coordinates.
    *
    * @param {Array|Vector} v - vector with coordinates (or objects size) in screen (SVG) coordinates.
    * @param {Object} tA - array with scaling and translation factors.
    *
    * @returns {Vector} vector plot coordinates.
    *
    */
   const invTransform = function(v, tA) {

      if (!$isOk || v === undefined || v === null) return undefined;
      if (Array.isArray(v)) v = vector(v);
      if (!isvector(v) || v.length < 1) return undefined;

      return v.apply(a => (a - tA[2]) / tA[0] + tA[1]).v;
   }

   /*****************************************/
   /* Storage to share with children        */
   /*****************************************/

   const scale = writable('medium');                                  // scale factor (how big the shown plot is)
   const tX = writable({'coords': [1, 0, 0], 'objects': [1, 0, 0]});  // scaling and translation factors for x-dimension
   const tY = writable({'coords': [1, 0, 0], 'objects': [1, 0, 0]});  // scaling and translation factors for y-dimension
   const isOk = writable(false);                                      // are axes ready for drawing
   const xLim = writable(limX);
   const yLim = writable(limY);


   /*****************************************/
   /* Axes context                          */
   /*****************************************/

   let context = {

      // methods
      transform: transform,
      invTransform: invTransform,

      // variables
      scale: scale,
      isOk: isOk,
      xLim: xLim,
      yLim: yLim,
      tX: tX,
      tY: tY,

      // constants
      LINE_STYLES: LINE_STYLES,
      LABELS_MARGIN: LABELS_MARGIN,
      TICK_NUM: TICK_NUM,
      TICK_SIZE: TICK_SIZE,
      MARKER_SYMBOLS: MARKER_SYMBOLS,
      LEGEND_FONT_SIZE: LEGEND_FONT_SIZE
   }

	setContext('axes', context);

   /*****************************************/
   /* Reactive updates of the parameters    */
   /*****************************************/

   // computes real margins in pixels based on current scale
   $: pxMargins = margins.map(v => v * AXES_MARGIN_FACTORS[$scale]);

   // update limits if necessary
   $: xLim.update(v => limX);
   $: yLim.update(v => limY);

   // computes status which tells that axes limits look fine and it is safe to draw
   // the status is based on the axis limits validity
   $: isOk.update(v =>
      Array.isArray($yLim) &&
      Array.isArray($xLim) &&
      $xLim.length === 2 &&
      $yLim.length === 2 &&
      !$yLim.some(v => v === undefined) &&
      !$xLim.some(v => v === undefined) &&
      !$yLim.some(v => isNaN(v)) &&
      !$xLim.some(v => isNaN(v)) &&
      $xLim[1] !== $xLim[0] &&
      $yLim[1] !== $yLim[0] &&
      width > (pxMargins[1] + pxMargins[3]) &&
      height > (pxMargins[0] + pxMargins[2])
   )

   // update transformation array for x-coordinates
   $: {
      if ($isOk) {
         tX.update(v => ({
            'coords':  [ (width - pxMargins[1] - pxMargins[3]) / ($xLim[1] - $xLim[0]), $xLim[0], pxMargins[1]],
            'objects': [ (width - pxMargins[1] - pxMargins[3]) / ($xLim[1] - $xLim[0]),       0,             0]
         }));
      }
   };

   // update transformation array for y-coordinates
   $: {
      if ($isOk) {
         tY.update(v => ({
            'coords':  [-(height - pxMargins[0] - pxMargins[2]) / ($yLim[1] - $yLim[0]), $yLim[1], pxMargins[2]],
            'objects': [ (height - pxMargins[0] - pxMargins[2]) / ($yLim[1] - $yLim[0]),        0,            0]
         }));
      }
   };

   // computes coordinates for clip path box
   $: cpx = $isOk ? transform($xLim, $tX.coords) : [0, 1];
   $: cpy = $isOk ? transform($yLim, $tY.coords) : [1, 0];


   /*****************************************/
   /* Events observers                      */
   /*****************************************/

   // observer for the plot area size — to update the scale
   const ro1 = new ResizeObserver(entries => {
      for (let entry of entries) {
         const pcr = plotElement.getBoundingClientRect();
         scale.update(x => getScale(pcr.width, pcr.height));
      }
   });

   // observer for the axes area size - to update size of axes
   const ro2 = new ResizeObserver(entries => {
      for (let entry of entries) {
         const acr = axesElement.getBoundingClientRect();
         width = acr.width;
         height = acr.height;
      }
   });

   onMount(() => {
      ro1.observe(plotElement);
      ro2.observe(axesElement);
   });

   onDestroy(() => {
      ro1.unobserve(plotElement);
      ro2.unobserve(axesElement);
   })

</script>

<div class="plot {'plot_' + $scale}"  bind:this={plotElement} class:plot_error={!$isOk}>
   <!-- plot title and axis labels -->
   {#if title !== ''}<div class="axes__title">{@html title}</div>{/if}
   {#if yLabel !== ''}<div class="axes__ylabel"><span>{@html yLabel}</span></div>{/if}
   {#if xLabel !== ''}<div class="axes__xlabel"><span>{@html xLabel}</span></div>{/if}

   <!-- axes (coordinate system) -->
   <div class="axes-wrapper" bind:this={axesElement} >
      <svg on:click={handleClick} on:keydown={handleClick} preserveAspectRatio="none" class="axes">

         <!-- define clipping path -->
         <defs>
            <clipPath id={clipPathID}>
               <rect style="pointer-events:none" x={cpx[0]} y={cpy[1]} width={cpx[1]-cpx[0]} height={cpy[0]-cpy[1]} />
            </clipPath>
         </defs>


         <!-- axis and box -->
         <slot name="xaxis"></slot>
         <slot name="yaxis"></slot>

         <!-- main plot content -->
         <g class="axes-content" clip-path="url(#{clipPathID})">
            <slot></slot>
         </g>


         <!-- axis and box -->
         <slot name="box"></slot>

      </svg>

   {#if !$isOk}
   <p class="message_error">
      Axes component was not properly initialized. <br />
      Check that you defined axes limits and margins correctly.
   </p>
   {/if}
   </div>


</div>

<style>

   /* Plot (main container) */
   .plot {
      font-family: Arial, Helvetica, sans-serif;

      display: grid;
      grid-template-columns: min-content auto;
      grid-template-rows: min-content auto min-content;
      grid-template-areas:
         ". title"
         "ylab axes"
         ". xlab";

      box-sizing: border-box;
      /* background: #fefefe; */
      min-width: 100px;
      min-height: 50px;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
   }

   .plot_small {
      font-size: 11px;
   }

   .plot_medium {
      font-size: 13px;
   }

   .plot_large {
      font-size: 16px;
   }

   .plot_xlarge {
      font-size: 19px;
   }

   .plot_error {
      display: flex;
   }

   .plot_error > .axes-wrapper > svg {
      display: none;
   }

   .message_error {
      font-size: 1.2em;
      color: crimson;
      padding: 1em;
      box-sizing: border-box;
      text-align: center;
   }

   /* Axes (coordinate system) */
   .axes-wrapper {
      grid-area: axes;
      position:relative;
      box-sizing: border-box;
      display: flex;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
   }

   .axes {
      display: block;
      box-sizing: border-box;
      position:absolute;

      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
      max-height: 100%;
      max-width: 100%;
      min-height: 100%;
      min-width: 100%;
   }

   .axes-content {
      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
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
      padding: 0.5em 0;
      text-align: center;
   }

   /* Axis */
   :global(.axis-labels) {
      fill: #303030;
      font-size: 0.95em;
   }

   /* Data labels */
   :global(.labels) {
      fill: #606060;
      font-size: 0.90em;
   }

   :global(.labels) {
      visibility: hidden;
      transition:visibility 0.25s linear, opacity 0.25s linear;
      opacity: 0;
   }

</style>