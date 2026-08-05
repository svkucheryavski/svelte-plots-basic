<!--
@component Adds a series of bars.

   Main properties:
   - `xValues` - vector with x-coordinates of middle points of the bars.
   - `yValues` - vector with y-coordinates of top points of the bars.
   - `barWidth` - width of bars as per cent of maximum width, defaul: `0.8`.
   - `faceColor` - face color of the bars, default:  `Colors.PRIMARY`.
   - `lineColor` - border color of the bars, default: `Colors.PRIMARY`.
   - `lineWidth` - width (thickness) of border line in pixels, default: `1`.
   - `onclick` - function (callback) to be called when user clicks on any bar.

   Example:

   ```svelte
   <script>
      import { Matrix } from 'mdatools/arrays';
      import { Axes, Bars } from 'svelte-plots-basic/2d';

      const xValues = [2000, 2010, 2020, 2030, 2040];
      const yValues = [1, 100, 200, 300, -150];
   </script>

   <Axes limX={[1990, 2050]} limY={[-200, 350]}>
      <Bars {xValues} {yValues} lineColor="red" faceColor="pink" />
   </Axes>
   ```
-->
<script>
   import { Vector } from 'mdatools/arrays';
   import { Colors } from '../constants';
   import { checkCoords } from '../methods';

   import Rectangles from './Rectangles.svelte';


   let {
	   xValues,                       // vector with x-coordinates of middle points of the bars.
      yValues,                       // vector with y-coordinates of top points of the bars.
      barWidth = 0.8,                // width of bars as per cent of maximum width, defaul: `0.8`.
      barWidthExact,                 // 100% bar width in world coordinates (if not provided computed automatically).
      faceColor = Colors.PRIMARY,    // face color of the bars, default:  `Colors.PRIMARY`.
      lineColor = Colors.PRIMARY,  // border color of the bars, default: `Colors.PRIMARY`.
      lineWidth = 1,               // width (thickness) of border line in pixels, default: 1.
      onclick
   } = $props();

   function toNumber(value) {
      const canConvert =
         typeof value === 'number' ||
         (typeof value === 'string' && value.trim() !== '');

      return canConvert ? Number(value) : NaN;
   }

   const bw = $derived.by(() => {
      const value = toNumber(barWidth);
      if (!Number.isFinite(value) || value <= 0 || value > 1) {
         console.error('Bars: parameter "barWidth" must be a finite number greater than 0 and no greater than 1.');
         return null;
      }
      return value;
   });

   const exactWidth = $derived.by(() => {
      if (barWidthExact == null) return {provided: false, value: null};

      const value = toNumber(barWidthExact);
      if (!Number.isFinite(value) || value <= 0) {
         console.error('Bars: parameter "barWidthExact" must be a finite positive number.');
         return null;
      }

      return {provided: true, value};
   });

   const x = $derived.by(() => {
      if (bw === null || exactWidth === null) return null;
      const xv = checkCoords(xValues, 'BarSeries');
      if (!xv) return null;
      const n = xv.length;
      if (n < 1) return null;

      let w;
      if (exactWidth.provided) {
         w = exactWidth.value;
      } else if (n === 1) {
         console.error('Bars: if only one bar must be shown, value for property "barWidthExact" should be provided.');
         return null;
      } else {
         w = Infinity;
         for (let i = 1; i < n; i++) {
            const lw = Math.abs(xv.v[i - 1] - xv.v[i]);
            if (lw < w) w = lw;
         }
      }

      w = w * bw;
      const whalf = w / 2;
      const left = Vector.zeros(n);
      const width = Vector.zeros(n);
      for (let i = 0; i < n; i++) {
         left.v[i] = xv.v[i] - whalf;
         width.v[i] = w;
      }

      return {left, width};
   })

   const y = $derived.by(() => {
      if (!x) return null;
      const yv = checkCoords(yValues, 'BarSeries');
      if (!yv) return null;
      const n = yv.length;
      if (n !== x.left.length) {
         console.error('BarSeries: parameters "yValues" must be vector of the same length as "xValues".');
         return null;
      }

      const top = Vector.zeros(n);
      const height = Vector.zeros(n);

      for (let i = 0; i < n; i++) {
         const v = yv.v[i];
         top.v[i] = (v > 0 ? v : 0);
         height.v[i] = Math.abs(v);
      }

      return {top, height};
   })

   // local check
   const isOk = $derived(x && y);
</script>

{#if isOk}
<Rectangles className="series-bar" left={x.left} width={x.width} top={y.top} height={y.height}
   lineWidth={lineWidth} {lineColor} {faceColor} {onclick} />
{/if}
