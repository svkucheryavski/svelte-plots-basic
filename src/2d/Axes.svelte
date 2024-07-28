<script>
   /****************************************************
   * Axes                                              *
   * --------------------                              *
   * root item for any plot                            *
   *****************************************************/

	import { setContext, createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
   import { isvector, vector, Vector } from 'mdatools/arrays';
   import { roundCoords, getScale, downloadSVG, downloadPNG } from '../Utils.js';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let limX;                                   // array with limits for x-axis (in plot units) [min, max]
   export let limY;                                   // array with limits for y-axis (in plot units) [min, max]
   export let title = '';                             // title of the plot
   export let xLabel = '';                            // label for x-axis
   export let yLabel = '';                            // label for y-axis
   export let margins = [1.0, 0.75, 0.5, 0.5];        // margins [bottom, left, top, right] )


   /*****************************************/
   /* Input parameters for downloading      */
   /*****************************************/
   export let downloadLinks = 'hover';                // how to show download links panel ('none', 'hover', 'fixed')
   export let fileName = 'plot';                      // file name for download (without extension)
   export let pngWidth = 8;                           // width of PNG image in cm
   export let pngHeight = 8;                          // height of PNG image in cm
   export let pngRes = 300;                           // resolution of PNG image (pixels per inch)


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

   // font size for plot element
   const LEGEND_FONT_SIZE = {
      "small": 10,
      "medium": 12,
      "large": 14,
      "xlarge": 16
   };

   // font size for legend items in pixels
   const PLOT_FONT_SIZE = {
      "small": 11,
      "medium": 13,
      "large": 16,
      "xlarge": 19
   };

   // margin between plot series elements and data labels
   const LABELS_MARGIN = {
      'small': 10,
      'medium': 13,
      'large': 15,
      'xlarge': 17
   };

   // line styles for different scales and types
   const LINE_STYLES = {
      small: ['0', '3,3', '1,1', '3,1'],
      medium: ['0', '5,5', '2,2', '5,2'],
      large: ['0', '7,7', '3,3', '7,3'],
      xlarge: ['0', '9,9', '4,4', '9,3'],
   }

   // marker symbols
   const MARKER_SYMBOLS = ["●", "◼", "▲", "▼", "⬥", "＋", "✳", "✕"];

   // constant to make clip path ID unique
   const clipPathID = 'plottingArea' + Math.round(Math.random() * 10000);


   /*****************************************/
   /* Variable parameters for internal use  */
   /*****************************************/

   /* parameters for internal use inside the component */
   let plotElement;
   let width = 100, height = 100;
   let left = 0, bottom = 0, top = 0;


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

   function handleClickSVG() {
      downloadSVG(plotElement, fileName)
   }

   function handleClickPNG() {
      downloadPNG(plotElement, fileName, pngWidth, pngHeight, pngRes)
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
      xLabel: xLabel,
      yLabel: yLabel,

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
   const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
         const pcr = plotElement.getBoundingClientRect();
         const scl = getScale(pcr.width, pcr.height);
         scale.update(x => scl);

         const m = PLOT_FONT_SIZE[scl] * 1.5;
         left = xLabel && xLabel !== '' ? m : 0;
         bottom = yLabel && yLabel !== '' ? m : 0;
         top = title && title !== '' ? m : 0;
         width = pcr.width > left ? pcr.width - left : 0;
         height = pcr.height > (bottom + top) ? pcr.height - bottom - top : 0;
      }
   });

   $: fontSize = PLOT_FONT_SIZE[$scale];

   onMount(() => {
      ro.observe(plotElement);
   });

   onDestroy(() => {
      ro.unobserve(plotElement);
   })

</script>

<div class="plot-container show-download-links-{downloadLinks}" class:plot_error={!$isOk}>

   <svg class="plot" bind:this={plotElement} xmlns="http://www.w3.org/2000/svg"
      style={`font-size:${fontSize}px`}>

      <style>
         .plot {
            font-family: Arial, Helvetica, sans-serif;
         }

         .plot-labels text {
            font-weight:bold;
            text-anchor:middle;
         }

         .tick_labels text,
         .tick_labels tspan,
         .series_points text,
         .series_points tspan {
            dominant-baseline: middle;
            cursor: default;
            user-select: none;
         }

         .tick_labels text,
         .tick_labels tspan {
            font-size:1em;
         }
      </style>

      <g class="plot-labels">
         <!-- y-axis label -->
         {#if yLabel && yLabel !== ''}
         <text x={0} y={(height + top) /2} dx={0} dy={0} dominant-baseline="top" transform={`rotate(-90, 10, ${height/2})`} style="font-size:1.1em;">{@html yLabel}</text>
         {/if}
         <!-- x-axis label -->
         {#if xLabel && xLabel !== ''}
         <text x={left + width/2 } y={height + top} dx={0} dy={5} dominant-baseline="middle" style="font-size:1.1em;">{@html xLabel}</text>
         {/if}
         <!-- plot title -->
         {#if title && title !== ''}
         <text x={left + width/2 } y={0} dx={0} dy={10}  dominant-baseline="hanging" style="font-size:1.2em;">{@html title}</text>
         {/if}
      </g>

      <svg x={left} y={top} width={width} height={height} on:click={handleClick}
         on:keydown={handleClick} preserveAspectRatio="none" class="axes">

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
   </svg>

   {#if !$isOk}
   <p class="message_error">
      Axes component was not properly initialized. <br />
      Check that you defined axes limits and margins correctly.
   </p>
   {:else}
   <div class="download-links">
      <button on:click={handleClickSVG} on:keydown={handleClickSVG}>⇩ svg</button>
      <button on:click={handleClickPNG} on:keydown={handleClickPNG}>⇩ png</button>
   </div>
   {/if}

</div>

<style>
   .show-download-links-none > .download-links{
      display: none;
   }

   .show-download-links-hover:hover > .download-links {
      bottom: 0;
   }

   .show-download-links-fixed > .download-links{
      bottom: 0;
   }

   .download-links {
      bottom: right 0.5s ease;
      position: absolute;
      font-size: 0.8em;
      bottom: -50%;
      right: 0;
      z-index: 10;
      padding: 0.5em 1em 0.5em 1em;
      background: #fefefe;
      border-top-left-radius: 0.5em;
      transition: bottom 0.35s ease;
      box-shadow: 0 0 1em #00000040;

      display: flex;
      align-items: center;
      justify-content: center;
   }

   .download-links > button{
      color: #606060;
      border: none;
      box-shadow: none;
      background: #fafafa;
      border-radius: 0.35em;
      padding: 0.25em 0.5em;
   }

   .download-links > button:hover{
      background: #443333;
      color: #fafafa;
   }

   /* Plot container */
   .plot-container {
      font-family: Arial, Helvetica, sans-serif;
      box-sizing: border-box;
      position: relative;
      min-width: 100px;
      min-height: 50px;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      overflow: hidden;
      background: #fff;
   }

   .plot_error {
      display: flex;
      justify-content: center;
      align-items: center;
   }

   .message_error {
      font-size: 1.2em;
      color: crimson;
      padding: 1em;
      box-sizing: border-box;
      text-align: center;
   }

   /* Plot and axes (coordinate system) */

   .plot {
      display: block;
      box-sizing: border-box;
      position:absolute;
      padding: 0;
      margin: 0;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
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

</style>