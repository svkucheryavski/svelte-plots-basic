<!--
@component Parent component for any plot, all other components should be nested inside `<Axes></Axes>`.

   Main properties:
   - `limX` - array with limits for x-axis (in plot units), default: `[0, 1]`.
   - `limY` - array with limits for y-axis (in plot units), default: `[0, 1]`.
   - `limZ` - array with limits for y-axis (in plot units), default: `[0, 1]`.
   - `theta` - angle (in degrees) for orientation of projection plane, default: `-10`.
   - `phi` - angle (in degrees) for orientation of projection plane, default: `-10`.
   - `zoom` - zooming factor, default: `0.5`.

   Properties for downloading the plot as PNG or SVG file or copying it to clipboard:
   - `downloadLinks` - how to show download links panel (`'none'` - default, `'hover'`, `'fixed'`).
   - `fileName` - file name for download (without extension), default: `'plot'`.
   - `pngWidth` - width of PNG image in cm, default `8`
   - `pngHeight` - height of PNG image in cm, default `8`.
   - `pngRes` - resolution of PNG image (pixels per inch), default `300`.
   - `clipboardWidth` - width of plot image to copy to clipboard in pixels.
   - `clipboardHeight` - height of plot image to copy to clipboard in pixels.

   Example:
   ```jsx
   <script>
      import {Axes} from 'svelte-plots-basic/3d';
   </script>

   <Axes limX={[-10, 10]} limY={[-10, 10]} limZ={[-10, 10]}>
      //all other plotting components are here
   </Axes>
   ```
-->
<script>
   import { matrix, Matrix } from 'mdatools/arrays';
   import { setContext } from 'svelte';
   import { PLOT_FONT_SIZE } from '../constants.js';
   import { checkArray, getScale, getXAxisCoords3D, getYAxisCoords3D, getZAxisCoords3D,
            downloadPNG, downloadSVG, copyToClipboard} from '../methods.js';

   import AxisLines from './AxisLines.svelte';
   import AxisTickLabels from './AxisTickLabels.svelte';
   import TextLabels from './TextLabels.svelte';

   /** @type {Props} */
   let {
      limX = [0, 1],
      limY = [0, 1],
      limZ = [0, 1],
      theta = -10,
      phi = -10,
      zoom = 0.5,
      downloadLinks = 'hover',
      fileName = 'plot',
      pngWidth = 8,
      pngHeight = 8,
      pngRes = 300,
      clipboardWidth = 1200,
      clipboardHeight = 800,
      children
   } = $props();



   /* Copy plot to clipboard as PNG image. */
   async function handleClickCopy(e) {
      copyToClipboard(e.target, plotElement, clipboardWidth, clipboardHeight);
   }

   /* Download plot as SVG image when user clicks on corresponding button. */
   function handleClickSVG() {
      downloadSVG(plotElement, fileName);
   }

   /* Download plot as PNG image when user clicks on corresponding button. */
   function handleClickPNG() {
      downloadPNG(plotElement, fileName, pngWidth, pngHeight, pngRes);
   }


   // translation matrix to move points to center of a unit cube
   const T1 = matrix([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.5, 0.5, 0.5, 1.0
   ], 4, 4);

   // inverse translation matrix for T1
   const T2 = matrix([
       1.0,  0.0,  0.0, 0.0,
       0.0,  1.0,  0.0, 0.0,
       0.0,  0.0,  1.0, 0.0,
      -0.5, -0.5, -0.5, 1.0
   ], 4, 4);



   // pointers to plot DOM element and its width and height
   let plotElement = $state(0);
   let width = $state(100);
   let height = $state(100);

   // scale factor and dependent font size
   const scale = $derived(getScale(width, height));
   const fontSize = $derived(PLOT_FONT_SIZE[scale]);

   // check main plot parameters and set status
   const isOk = $derived(
      checkArray(limX, 2) &&
      checkArray(limY, 2) &&
      checkArray(limZ, 2) &&
      limX[0] < limX[1] &&
      limY[0] < limY[1] &&
      limZ[0] < limZ[1] &&
      width > 50 &&
      height > 50
   );

   // projection matrix (step 1)
   const P2 = $derived(matrix([
         1, 0, 0, 0,
         0, Math.cos(theta), Math.sin(theta), 0,
         0, -Math.sin(theta),  Math.cos(theta), 0,
         0, 0, 0, 1,
   ], 4, 4));

   // projection matrix (step 2)
   const P1 = $derived(matrix([
         Math.cos(phi), 0, -Math.sin(phi), 0,
         0, 1, 0, 0,
         Math.sin(phi), 0, Math.cos(phi), 0,
         0, 0, 0, 1
      ], 4, 4));

   // zoom matrix
   const Z = $derived(matrix([
      zoom, 0, 0, 0,
      0, zoom, 0, 0,
      0, 0, zoom, 0,
      0, 0, 0, 1
   ], 4, 4));

   // matrix for projection and zooming inside unit cube
   // we shift [0, 1] cube to center, project, zoom, and then shift back
   const P = $derived(T1.dot(Z.dot(P2.dot(P1.dot(T2)))));

   // translation in world coordinates to origin (0, 0, 0)
   const TT1 = $derived(isOk ? matrix([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -limX[0], -limY[0], -limZ[0], 1
   ], 4, 4) : null);

   // scale world coordinates to unit cube
   const SS1 = $derived(isOk ? matrix([
      1 / (limX[1] - limX[0]) ,  0, 0, 0,
      0, 1 / (limY[1] - limY[0]), 0, 0,
      0, 0, 1 / (limZ[1] - limZ[0]), 0,
      0, 0, 0, 1
   ], 4, 4) : null);

   // scale unit cube to screen coordinates
   const SS2 = $derived(isOk ? matrix([
      width,  0, 0, 0,
      0, height, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
   ], 4, 4) : null);

   // main transformation matrix
   const tM = $derived(SS2 && P && SS1 && TT1 ?
      SS2.dot(P.dot(SS1.dot(TT1))).t() :
      Matrix.eye(4)
   );

   // containers for axis properties
   let xaxis = $state({show: false, label: ""});
   let yaxis = $state({show: false, label: ""});
   let zaxis = $state({show: false, label: ""});

   // axes context to share with children
   setContext('axes', {
      scale: () => scale,
      tM: () => tM,
      setXAxis: (v) => xaxis = v,
      setYAxis: (v) => yaxis = v,
      setZAxis: (v) => zaxis = v,
   });

   // compute screen coordinates for the axis
   const xaxisCoords = $derived(xaxis && xaxis.show ? getXAxisCoords3D(xaxis, limX, limY, limZ, scale) : null);
   const yaxisCoords = $derived(yaxis && yaxis.show ? getYAxisCoords3D(yaxis, limX, limY, limZ, scale) : null);
   const zaxisCoords = $derived(zaxis && zaxis.show ? getZAxisCoords3D(zaxis, limX, limY, limZ, scale) : null);
</script>

<!-- snipped for axis -->
{#snippet axis(axis, coords)}

   <g class="axis" >

   <!-- grid -->
   {#if axis.showGrid }
      <AxisLines lineCoords={coords.grid1} lineColor={axis.gridColor} lineType={3} />
      <AxisLines lineCoords={coords.grid2} lineColor={axis.gridColor} lineType={3} />
   {/if}

   <!-- main axis line -->
   <AxisLines lineCoords={coords.axisLine} lineColor={axis.lineColor} lineType={1} />

   <!-- ticks-->
   <AxisLines lineCoords={[coords.tickCoords[0], coords.tickCoords[1]]} lineColor={axis.lineColor} lineType={1} />
   <AxisLines lineCoords={[coords.tickCoords[0], coords.tickCoords[2]]} lineColor={axis.lineColor} lineType={1} />

   <!-- labels -->
   {#if coords.tickCoords }
   <AxisTickLabels tickCoords={coords.tickCoords[4]} textColor={axis.textColor} tickLabels={coords.tickLabels}  />
   {/if}

   <!-- title -->
   {#if coords.titleCoords && axis.label !== ''}
   <TextLabels
      xValues={coords.titleCoords[0]} yValues={coords.titleCoords[1]} zValues={coords.titleCoords[2]}
      faceColor={axis.textColor}
      labels={axis.label}
      textSize={1.0}
      fontWeight="bold"
   />
   {/if}
   </g>
{/snippet}

<div class="plot-container show-download-links-{downloadLinks}" class:plot_error={!isOk}>
   <svg class="plot" bind:this={plotElement} bind:clientWidth={width} bind:clientHeight={height}
      xmlns="http://www.w3.org/2000/svg" style="font-size:{fontSize}px">
      <style>
         .plot {
            font-family: Arial, Helvetica, sans-serif;
         }

         polyline, line {
            vector-effect: "non-scaling-stroke";
         }

         .plot-labels text {
            font-weight:bold;
            text-anchor:middle;
         }

         .tick-labels text,
         .tick-labels tspan,
         .series-text text,
         .series-text tspan,
         .series-points text,
         .series-points tspan {
            dominant-baseline: middle;
            cursor: default;
         }

         .series-text text,
         .series-text tspan {
            text-anchor: middle;
         }

         .tick-labels text,
         .tick-labels tspan {
            font-size:1em;
         }

         text, tspan {
            user-select: none;
            -webkit-user-select: none;
         }
      </style>

      <!-- axis -->
      {#if xaxis && xaxis.show} {@render axis(xaxis, xaxisCoords)} {/if}
      {#if yaxis && yaxis.show} {@render axis(yaxis, yaxisCoords)} {/if}
      {#if zaxis && zaxis.show} {@render axis(zaxis, zaxisCoords)} {/if}

      <!-- main plot content -->
      <g class="axes-content" >
         {@render children?.()}
      </g>
   </svg>

   {#if !isOk}
   <p class="message_error">
      Axes component was not properly initialized. <br />
      Add plot series (check that coordinates are numeric) or define axes limits manually.
   </p>
   {:else}
   <div class="download-links">
      <button onclick={handleClickSVG} onkeydown={handleClickSVG}>⇩ svg</button>
      <button onclick={handleClickPNG} onkeydown={handleClickPNG}>⇩ png</button>
      <button onclick={handleClickCopy} onkeydown={handleClickCopy}>⧉ copy</button>
   </div>
   {/if}
</div>

<style>

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
   }

   .plot_error > .plot {
      display: none;
   }

   .message_error {
      font-size: 1.2em;
      color: crimson;
      padding: 20px;
      text-align: center;
      width: 100%;
   }

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
      box-sizing: border-box;
      position: absolute;
      font-size: 0.8em;
      bottom: -50%;
      right: 0;
      z-index: 10;
      padding: 0.5em 1em 0.5em 1em;
      background: #fefefe;
      border-radius: 0.5em;
      transition: bottom 0.35s ease;
      box-shadow: 0 0 0.75em #00000060;
      margin: 0.6em;
      box-sizing: border-box;

      display: flex;
      align-items: center;
      justify-content: center;
   }

   .download-links > button{
      box-sizing: border-box;
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

   .download-links > :global(button.error){
      background: #ee4433;
   }

   .download-links > :global(button.copied){
      background: #4488ee;
   }

</style>