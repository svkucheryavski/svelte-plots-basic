<script>
   /****************************************************
   * Axes for 3D plots                                 *
   * --------------------                              *
   * root item for any plot                            *
   *****************************************************/

	import { setContext, onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
   import { cbind, matrix, Matrix, Vector } from 'mdatools/arrays';
   import { getScale, roundCoords } from '../Utils.js';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let limX;        // limits for x-axis (in plot units) [min, max]
   export let limY;        // limits for y-axis (in plot units) [min, max]
   export let limZ;        // limits for z-axis (in plot units) [min, max]
   export let theta = -10;
   export let phi = -10;
   export let zoom = 0.5;


   /*****************************************/
   /* Constants                             */
   /*****************************************/

   // number of ticks along each axis
   const TICK_NUM = {
      "small": 5,
      "medium": 8,
      "large": 12,
      "xlarge": 15
   };

   // margin between plot series elements and data labels
   const LABELS_MARGIN = {
      "small": 5,
      "medium": 10,
      "large": 15,
      "xlarge": 20
   };

   // line styles for different scales and types
   const LINE_STYLES = {
      small:  ["0", "3,3", "1,1", "3,1"],
      medium: ["0", "5,5", "2,2", "5,2"],
      large:  ["0", "7,7", "3,3", "7,3"],
      xlarge:  ["0", "9,9", "5,5", "9,5"],
   }

   // translation matrix to move points to center of a unit cube
   const T1 = matrix([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0.5, 0.5, 0.5, 1
   ], 4, 4);

   // inverse translation matrix for T1
   const T2 = matrix([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -0.5, -0.5, -0.5, 1
   ], 4, 4);

   // constant to make clip path ID unique
   const clipPathID = "plottingArea" + Math.round(Math.random() * 10000);


   /*****************************************/
   /* Variable parameters for internal use  */
   /*****************************************/

   // bindings to plot DOM elements
   let plotElement;
   let axesElement;
   let width, height = 100;


   /*****************************************/
   /* Helper functions                      */
   /*****************************************/

   /**
    * Transforms world coordinates to 2D scene pixels by applying the transformation matrix 'tM'.
    *
    * @param {Matrix} coords - matrix with coordinates [X, Y, Z]
    * @param {Matrix} tM - transformation matrix
    *
    * @returns {Array} array with transformed coordinates as two vectors [x, y].
    *
    */
   const transform = function(coords, tM) {
//      const coords2D = cbind(coords, Vector.ones(coords.nrows)).dot(tM);
//      const coords2D = tcrossprod(tM, cbind(coords, Vector.ones(coords.nrows))).t();
      const coords2D = cbind(coords, Vector.ones(coords.nrows)).dot(tM);
      return [coords2D.getcolref(1).map(v => roundCoords(v)), coords2D.getcolref(2).map(v => roundCoords(v))];
   }


   /*****************************************/
   /* Storage to share with children        */
   /*****************************************/

   const tM = writable(Matrix.eye(4));    // transformation matrix
   const scale = writable('medium');      // plot scale (small/medium/large)
   const xLim = writable(limX);           // x-axis limits in 3D (before projection)
   const yLim = writable(limY);           // y-axis limits in 3D (before projection)
   const zLim = writable(limZ);           // z-axis limits in 3D (before projection)
   const isOk = writable(false);          // indicator that axes works fine


   /*****************************************/
   /* Axes context                          */
   /*****************************************/

   let context = {

      // methods
      transform: transform,

      // state proporties
      scale: scale,
      isOk: isOk,
      xLim: xLim,
      yLim: yLim,
      zLim: zLim,
      tM: tM,

      // constants
      LINE_STYLES: LINE_STYLES,
      LABELS_MARGIN: LABELS_MARGIN,
      TICK_NUM: TICK_NUM
   }

	setContext('axes', context);


   /*****************************************/
   /* Reactive updates of the parameters    */
   /*****************************************/

   // update limits if necessary
   $: xLim.update(v => limX);
   $: yLim.update(v => limY);
   $: zLim.update(v => limZ);

   // projection matrix (step 1)
   $: P2 = matrix([
         1, 0, 0, 0,
         0, Math.cos(theta), Math.sin(theta), 0,
         0, -Math.sin(theta),  Math.cos(theta), 0,
         0, 0, 0, 1,
   ], 4, 4);

   // projection matrix (step 2)
   $: P1 = matrix([
         Math.cos(phi), 0, -Math.sin(phi), 0,
         0, 1, 0, 0,
         Math.sin(phi), 0, Math.cos(phi), 0,
         0, 0, 0, 1
      ], 4, 4);

   // zoom matrix
   $: Z = matrix([
      zoom, 0, 0, 0,
      0, zoom, 0, 0,
      0, 0, zoom, 0,
      0, 0, 0, 1
   ], 4, 4);

   // matrix for projection and zooming
   // we shift [0, 1] cube to center, project, zoom, and then shift back
   $: P = T1.dot(Z.dot(P2.dot(P1.dot(T2))))

   // update transformation matrix if angles of the norm vectors are changed
   $: {
      if ($isOk) {
         // translate
         const TT1 = matrix([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -$xLim[0], -$yLim[0], -$zLim[0], 1
         ], 4, 4);

         // scale the whole cube to [0, 1] limits
         const SS1 = matrix([
            1 / ($xLim[1] - $xLim[0]) ,  0, 0, 0,
            0, 1 / ($yLim[1] - $yLim[0]), 0, 0,
            0, 0, 1 / ($zLim[1] - $zLim[0]), 0,
            0, 0, 0, 1
         ], 4, 4);

         // scale to screen coordinates
         const SS2 = matrix([
            width,  0, 0, 0,
            0, height, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
         ], 4, 4);

         tM.update(x => SS2.dot(P.dot(SS1.dot(TT1))).t());
      } else {
         tM.update(x => Matrix.eye(4));
      }
   }


   /*****************************************/
   /* Events observers                      */
   /*****************************************/

   // observer for the plot area size — to update scale
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
      ro2.observe(plotElement);
   });

   onDestroy(() => {
      ro1.unobserve(plotElement);
      ro2.unobserve(plotElement);
   })

   // check if everything is ok regarding the axis limits
   $: isOk.update(v =>
      !$yLim.some(v => v === undefined) &&
      !$xLim.some(v => v === undefined) &&
      !$zLim.some(v => v === undefined) &&
      !$yLim.some(v => isNaN(v)) &&
      !$xLim.some(v => isNaN(v)) &&
      !$zLim.some(v => isNaN(v))
   )
</script>


<div class="plot {'plot_' + $scale}"  bind:this={plotElement} class:plot_error={!$isOk}>

   <!-- axes (coordinate system) -->
   <div class="axes-wrapper" bind:this={axesElement} >
      <slot name="title"></slot>

      <svg vector-effect="non-scaling-stroke" preserveAspectRatio="none" class="axes">

         <!-- axis and box -->
         <slot name="xaxis"></slot>
         <slot name="yaxis"></slot>
         <slot name="zaxis"></slot>

         <!-- main plot content -->
         <g class="axes-content" >
            <slot></slot>
         </g>

         <!-- axis and box -->
         <slot name="box"></slot>
      </svg>

      {#if !$isOk}
      <p class="message_error">
         Axes component was not properly initialized. <br />
         Add plot series (check that coordinates are numeric) or define axes limits manually.
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
      min-width: 100px;
      min-height: 50px;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      background-color: white;
   }

   :global(.plot_small) {
      font-size: 11px;
   }

   :global(.plot_medium) {
      font-size: 13px;
   }

   :global(.plot_large) {
      font-size: 16px;
   }

   :global(.plot_error) {
      display: flex;
   }

   :global(.plot_error > .axes-wrapper) {
      display: none;
   }

   .message_error {
      font-size: 1.2em;
      color: crimson;
      padding: 20px;
      text-align: center;
      width: 100%;
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
      user-select: none;
      cursor: default;
      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
      max-height: 100%;
      max-width: 100%;
      min-height: 100%;
      min-width: 100%;
   }

   .axes :global(text) {
       -webkit-user-select: none;
      user-select: none;
      cursor: default;
   }

   :global(.axes-content) {
      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
      max-height: 100%;
      max-width: 100%;
      min-height: 100%;
      min-width: 100%;

   }

   :global(.axes__xlabel) {
      grid-area: xlab;
      font-size: 1.0em;
      font-weight: 600;
      padding: 0.25em;
      text-align: center;
   }


   :global(.axes__ylabel) {
      grid-area: ylab;
      font-size: 1.0em;
      font-weight: 600;
      padding: 0.25em;
      text-align: center;
      vertical-align: middle;
      display: flex;
   }

   :global(.axes__ylabel > span) {
      width: 1.5em;
      line-height: 1.5em;
      display: inline-block;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
   }


   :global(.axes__title) {
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