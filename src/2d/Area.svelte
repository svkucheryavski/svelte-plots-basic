<!--
@component Adds a closed polygon (area).

   Main properties:
   - `xValues` - array of vector with x-coordinates of the polygon's points.
   - `yValues` - array of vector with y-coordinates of the polygon's points.
   - `lineWidth` - width (thickness) of the polygon's line in pixels, defailt: `1`.
   - `lineColor` - line color, default: `Colors.PRIMARY`.
   - `lineType` -  type of line (`1` - solid, `2` - dashed, `3` - dotted, `4` - dashdot).
   - `facColor` - face (fill) color of the polygon, default: `'transparent'`.
   - `opacity` - opacity of the face color, default: `1`.
   - `title` - title of the area group.
   - `onclick` - function (callback) to be called when user clicks on a polygon.

   Example:
   ```jsx
   <script>
      import { Axes, Area } from 'svelte-plots-basic/2d';

      const xValues = [-3, -2, -1, 0, 1, 2, 3];
      const yValues = [9, 4, 1, 0, 1, 4, 9];
   </script>

   <Axes limX={[-4, 4]} limY={[-2, 10]}>
      <Area {xValues} {yValues}  />
   </Axes>
   ```
-->
<script>
   import { getContext } from 'svelte';
   import { Colors } from '../constants';
   import { val2p, checkCoords, handleClick, transformCoords } from '../methods';
   import { LINE_STYLES } from '../constants';

   /** @type {Props} */
   let {
	   xValues,                       // vector or array with x-coordinates of the points
      yValues,                       // vector or array with y-coordinates of the points
      lineColor = Colors.PRIMARY,    // color of segment lines
      lineType = 1,                  // type of segment lines (1 - solid, 2 - dashed, 3 - dotted, 4 - dashdot)
      lineWidth = 1,                 // width (thickness) of segment lines
      faceColor = 'transparent',     // color of segment lines
      opacity = 1,                   // opacity of the area color
      title = '',                    // title of the point series group
      onclick,                       // function to be called if onclick event fires
   } = $props();

   // check user provided coordinates
   const xv = $derived(checkCoords(xValues, 'Area'));
   const yv = $derived(xv ? checkCoords(yValues, 'Area', xv.length) : null);

   // get axes context and compute coordinates of polyline
   const axes = getContext('axes');
   const p = $derived(xv && yv ? val2p(xv, yv, axes.tX(), axes.tY()) : null);

   const y0 = $derived(p ? transformCoords([0], axes.tY()) : null);
   const xs = $derived(xv ? transformCoords(xv.subset(1), axes.tX()) : null);
   const pa = $derived(p && xs && y0 ? xs + ',' + y0 + ' ' + p + ' ' + xs + ',' + y0 : null);

   const areaStyleStr = $derived(`opacity:${opacity};fill:${faceColor};stroke:${lineColor};stroke-width: ${lineWidth}px;stroke-dasharray:${LINE_STYLES[axes.scales().plot][lineType - 1]}`);
</script>

{#if pa}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g onclick={(e) => handleClick(e, 'polygon', onclick)}
   class="series series_area" style={areaStyleStr} title={title}>
   <polygon points={pa}/>
</g>
{/if}

