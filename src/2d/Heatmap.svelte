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
   import { split } from 'mdatools/stat';

   import { getcolmap, transformObjects, transformCoords, seq } from '../methods';
   import { HEATMAP_NUM_SPLITS } from '../constants';


   /** @type {Props} */
   let {
      values,                        // Matrix with values to show heatmap for
      breaks,                        // vector with breaks to distribute the values in
      colmap = null,                 // array with colors for each interval
   } = $props();


   // check that values are provided as a matrix
   let v = $derived(ismatrix(values) && values.nrows > 0 && values.ncols > 0 ? values : null);

   // check and process left values for breaks
   let lb = $derived.by(() => {
      if (!v) return null;
      if (breaks && Array.isArray(breaks)) return breaks;
      if (breaks && isvector(breaks)) return breaks.v;
      return split(v.v, HEATMAP_NUM_SPLITS).v;
   });

   // check and process colormap values
   let lc = $derived.by(() => {
      if (colmap) {
         if (!Array.isArray(colmap)) {
            console.error('Heatmap: parameter "colmap" must be array with colors.');
            return null;
         }
         if (colmap.length !== breaks.length - 1) {
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
      const rl = Array(nb).fill().map(() => []);     // coordinates of left for every break
      const rt = Array(nb).fill().map(() => []);     // coordinates of top for every break

      // adjust left side for the first break and right side for the last
      const llb = lb.slice();
      const w = llb[1] - llb[0];
      llb[0] = llb[0] - 0.1 * w;
      llb[nb - 1] = llb[nb - 1] + 0.1 * w;

      // loop over all breaks
      for (let j = 0; j < nv; j++) {
         const vj = v.v[j];
         for (let i = 0; i < nb - 1; i++) {
            if (vj > llb[i] && vj <= llb[i + 1]) {
               rl[i].push(left.v[j] - 0.5);
               rt[i].push(v.nrows - top.v[j] + 1.5);
               break;
            }
         }
      };
      return {rl, rt};
   });


   // get axes context and compute screen coordinates
   const axes = getContext('axes');
   let rx = $derived(wc ? wc.rl.map(v => v.length >  0 ? transformCoords(v, axes.tX()) : []) : null);
   let ry = $derived(wc ? wc.rt.map(v => v.length >  0 ? transformCoords(v, axes.tY()) : []) : null);
   let rw = $derived(transformObjects([1], axes.tX()));
   let rh = $derived(transformObjects([1], axes.tY()));

   // check status
   let isOk = $derived(rx && ry && rx.length === ry.length);
</script>

{#if isOk}
   <g class="heatmap" style="stroke:0;stroke-width:0px;">
   <!-- loop over colors/intervals -->
   {#each lc as col, i}
      <g title="heatmap-group" style="fill:{col};">
      {#if rx[i].length > 0}
         <!-- loop over elements which fall into the interval -->
         {#each rx[i] as v, j}
            <rect x={rx[i][j]} y={ry[i][j]} width={rw} height={rh} />
         {/each}
      {/if}
      </g>
   {/each}
   </g>
{/if}
