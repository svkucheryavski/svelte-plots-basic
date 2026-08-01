<!--
@component Adds a heatmap visializing values of a matrix.

   Main properties:
   - `values` - matrix (object of class `Matrix` from `mdatools` package) with values to visualize.
   - `breaks` - array (or vector) with interval breaks boundaries (optional).
   - `colmap` - array with colors for each break (optional).

   Example:

   ```svelte
   <script>
      import { Matrix } from 'mdatools/arrays';
      import { Axes, Heatmap } from 'svelte-plots-basic/2d';

      // create matrix with 5 rows and 10 columns filled with 5random values.
      const x = Matrix.rand(5, 10);
   </script>

   <Axes>
      <Heatmap values={x} />
   </Axes>
   ```
-->
<script>

   import { getContext } from 'svelte';
   import { ismatrix, isvector } from 'mdatools/arrays';
   import { expandgrid } from 'mdatools/misc';
   import { range, split } from 'mdatools/stat';

   import { getcolmap, transformObjects, transformCoords, seq } from '../methods';
   import { HEATMAP_NUM_SPLITS } from '../constants';


   let {
      values,                        // Matrix with values to show heatmap for
      breaks,                        // vector with breaks to distribute the values in
      colmap = null,                 // array with colors for each interval
      onclick = null,                // callback for onclick (returns row and column indices of element)
   } = $props();


   function validateBreaks(values) {
      if (!values || values.length < 2) {
         console.error('Heatmap: "breaks" must contain at least two values.');
         return null;
      }

      const items = Array.from(values);

      if (items.some(value =>
         typeof value !== 'number' || Number.isNaN(value)
      )) {
         console.error('Heatmap: values in "breaks" must be numeric.');
         return null;
      }

      if (items.some((value, index) =>
         index > 0 && value <= items[index - 1]
      )) {
         console.error('Heatmap: values in "breaks" must be strictly increasing.');
         return null;
      }

      return values;
   }


   function findInterval(value, breaks) {
      let low = 1;
      let high = breaks.length - 1;

      while (low < high) {
         const middle = Math.floor((low + high) / 2);

         if (value <= breaks[middle]) {
            high = middle;
         } else {
            low = middle + 1;
         }
      }

      const index = low - 1;

      return value > breaks[index] && value <= breaks[index + 1]
         ? index
         : -1;
   }



   // check that values are provided as a matrix
   let v = $derived(ismatrix(values) && values.nrows > 0 && values.ncols > 0 ? values : null);

   // check and process left values for breaks
   let lb = $derived.by(() => {
      if (!v) return null;

      if (breaks !== undefined && breaks !== null) {
         if (Array.isArray(breaks)) return validateBreaks(breaks);
         if (isvector(breaks)) return validateBreaks(breaks.v);

         console.error('Heatmap: "breaks" must be an array or Vector.');
         return null;
      }

      const valueRange = range(v.v);
      if (valueRange[0] === valueRange[1]) {
         const value = valueRange[0];
         const delta = Math.abs(value) > 0 ? Math.abs(value) * 0.01 : 1;
         const lower = Number.isFinite(value - delta) ? value - delta : value;
         const upper = Number.isFinite(value + delta) ? value + delta : value;
         return validateBreaks([lower, upper]);
      }

      return validateBreaks(split(v.v, HEATMAP_NUM_SPLITS).v);
   });

   // check and process colormap values
   let lc = $derived.by(() => {
      if (!lb) return null;

      if (colmap) {
         if (!Array.isArray(colmap)) {
            console.error('Heatmap: parameter "colmap" must be array with colors.');
            return null;
         }
         if (colmap.length !== lb.length - 1) {
            console.error('Heatmap: number of color values in colormap does not match number of intervals defined by breaks.');
            return null;
         }
         return colmap;
      }
      return getcolmap(lb.length - 1);
   });

   // compute coordinates of heatmap elements (left top corners)
   let l = $derived(v ? seq(v.ncols) : null);
   let t = $derived(v ? seq(v.nrows) : null);
   let lt = $derived(l && t ? expandgrid(t, l) : null);

   // compute world coordinates of the elements for each interval in world coordinates
   let wc = $derived.by( () => {
      if (!lt || !lb || !lc) return null;
      const [top, left] = lt;
      const nv = left.length;  // number of values in matrix
      const nb = lb.length;    // number of breaks
      const intervalCount = nb - 1;
      const rl = Array.from({length: intervalCount}, () => []);  // coordinates of left for every interval
      const rt = Array.from({length: intervalCount}, () => []);  // coordinates of top for every interval
      const rr = Array.from({length: intervalCount}, () => []);  // row indices for every interval
      const rc = Array.from({length: intervalCount}, () => []);  // column indices for every interval

      // adjust left side for the first break and right side for the last
      const llb = lb.slice();
      const w = llb[1] - llb[0];
      llb[0] = llb[0] - 0.1 * w;
      llb[nb - 1] = llb[nb - 1] + 0.1 * w;

      // loop over all breaks
      for (let j = 0; j < nv; j++) {
         const vj = v.v[j];
         const i = findInterval(vj, llb);
         if (i === -1) continue;

         rl[i].push(left.v[j] - 0.5);
         rt[i].push(v.nrows - top.v[j] + 1.5);
         rr[i].push(top.v[j]);
         rc[i].push(left.v[j]);
      };
      return {rl, rt, rr, rc};
   });


   // get axes context and compute screen coordinates
   const axes = getContext('axes');
   let rx = $derived(wc ? wc.rl.map(v => v.length >  0 ? transformCoords(v, axes.tX()) : []) : null);
   let ry = $derived(wc ? wc.rt.map(v => v.length >  0 ? transformCoords(v, axes.tY()) : []) : null);
   let rw = $derived(transformObjects([1], axes.tX()));
   let rh = $derived(transformObjects([1], axes.tY()));

   // mouse click handler
   function handleClick(e) {
      if (!onclick || typeof onclick !== 'function') return;

      const el = e.target;
      if (el.tagName !== 'rect') return;

      const row = parseInt(el.getAttribute('data-row'));
      const col = parseInt(el.getAttribute('data-col'));
      if (!isNaN(row) && !isNaN(col)) {
         onclick(row, col);
         e.stopPropagation();
      }
   }


   // check status
   let isOk = $derived(rx && ry && rx.length === ry.length);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if isOk}
   <!-- svelte-ignore a11y_click_events_have_key_events -->
   <g class="heatmap" style="stroke:0;stroke-width:0px;" onclick={handleClick}>
   <!-- loop over colors/intervals -->
   {#each lc as col, i}
      <g title="heatmap-group" style="fill:{col};">
      {#if rx[i].length > 0}
         <!-- loop over elements which fall into the interval -->
         {#each rx[i] as v, j}
            <rect x={rx[i][j]} y={ry[i][j]} width={rw} height={rh} data-row={wc.rr[i][j]} data-col={wc.rc[i][j]}/>
         {/each}
      {/if}
      </g>
   {/each}
   </g>
{/if}
