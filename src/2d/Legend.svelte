<!--
@component Adds legend for groups of series.

   Main properties:
   - `items` - array with text labels and their visual properties for each legend element.
   - `position` - position of the legend ("topleft", "top", "topright", "right", etc), default: `"topleft"`.
   - `lineColor` - color of the legend box line, default: `Colors.LEGEND`.
   - `lineWidth` - width (thickness) of the legend box line in pixels: `1`.
   - `faceColor` - color of the legend box background: `'#fff'`.
   - `fontSize` - font size for the legend labels in em, default `0.85`.

   Example:

   ```svelte
   <script>
      import {Vector} from 'mdatools/array';

      const x = Vector.seq(-10, 10, 0.1);
      const y1 = x.apply(v => Math.cos(v));
      const y2 = x.apply(v => Math.sin(v));
   </script>

   <Axes limX={[-10, 10]} limY={[-1.1, 1.1]} >

      <Lines xValues={x} yValues={y1} lineColor="red" lineType="3" />
      <Lines xValues={x} yValues={y2} lineColor="blue" lineType="1" />
      <Points xValues={x} yValues={y2} faceColor="white" borderColor="blue" />

      <Legend
         position="topright"
         items = {[
            {"label": "cos(x)", "lineType": 1, "lineColor": "red"},
            {"label": "sin(x)", "lineType": 1, "lineColor": "blue", "marker": 1, "faceColor": "white", "borderColor": "blue"},
         ]}
      />

      <Box />
      <XAxis label="x" showGrid={true} />
      <YAxis label="f(x)" showGrid={true} />
   </Axes>
-->
<script>
   import { getContext } from 'svelte';
   import { Colors, MARKER_SYMBOLS } from '../constants';
   import { text2svg } from '../methods';

   let {
      items,                     // array with text labels and their visual properties for each legend element.
	   position = "topleft",      // position of the legend ("topleft", "top", "topright", "right", "bottomright", etc).
      lineColor = Colors.LEGEND, // color of the legend box line
      lineWidth = 1,             // width (thickness) of the legend box line
      faceColor = "#fff",        // background color of the legend box
      fontSize = 0.85            // font size for labels in em.
   } = $props();


   /* check if user provided position is correct */
   function checkPosition(position) {

      if (typeof position !== 'string') {
         console.error('Legend: value of "position" must be a string.');
         return null;
      }

      if (!['top', 'left', 'right', 'topleft', 'topright', 'bottom', 'bottomleft', 'bottomright'].includes(position)) {
         console.error('Legend: wrong value of "position" property');
         return null;
      }
      return position;
   }

   /* check if user provided items are correct, transform text labels and set default values if they are absent */
   function processItems(items) {

      if (!items || !Array.isArray(items) || items.length < 1) {
         console.error('Legend: property "items" must be provided as array of JSONs.');
         return null;
      }

      for (let i = 0; i < items.length; i++) {
         const item = items[i];

         // check and transform label
         if (!item.label) {
            console.error('Legend: all elements of "items" must include at least one field: "label".');
            return null;
         }

         const newLabel = text2svg(item.label);
         const labelHeight = newLabel.length === item.label ? 1 : 1.4;
         item.label = newLabel;
         item['labelHeight'] = labelHeight;

         // set default values for lines
         if (item.lineType) {
            if (!(item.lineType > 0 && item.lineType <= 4)) {
               console.error('Legend: parameter "lineType" for legend item ' + (i + 1) + ' is incorrect.');
            }
            item.lineColor = item.lineColor ? item.lineColor : Colors.PRIMARY;
            item.lineWidth = item.lineWidth ? item.lineWidth : 1;
         }

         // set default values for markers
         if (item.marker) {
            if (!(item.marker > 0 && item.marker <= MARKER_SYMBOLS.length)) {
               console.error('Legend: parameter "marker" for legend item ' + (i + 1) + ' is incorrect.');
            }
            item.faceColor =  item.faceColor ? item.faceColor : 'transparent';
            item.borderWidth = item.borderWidth ? item.borderWidth : 1;
            item.borderColor = item.borderColor ? item.borderColor : Colors.PRIMARY;
         }
      }
      return items;
   }

   // get context and update group legend parameters reactivey
   const axes = getContext('axes');
   $effect(() => {
      const newItems = processItems(items);
      const newPosition = checkPosition(position);
      axes.setGroupLegend(
         newItems && newPosition ?
         {show: true, position, items, lineColor, faceColor, lineWidth, fontSize} :
         {show: false, position: null, items: null}
      );
   });
</script>
