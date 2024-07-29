<script>
   /****************************************************
   * TextLabels component                              *
   * --------------------                              *
   * shows a series of text labels on the plot         *
   *****************************************************/

   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { checkCoords } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

	export let xValues;                             // vector or array with x-coordinates for each label
   export let yValues;                             // vector or array with y-coordinates for each label
   export let labels;                              // array with labels (strings)
   export let pos = 0;                             // position of labels related to coordinates (middle, bottom, left, top, right)
   export let faceColor = Colors.PRIMARY_TEXT;     // face color of label symbols
   export let borderColor = 'transparent';         // border colors of label symbols
   export let borderWidth = 0;                     // border width of label symbols
   export let textSize = 1;                        // size of label symbols
   export let className = 'series-text';           // CSS class name for the labels group
   export let title = 'series-text';               // title of the labels SVG group
   export let rotateAngle = 0;                     // angle to rotate labels

   /*****************************************/
   /* Component code                        */
   /*****************************************/

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const scale = axes.scale;
   const tX = axes.tX;
   const tY = axes.tY;
   const isOk = axes.isOk;

   const textAnchors = ['middle', 'middle', 'start', 'middle', 'end'];

   let x, y = undefined;
   let dx = 0, dy = 0;

   // reactive calculations triggered by changes in coordinates and plot parameters
   $: if ($isOk) {

      if (typeof labels === 'string' && typeof pos !== 'number' ) {
         throw Error('TextLabels: parameter "labels" is provided as single string, so "pos" must be a single number.');
      }

      x = axes.transform(checkCoords(xValues, 'TextLabels'), $tX.coords);
      y = axes.transform(checkCoords(yValues, 'TextLabels'), $tY.coords);

      // sanity check for input parameters
      if (x.length !== y.length) {
         throw Error('TextLabels: parameters "xValues" and "yValues" must be vectors of the same length.');
      }

      if (Array.isArray(labels) && labels.length !== x.length ) {
         throw Error('TextLabels: number of elements in "labels" does not match number of coordinates.');
      }
   }

   // reactive calculations triggered by changes in scale
   $: {
      const m = axes.LABELS_MARGIN[$scale];
      dx = [0, 0, m,  0, -m, m];
      dy = [0, m, 0, -m, 0, m];
   }

   // styles for the elements
   $: textStyleStr = `fill:${faceColor};stroke-width:${borderWidth}px;stroke:${borderColor};font-size:${textSize}em;`;
</script>

{#if $isOk && x !== undefined && y !== undefined}
<g class="series {className}" title={title} style={textStyleStr} >

   {#if typeof labels === 'string'}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={dx[pos]} dy={dy[pos]}
         transform={rotateAngle !== undefined ? `rotate(${rotateAngle}, ${x[i] + dx[pos]}, ${y[i] + dy[pos]})` : ''}
         text-anchor={textAnchors[pos[i]]}>{@html labels}</text>
   {/each}

   {:else if (Array.isArray(pos) || ArrayBuffer.isView(pos))}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={dx[pos[i]]} dy={dy[pos[i]]} text-anchor={textAnchors[pos[i]]}>{@html labels[i]}</text>
   {/each}

   {:else}
   {#each x as v, i}
      <text data-id={i} x={x[i]} y={y[i]} dx={dx[pos]} dy={dy[pos]} text-anchor={textAnchors[pos]}>{@html labels[i]}</text>
   {/each}
   {/if}
</g>
{/if}
