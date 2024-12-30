<!--
@component Adds a series with line segments.

   Main properties:
   - `xValues`- vector or array with x-coordinates for each label.
   - `yValues`- vector or array with y-coordinates for each label.
   - `labels`- single string or array with labels (strings).
   - `pos`- position of labels related to coordinates (`0` - middle - default, `1` - bottom, `2` - left, `3` - top, `4` - right).
   - `faceColor`-  face color of label symbols, default: `Colors.PRIMARY_TEXT`.
   - `borderColor`- border colors of label symbols, default: `'transparent'`.
   - `borderWidth`- border width of label symbols in pixels, default: `0`.
   - `textSize`- size of label symbols in em, default: `1`.
   - `className`- CSS class name for the labels group, default: `'series-text'`.
   - `rotateAngle`- angle to rotate labels, default: `0`.
   - `title` - title of the labels group.
   - `onclick` - function (callback) to be called when user clicks on a label.

   Example:
   ```jsx
   <script>
      import { Axes, TextLabels } from 'svelte-plots-basic/2d';

      const xValues = [1, 2, 3, 4];
      const yValues = [1, 2, 3, 4];
      const labels = ['🤣', '😀', '😀', '🤣'];
   </script>

   <Axes limX={[0, 5]} limY={[0, 5]} >
      <TextLabels {xValues} {yValues} {labels} />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
   import { Colors } from '../constants';
   import { checkCoords, transformCoords, handleClick } from '../methods';
   import { LABELS_MARGIN } from '../constants';
    import Points from './Lines.svelte';

   let {
	   xValues,                             // vector or array with x-coordinates for each label
      yValues,                             // vector or array with y-coordinates for each label
      labels,                              // array with labels (strings)
      pos = 0,                             // position of labels related to coordinates (middle, bottom, left, top, right)
      faceColor = Colors.PRIMARY_TEXT,     // face color of label symbols
      borderColor = 'transparent',         // border colors of label symbols
      borderWidth = 0,                     // border width of label symbols
      textSize = 1,                        // size of label symbols
      className = 'series-text',           // CSS class name for the labels group
      rotateAngle = 0,                     // angle to rotate labels
      title = '',                          // title of the labels group
      onclick,                             // function to be called if onclick event fires
   } = $props();

   // array with text anchors for correct positioning
   const textAnchors = ['middle', 'middle', 'start', 'middle', 'end'];

   // sanity checks of coordinates provided by user
   const xv = $derived(checkCoords(xValues, 'TextLabels'));
   const yv = $derived(xv ? checkCoords(yValues, 'TextLabels', xv.length) : null);

   // sanity check for labels
   const l = $derived.by(() => {
      if (!yv) return null;

      if (Array.isArray(labels) && labels.length !== yv.length) {
         console.error('TextLabels: number of elements in "labels" does not match number of coordinates');
         return null;
      }

      return labels;
   });

   // sanity check for position values
   const p = $derived.by(() => {
      if (!l) return null;

      if (typeof labels === 'string' && typeof pos !== 'number' ) {
         console.error('TextLabels: parameter "labels" is provided as single string, so "pos" must be a single number.');
         return null;
      }

      return pos;
   })

   // get axes context and compute coordinates
   const axes = getContext('axes');
   const x = $derived(xv && p !== null ? transformCoords(xv, axes.tX()) : null);
   const y = $derived(yv && x ? transformCoords(yv, axes.tY()) : null);

   // define x and y shifts for positioning
   const m = $derived(LABELS_MARGIN[axes.scales().plot]);
   const dx = $derived([0, 0, m,  0, -m, m]);
   const dy = $derived([0, m, 0, -m, 0, m]);

   // styles for the elements
   const textStyleStr = $derived(`fill:${faceColor};stroke-width:${borderWidth}px;stroke:${borderColor};font-size:${textSize}em;`);

   // local status
   const isOk = $derived(x && y && p !== null && l && x.length === y.length);
</script>

{#if isOk}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g class="series {className}" title={title} style={textStyleStr} onclick={(e) => handleClick(e, 'text', onclick)} >

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
