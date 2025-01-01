<!--
@component Parent component for any plot, all other components should be nested inside `<Axes></Axes>`.

   Main properties:
   - `limX` - array with limits for x-axis (in plot units), default: `[0, 1]`.
   - `limY` - array with limits for y-axis (in plot units), default: `[0, 1]`.
   - `title` - title of the plot (string).
   - `margins` - array with relative margins (bottom, left, top, right), default `[1.0, 0.85, 0.5, 0.5]`.

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
      import {Axes} from 'svelte-plots-basic/2d';
   </script>

   <Axes limX={[2000, 2050]} limY={[0, 100]} title="GDP of contries">
      //all other plotting components are here
   </Axes>
   ```
-->
<script>
   import { setContext } from 'svelte';
   import { Colors, PLOT_FONT_SIZE, AXES_MARGIN_FACTORS, TICK_SIZE, LINE_STYLES, MARKER_SYMBOLS } from '../constants.js';
   import { downloadSVG, downloadPNG, copyToClipboard, checkArray, getScale, getAxisScale, getXAxisParams, getYAxisParams,
            transformCoords, getColormapLegendParams, getColormapLegendCoords, getTickFactorLabel,
            getGroupLegendCoords, text2svg} from '../methods.js';

   import AxisLines from './AxisLines.svelte';
   import AxisTickLabels from './AxisTickLabels.svelte';


   /** @type {Props} */
   let {
      title,
      limX = [0, 1],
      limY = [0, 1],
      margins = [1.0, 1.1, 0.55, 0.60],
      downloadLinks = 'none',
      fileName = 'plot',
      pngWidth = 8,
      pngHeight = 8,
      pngRes = 300,
      clipboardWidth = 1200,
      clipboardHeight = 800,
      onclick,
      children
   } = $props();


   /* handles click events */
   function handleClick(e) {
      if (onclick) {
         onclick(e);
      }
   }

   /* Copy plot to clipboard as PNG image. */
   async function handleClickCopy(e) {
      copyToClipboard(e.target, plotElement, clipboardWidth, clipboardHeight);
   }

   /* Download plot as SVG image. */
   function handleClickSVG() {
      downloadSVG(plotElement, fileName);
   }

   /* Download plot as PNG image. */
   function handleClickPNG() {
      downloadPNG(plotElement, fileName, pngWidth, pngHeight, pngRes);
   }


   // unique ID for clip path
   const clipPathID = 'plottingArea' + Math.round(Math.random() * 10000);

   // pointers to plot DOM element and its width and height
   let plotElement = $state(0);
   let plotWidth = $state(0);
   let plotHeight = $state(0);

   // scales and related parameters
   const scales = $derived({'plot': getScale(plotWidth, plotHeight), 'x': getAxisScale(plotWidth), 'y': getAxisScale(plotHeight)});
   const pxMargins = $derived(margins.map(v => v * AXES_MARGIN_FACTORS[scales.plot]));
   const fontSize = $derived(PLOT_FONT_SIZE[scales.plot]);
   const tickSize = $derived(TICK_SIZE[scales.plot]);
   const lineStyles = $derived(LINE_STYLES[scales.plot]);

   // left and bottom margins as well as width and height of the axes area (including margins)
   const left = $derived(xaxis && xaxis.label !== '' ? fontSize * 1.5 : 0);
   const bottom = $derived(yaxis && yaxis.label !== '' ? fontSize * 1.5 : 0);
   const top = $derived(title && title !== '' ? fontSize * 1.5 : 0);
   const width = $derived(plotWidth > left ? plotWidth - left : 0);
   const height = $derived(plotHeight > (bottom + top) ? plotHeight - bottom - top : 0);

   // size of only axes area
   const axisHeight = $derived(height - pxMargins[0] - pxMargins[2]);
   const axisWidth = $derived(width - pxMargins[1] - pxMargins[3]);

   // plot status
   const isOk = $derived(
      checkArray(limX, 2) &&
      checkArray(limY, 2) &&
      limX[0] < limX[1] &&
      limY[0] < limY[1] &&
      width > (pxMargins[1] + pxMargins[3]) &&
      height > (pxMargins[0] + pxMargins[2])
   );

   // transformation matrix for x
   const tX = $derived(!isOk ? {'coords': [1, 0, 0], 'objects': [1, 0, 0]} :
      {
         'coords':  [ axisWidth / (limX[1] - limX[0]), limX[0], pxMargins[1]],
         'objects': [ axisWidth / (limX[1] - limX[0]),       0,            0]
      }
   );

   // transformation matrix for y
   const tY = $derived(!isOk ? {'coords': [0, 1, 0], 'objects': [0, 1, 0]} :
      {
         'coords':  [-axisHeight / (limY[1] - limY[0]), limY[1], pxMargins[2]],
         'objects': [ axisHeight / (limY[1] - limY[0]),       0,            0]
      }
   );

   // coordinates if the middle point of plotting area (needed for axis labels location)
   const my = $derived(axisHeight * 0.5 + top + pxMargins[2]);
   const mx = $derived(axisWidth * 0.5 + left + pxMargins[1]);

   // coordinates for clip path box
   const cpx = $derived(isOk ? transformCoords(limX, tX) : [0, 1]);
   const cpy = $derived(isOk ? transformCoords(limY, tY) : [1, 0]);

   // parameters of plot title
   const plotTitle = $derived(text2svg(title));
   const titleHeight = $derived(plotTitle ? (plotTitle.length === title.left ? 1.0 : 1.4) : 0);

   // parameters of box, axis elements, colomap legend and group legend
   let box = $state({show: false, lineColor: Colors.DARKGRAY, lineWidth: 1});
   let xaxis = $state({show: false, label: "", showGrid: false, las: 1, whole: false, ticks: null, tickLabels: null});
   let yaxis = $state({show: false, label: "", showGrid: false, las: 1, whole: false, ticks: null, tickLabels: null});
   let clg = $state({show: false, colmap: null, breaks: null});
   let glg = $state({show: false, items: null, position: null});

   // get colormap legend parameters
   const clgParams = $derived(isOk && clg && clg.show ? getColormapLegendParams(clg) : null);

   // compute world coordinates of axis elements
   const xaxisCoords = $derived(isOk && xaxis.show ? getXAxisParams(limX, limY, scales, tY, xaxis): null);
   const yaxisCoords = $derived(isOk && yaxis.show ? getYAxisParams(limX, limY, scales, tX, yaxis): null);

   // compute screen coordinates of legend elements
   const clgCoords = $derived(isOk && clgParams ? getColormapLegendCoords(clgParams, axisWidth, pxMargins, scales) : null);
   const glgCoords = $derived(isOk && glg && glg.show && cpx? getGroupLegendCoords(glg, cpx, cpy, fontSize, tickSize) : null);

   // axes context to share with children
   setContext('axes', {
      setBox: (v) => box = v,
      setXAxis: (v) => xaxis = v,
      setYAxis: (v) => yaxis = v,
      setColmapLegend: (v) => clg = v,
      setGroupLegend: (v) => glg = v,
      scales: () => scales,
      tX: () => tX,
      tY: () => tY
   });
</script>

<!-- snippet for axis -->
{#snippet axisSnippet(axisCoords, axisParams)}
   {#if axisParams.showGrid }
      <AxisLines lineCoords={axisCoords.grid} lineColor={Colors.MIDDLEGRAY} lineType={3} />
   {/if}

   <AxisLines lineCoords={axisCoords.axisLine} lineColor={Colors.DARKGRAY} lineType={1} />
   <AxisLines lineCoords={axisCoords.tickCoords} lineColor={Colors.DARKGRAY} lineType={1} />

   {#if axisCoords.tickCoords.length === 2 && axisCoords.tickLabels.length === axisCoords.tickCoords[1][0].length}
   <AxisTickLabels las={axisParams.las} pos={axisParams.pos} tickCoords={axisCoords.tickCoords}
      tickLabels={axisCoords.tickLabels} tickColor={Colors.DARKGRAY} hideLast={axisParams.hideLast}/>
   {/if}

   <!-- tick factor -->
   {#if axisCoords.tickFactor !== 0}
   <AxisTickLabels pos={axisParams.pos} tickCoords={axisCoords.tfCoords} tickLabels={[axisCoords.tfLabel]} textColor={Colors.DARKGRAY} />
   {/if}
{/snippet}

<!-- snippedt for colormap legend -->
{#snippet clgSnippet(params, coords)}

   {@const dy = coords.height * 1.25}
   {@const n = params.colmap.length}

   {#each params.colmap as col, i}
      {@const x = coords.start + i * coords.width}
      <rect {x} y={coords.top} width={coords.width} height={coords.height} fill={col} />
      <text {x} y={coords.ltop} dx={coords.dxl} dy={0} dominant-baseline="hanging"
         fill={params.labelColor}
         font-size={params.fontSize + "em"}
         text-anchor="middle"
      >{@html params.labels[i]}</text>
   {/each}

   {#if !params.isCentered}
      {@const x = coords.start + n * coords.width }
      <text {x} y={coords.ltop} dx={0} dy={0} dominant-baseline="hanging"
         fill={params.labelColor}
         font-size="{params.fontSize}em"
         text-anchor="middle"
      >{@html params.labels[n]}</text>
   {/if}


   {#if params.labelsFactor !== 0}
      {@const x = coords.start + (n + 0.85) * coords.width  }
      <text {x} y={coords.ltop} dx={0} dy={0} dominant-baseline="hanging"
         fill={params.labelColor}
         font-size="{params.fontSize}em"
         text-anchor="middle"
      >{@html getTickFactorLabel(params.labelsFactor)}</text>
   {/if}
{/snippet}

<!-- snipped for group legend -->
{#snippet glgSnippet(params, coords)}
   {@const elw = coords.elw + 2 * coords.elp}
   {@const elp = coords.elp}
   {@const elh = coords.elh}
   {@const ely = coords.ely}

   <svg x={coords.lgl} y={coords.lgt} height={coords.lgh} width={coords.lgw}>
      <rect height="100%" width="100%" fill={params.faceColor} stroke={params.lineColor} stroke-width={params.lineWidth} />

      {#each params.items as item, i}
      <svg x={0} y={ely[i]} width={coords.lgw} height={elh[i]}>

         <!-- line -->
         {#if item.lineType}
         <line
            x1={elp}
            x2={elw - elp}
            y1={elh[i]/2}
            y2={elh[i]/2}
            stroke={item.lineColor}
            stroke-width={item.lineWidth}
            stroke-dasharray={lineStyles[item.lineType - 1]}
         />
         {/if}

         <!-- marker -->
         {#if item.marker}
         <text
            x={elw/2}
            y={elh[i]/2}
            dominant-baseline="middle"
            text-anchor="middle"
            fill={item.faceColor}
            stroke-width={item.borderWidth}
            stroke={item.borderColor}
            font-size={fontSize}
         >{MARKER_SYMBOLS[item.marker - 1]}</text>
         {/if}

         <!-- text -->
         <text
            class="legend-text"
            xml:space="preserve"
            x={elw + elp}
            y={elh[i]/2}
            dominant-baseline="middle"
            text-anchor="start"
            fill={Colors.LEGEND}
            font-size="{params.fontSize}em"
         > {@html item.label}</text>

      </svg>
      {/each}
   </svg>
{/snippet}


<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="plot-container show-download-links-{downloadLinks}" onkeydown={handleClick} onclick={handleClick} class:plot_error={!isOk}>

   <svg class="plot" bind:this={plotElement} bind:clientWidth={plotWidth} bind:clientHeight={plotHeight}
      xmlns="http://www.w3.org/2000/svg" style="font-size:{fontSize}px">
      <style>
         .plot {
            font-family: Arial, Helvetica, sans-serif;
         }

         .plot-labels text {
            font-weight:bold;
            text-anchor:middle;
            user-select: none;
         }

         .tick-labels text,
         .tick-labels tspan,
         .series-text text,
         .series-text tspan,
         .series-points text,
         .series-points tspan {
            dominant-baseline: middle;
            cursor: default;
            user-select: none;
            -webkit-user-select: none;
         }

         .series-text text,
         .series-text tspan {
            text-anchor: middle;
            user-select: none;
            -webkit-user-select: none;
         }

         .tick-labels text,
         .tick-labels tspan {
            font-size:1em;
            user-select: none;
            -webkit-user-select: none;
         }
      </style>

      {#if isOk}
      <g class="plot-labels">
         <!-- x-axis label -->
         {#if xaxis.show && xaxis.label && xaxis.label !== ''}
         <text x={mx} y={height + top} dx={0} dy={0} dominant-baseline="middle"
            style="font-size:1.1em;">{@html xaxis.label}</text>
         {/if}

         <!-- y-axis label -->
         {#if yaxis.show && yaxis.label && yaxis.label !== ''}
         <text x={fontSize / 1.1 * yaxis.labelHeight} y={my} dx={0} dy={0} dominant-baseline="middle" transform={`rotate(-90, ${fontSize * yaxis.labelHeight / 1.1}, ${my})`} style="font-size:1.1em;">{@html yaxis.label}</text>
         {/if}

         <!-- plot title -->
         {#if plotTitle && plotTitle !== ''}
         <text x={mx} y={fontSize * titleHeight} dx={0} dy={0}  dominant-baseline="middle"
            style="font-size:1.2em;">{@html plotTitle}</text>
         {/if}
      </g>
      {/if}

      <svg x={left} y={top} width={width} height={height} preserveAspectRatio="none" class="axes">

         <!-- define clipping path -->
         <defs>
            <clipPath id={clipPathID}>
               <rect style="pointer-events:none" x={cpx[0]} y={cpy[1]} width={cpx[1]-cpx[0]} height={cpy[0]-cpy[1]} />
            </clipPath>
         </defs>

         {#if isOk}

            <!-- xaxis -->
            {#if xaxis.show && xaxisCoords}
            <g class="mdaplot__axis mdaplot__xaxis">
               {@render axisSnippet(xaxisCoords, xaxis)}
            </g>
            {/if}

            <!-- yaxis -->
            {#if yaxis.show && yaxisCoords}
            <g class="mdaplot__axis mdaplot__yaxis">
               {@render axisSnippet(yaxisCoords, yaxis)}
            </g>
            {/if}

            <!-- main plot content -->
            <g class="axes-content" clip-path="url(#{clipPathID})">
               {@render children?.()}
            </g>

            <!-- colormap legend -->
            {#if clgParams && clgCoords && clg.show}
            <g class="mdaplot__colormap_legend" style="stroke:0;stroke-width:0px;">
               {@render clgSnippet(clgParams, clgCoords)}
            </g>
            {/if}

            <!-- group legend -->
            {#if glg && glgCoords && glg.show}
            <g class="mdaplot__group_legend" style="stroke:0;stroke-width:0px;">
               {@render glgSnippet(glg, glgCoords)}
            </g>
            {/if}

            <!-- box -->
            {#if box.show}
            <g style="pointer-events:none" class="mdaplot__axes-box">
            <rect stroke={box.lineColor} stroke-width="{box.lineWidth}px" fill="transparent"
               x={cpx[0]} y={cpy[1]} width={cpx[1] - cpx[0]} height={cpy[0] - cpy[1]} />
            </g>
            {/if}

         {/if}

      </svg>
   </svg>

   {#if !isOk}
   <p class="message_error">
      Axes component was not properly initialized. <br />
      Check that you defined axes limits and margins correctly.
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