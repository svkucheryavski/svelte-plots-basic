<script>
   /****************************************************
   * Legend                                            *
   * --------------------                              *
   * shows legend for plot components                  *
   *****************************************************/

   import { mean } from 'mdatools/stat';
   import { getContext } from 'svelte';
   import { Colors } from '../Colors';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let items;                 // array with text labels for each legend element
	export let position = "topleft";  // position of the legend ("topleft", "top", "topright", "right", "bottomright", etc).


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   const axes = getContext('axes');
   const scale = axes.scale;
   const xLim = axes.xLim;
   const yLim = axes.yLim;
   const tX = axes.tX;
   const tY = axes.tY;
   const isOk = axes.isOk;


   /**
    * Computes width of text element for given font.
    *
    * @param {string} text - string with text
    * @param {string} font - font name and size, e.g. '12px Arial'
    *
    * @return {number} size of element in pixels
    */
   function getTextWidth(text, font) {
      const element = document.createElement('canvas');
      const context = element.getContext('2d');
      context.font = font;
      return context.measureText(text).width;
   }

   /**
    * Compute size of main legend elements.
    *
    * @param {Array} items - array of legend items and their properties.
    * @param {number} fontSize - font size of a legend element.
    * @param {string} position - position of the legend.
    *
    * @return {Array} array with height and width og graphical part of legend item, padding size,
    * height and width of text labels (all in pixels).
    */
   function getLegendSize(items, fontSize, position)  {

      // compute size of graphical elements
      const elHeight = fontSize;       // height of legend element without padding
      const elPadding = elHeight / 4;  // top and bottom padding
      const elWidth = elHeight * 1.5;  // width of legend element without padding

      // compute size of text label elements
      // TODO: implement one row legend if position is "top" or "bottom"
      const lbHeight = elHeight;
      let lbWidth = 0;
      for (let i = 0; i < items.length; i++) {
         const w = getTextWidth('  ' + items[i].label + '  ', fontSize + 'px Arial');
         lbWidth = w > lbWidth ? w : lbWidth;
      }

      return [elHeight, elWidth, elPadding, lbHeight, lbWidth];
   }

   // reactive expression to compute all sizes and coordinates
   let left, top, elHeight, elWidth, elPadding, lbHeight, lbWidth, legendHeight, legendWidth, fontSize;
   $: if ($isOk) {

      fontSize = axes.LEGEND_FONT_SIZE[$scale];

      // compute size of elements
      [elHeight, elWidth, elPadding, lbHeight, lbWidth] = getLegendSize(items, fontSize, position);

      // compute size of whole legend box
      legendHeight = (elHeight + 2 * elPadding) * items.length;
      legendWidth = (elWidth + 2 * elPadding + lbWidth);

      // compute coordinates of top left corner of the legend box
      const xLimPx = axes.transform($xLim, $tX.coords);
      left = position.includes("left") ? xLimPx[0] + axes.TICK_SIZE[$scale] :
          position.includes("right") ? xLimPx[1] - legendWidth - axes.TICK_SIZE[$scale] :
          mean(xLimPx) - legendWidth/2;

      const yLimPx = axes.transform($yLim, $tY.coords);
      top = position.includes("top") ? yLimPx[1] + axes.TICK_SIZE[$scale] :
          position.includes("bottom") ? yLimPx[0] - legendHeight - axes.TICK_SIZE[$scale] :
          mean(yLimPx) - legendHeight/2;
   }
</script>

{#if $isOk }

<!-- outer legend box, background and frame -->
<svg x="{left}px" y="{top}px" height="{legendHeight}px" width="{legendWidth}">
<rect height="100%" width="100%" fill="white" stroke="{Colors.MIDDLEGRAY}"></rect>

{#each items as item, i}

<!-- individual legend item -->
<svg x="{0}px" y="{i * (elHeight + 2 * elPadding)}px" width="{legendWidth}px" height="{elHeight + 2 * elPadding}px">

   <!-- line -->
   {#if item.lineType && item.lineType > 0 && item.lineType <= 4}
   <line x1={elPadding} x2={elPadding + elWidth} y1={(elHeight + elPadding * 2)/2} y2={(elHeight + elPadding * 2)/2} stroke="{item.lineColor ? item.lineColor : Colors.PRIMARY}" stroke-width="{item.lineWidth ? item.lineWidth : 1}px" stroke-dasharray="{axes.LINE_STYLES[$scale][item.lineType - 1]}"/>
   {/if}

   <!-- marker -->
   {#if item.marker && item.marker > 0 && item.marker < axes.MARKER_SYMBOLS.length}
   <text x="{(elWidth + 2 * elPadding)/2}px" y="{(elHeight + 2 * elPadding)/2}px"
      dominant-baseline="middle" fill="{item.faceColor ? item.faceColor : 'transparent'}" stroke-width="{item.borderWidth ? item.borderWidth : 1}px" stroke="{item.borderColor ? item.borderColor : Colors.PRIMARY}" font-size="{fontSize}px" text-anchor="middle">{axes.MARKER_SYMBOLS[item.marker - 1]}</text>
   {/if}



   <!-- text -->
   <text xml:space="preserve" x="{elWidth + elPadding * 3}px" y="{elPadding}px" dominant-baseline="hanging" text-anchor="start" fill="{Colors.LEGEND}" font-size="{fontSize}px">{@html ' ' + item.label}</text>

</svg>
{/each}
</svg>
{/if}
