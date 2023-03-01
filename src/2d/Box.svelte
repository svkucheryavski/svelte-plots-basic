<script>
   /****************************************************
   * Box                                               *
   * --------------------                              *
   * shows border box around axes                      *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let slot;  // slot name, must be "box"


   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // check that the box is located in a correct slot
   if (slot !== 'box') {
      throw('Component Box must have \'slot="box"\' attribute.')
   }

   // box style
   const rectStyleStr = `fill:transparent;stroke:${Colors.DARKGRAY};stroke-width:1px;`;

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const xLim = axes.xLim;
   const yLim = axes.yLim;
   const isOk = axes.isOk;
   const tX = axes.tX;
   const tY = axes.tY;

   // reactive variables for coordinates of box points in pixels
   $: xx = $isOk ? axes.transform($xLim, $tX.coords) : undefined;
   $: yy = $isOk ? axes.transform($yLim, $tY.coords) : undefined;

</script>

{#if $isOk}
   <g style="pointer-events:none" class="mdaplot__axes-box">
   <rect x={xx[0]} y={yy[1]} width={xx[1] - xx[0]} height={yy[0] - yy[1]} style={rectStyleStr} />
   </g>
{/if}

