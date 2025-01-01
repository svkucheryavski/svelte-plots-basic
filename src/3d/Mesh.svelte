<!--
@component Adds a mesh plot as a set of grid points and line segments connected them.

   Main properties:
   - `xValues` - array of vector with x-coordinates of the mesh points.
   - `zValues` - array of vector with z-coordinates of the mesh points.
   - `yValues` - matrix (!) with y-coordinates of the points defining its height.
   - `colmap` - array with colors to use for different height.
   - `lineWidth` - width (thickness) of the lines in pixels, defailt: `1`.
   - `lineType` -  type of lines (`1` - solid, `2` - dashed, `3` - dotted, `4` - dashdot).
   - `title` - title of the line series group.

   Example:
   ```jsx
   <script>
      import { Axes, Mesh } from 'svelte-plots-basic/3d';
      import { gecolmap } from 'svelte-plots-basic/utils';

      const xMesh = Vector.seq(-8, 8, 1);
      const zMesh = Vector.seq(-8, 8, 1);
      const yMesh = Matrix.outer(xMesh, zMesh, (x, y) => 6 - (x**2 + y**2) / 10);
   </script>

   <Axes limX={[-10, 10]} limY={[-10, 10]} limZ={[-10, 10]}>
      <Mesh xValues={xMesh} yValues={yMesh} zValues={zMesh} colmap={getcolmap(16)}/>
   </Axes>
-->
<script>

   import { Vector, cbind, ismatrix } from 'mdatools/arrays';
   import { range } from 'mdatools/stat';
   import { getContext } from 'svelte';
   import { Colors, LINE_STYLES } from '../constants';
   import { checkCoords, transform3D } from '../methods';

   let {
      title = '',
      xValues,
      yValues,
      zValues,
      colmap = [Colors.PRIMARY, Colors.PRIMARY],
      lineType = 1,
      lineWidth = 1,
   } = $props();

   // check user defined coordinates
   const ux = $derived(checkCoords(xValues, 'Mesh (3D)'));
   const uz = $derived(ux ? checkCoords(zValues, 'Mesh (3D)', ux.length) : null);
   const Uy = $derived.by(() => {
      if (!ux || !uz) return null;
      if (!ismatrix(yValues)) {
         console.error('Mesh: parameter "yValues" must be a matrix with height values of mesh points.');
         return null;
      }
      return yValues;
   });


   // compute coordinates of mesh elements
   const mesh = $derived.by(() => {

      if (!Uy) return null;

      const nbins = colmap.length;
      const nx = Uy.nrows;
      const nz = Uy.ncols;

      const nr = range(Uy.v);
      const dnr = (nr[1] - nr[0]) / 100;
      const left = nr[0] - dnr;
      const right = nr[1] + dnr;
      const span = right - left;

      // compute coordinates for mesh segments lines
      const x1s = Vector.zeros((nx - 1) * nz);
      const z1s = Vector.zeros((nx - 1) * nz);
      const y1s = Vector.zeros((nx - 1) * nz);

      const x2s = Vector.zeros((nx - 1) * nz);
      const z2s = Vector.zeros((nx - 1) * nz);
      const y2s = Vector.zeros((nx - 1) * nz);

      const color1 = Vector.zeros((nx - 1) * nz);

      const x1e = Vector.zeros((nx - 1) * nz);
      const z1e = Vector.zeros((nx - 1) * nz);
      const y1e = Vector.zeros((nx - 1) * nz);

      const x2e = Vector.zeros((nx - 1) * nz);
      const z2e = Vector.zeros((nx - 1) * nz);
      const y2e = Vector.zeros((nx - 1) * nz);

      const color2 = Vector.zeros((nx - 1) * nz);

      let n1 = 0, n2 = 0;
      for (let z = 0; z < nz; z++) {
         for (let x = 0; x < nx; x++) {

            if (x < nx - 1) {

               // x-direction - start
               x1s.v[n1] = ux.v[x];
               z1s.v[n1] = uz.v[z];
               y1s.v[n1] = Uy.v[z * nz + x];

               // x-direction - end
               x1e.v[n1] = ux.v[x + 1];
               z1e.v[n1] = uz.v[z];
               y1e.v[n1] = Uy.v[z * nz + x + 1];

               const colInd = Math.round(((Uy.v[z * nz + x] + Uy.v[z * nz + x + 1]) / 2 - left) / span * (nbins - 1));
               color1.v[n1] = colInd;
               n1 = n1 + 1;
            }

            if (z < nz - 1) {

               // z-direction - start
               x2s.v[n2] = ux.v[x];
               z2s.v[n2] = uz.v[z];
               y2s.v[n2] = Uy.v[z * nz + x];

               // z-direction - end
               x2e.v[n2] = ux.v[x];
               z2e.v[n2] = uz.v[z + 1];
               y2e.v[n2] = Uy.v[(z + 1) * nz + x];

               const colInd = Math.round(((Uy.v[z * nz + x] + Uy.v[(z + 1) * nz + x]) / 2 - left) / span * (nbins - 1));
               color2.v[n2] = colInd;
               n2 = n2 + 1;
            }
         }
      }

      const M1s = cbind(x1s, y1s, z1s);
      const M1e = cbind(x1e, y1e, z1e);
      const M2s = cbind(x2s, y2s, z2s);
      const M2e = cbind(x2e, y2e, z2e);

      return {M1s, M1e, M2s, M2e, color1, color2};
   });

   // get axes context and compute screen coordinates
   const axes = getContext('axes');
   const s1s = $derived(mesh ? transform3D(mesh.M1s, axes.tM()) : null);
   const s1e = $derived(mesh ? transform3D(mesh.M1e, axes.tM()) : null);
   const s2s = $derived(mesh ? transform3D(mesh.M2s, axes.tM()) : null);
   const s2e = $derived(mesh ? transform3D(mesh.M2e, axes.tM()) : null);

   const lineStyleStr = $derived(`stroke-width: ${lineWidth}px;stroke-dasharray:${LINE_STYLES[axes.scale()][lineType-1]};`);
</script>

<g class="series series_mesh" style={lineStyleStr} data-title={title}>
{#if s1s && s1e && s2s && s2e }
   {#each s1s.x as v, i}
   <line x1={s1s.x[i]} x2={s1e.x[i]} y1={s1s.y[i]} y2={s1e.y[i]} style={`stroke:${colmap[mesh.color1.v[i]]};`} />
   {/each}
   {#each s2s.x as v, i}
   <line x1={s2s.x[i]} x2={s2e.x[i]} y1={s2s.y[i]} y2={s2e.y[i]} style={`stroke:${colmap[mesh.color2.v[i]]};`} />
   {/each}
{/if}
</g>

