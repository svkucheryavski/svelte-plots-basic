<script>
   /****************************************************
   * Legend                                            *
   * --------------------                              *
   * shows legend for plot components                  *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';

   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let items;                // array with text labels for each legend element

   export let margin = 0.01;         // margin between axes borders and the legend border (as percent of axes size)
	export let position = "topleft";  // position of the legend ("topleft", "top", "topright", "right", "bottomright", etc).
   export let location = "inside";

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

   const fontSizes = {"small": 10, "medium": 12, "large": 14};

   let elUnit, elMargin, elHeight, elWidth;
   $: if (isOk) {
      elUnit = fontSizes[$scale];
      elMargin = elUnit / 2;
      elHeight = elUnit + 2 * elMargin;
      elWidth = elUnit;
   };

   // compute size and coordinates of the legend items
   let x, y;
   $: {
      if ($isOk) {
         // horizontal positions
         const width = $xLim[1] - $xLim[0];
         x = axes.transform([
            $xLim[0] + width * margin,
            $xLim[1] - width * margin,
            width / 2
         ], $tX.coords);

         // vertical positions
         const height = $yLim[1] - $yLim[0];
         y = axes.transform([
            $yLim[1] - height * margin,
            $yLim[0] + height * margin,
            height / 2
         ], $tY.coords);
      }

      const n = items.length;
      const elements = new Array(n);
   }

   // TODO: to be implemented
   const getTextWidth = (text, font) => {
   const element = document.createElement('canvas');
   const context = element.getContext('2d');
   context.font = font;
   return context.measureText(text).width;
   }

$: {
   for (let i = 0; i < items.length; i++) {
      console.log(getTextWidth(items[i].label, 'Arial'))
   }
}

</script>

{#if $isOk }

<svg x="{x[0] + 10}px" y="{y[0]}px" height="{elHeight * items.length}px" width="100px">
<rect height="100%" width="100%" style="fill:white"></rect>
{#each items as item, i}
<svg x="{0}px" y="{i * elHeight}px" height="{elHeight}px" >

   <!-- line -->
   {#if item.lineType && item.lineType > 0 && item.lineType <= 4}
   <line x1={0} x2={elWidth} y1={elHeight/2} y2={elHeight/2} style={`
      stroke:${item.lineColor ? item.lineColor : Colors.PRIMARY};
      stroke-width: ${item.lineWidth ? item.lineWidth : 1}px;
      stroke-dasharray:${axes.LINE_STYLES[$scale][item.lineType - 1]}
   `}/>
   {/if}

   <!-- marker -->
   {#if item.marker && item.marker > 0 && item.marker < axes.MARKER_SYMBOLS.length}
   <text x="{elMargin/2}px" y="{elMargin}px"
      dominant-baseline="hanging"
      style={`
         background: red;
         fill:${item.faceColor ? item.faceColor : "transparent"};
         stroke-width:${item.borderWidth ? item.borderWidth : 1}px;
         stroke:${item.borderColor ? item.borderColor : Colors.PRIMARY};
         font-size:${elUnit}px;
         text-anchor:start;`}
   >{axes.MARKER_SYMBOLS[item.marker - 1]}</text>
   {/if}



   <!-- text -->
   <text x="{elWidth + elMargin}px" y="{elMargin}px"
      dominant-baseline="hanging"
      style={`text-anchor:start;fill:${Colors.LEGEND};font-size:${elUnit}px`};
   >{@html item.label}</text>

</svg>
{/each}
</svg>
{/if}
