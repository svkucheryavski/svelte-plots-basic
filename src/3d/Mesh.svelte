<script>
   /****************************************************
   * Segments for 3D plot                              *
   * --------------------                              *
   * shows a series of line segments on the plot       *
   *****************************************************/

   import { Vector, cbind, ismatrix, isvector } from 'mdatools/arrays';
   import { range } from 'mdatools/stat';
   import { getContext } from 'svelte';
   import { Colors } from '../Colors';
   import { checkCoords } from '../Utils';


   /*****************************************/
   /* Input parameters                      */
   /*****************************************/

   export let title = '';
	export let xValues;
   export let yValues;
   export let zValues;

   export let colmap = [Colors.PRIMARY, Colors.PRIMARY];
   export let lineType = 1;
   export let lineWidth = 1;

   // get axes context and reactive variables needed to compute coordinates
   const axes = getContext('axes');
   const scale = axes.scale;
   const tM = axes.tM;
   const isOk = axes.isOk;

   let xMesh1Start, xMesh1End, yMesh1Start, yMesh1End, zMesh1Start, zMesh1End, meshColor1;
   let xMesh2Start, xMesh2End, yMesh2Start, yMesh2End, zMesh2Start, zMesh2End, meshColor2;

   $: {
      if (!ismatrix(yValues)) {
         throw Error('Mesh: parameter "yValues" must be a matrix with height values of mesh points.');
      }

      if (Array.isArray(xValues)) {
         xValues = vector(xValues);
      }

      if (Array.isArray(zValues)) {
         zValues = vector(zValues);
      }

      if (!isvector(zValues) || !isvector(xValues)) {
         throw Error('Mesh: parameters "xValues" and "zValues" must be vectors or arrays with values.');
      }

      const nbins = colmap.length;
      const nx = yValues.nrows;
      const nz = yValues.ncols;

      const nr = range(yValues.v);
      const dnr = (nr[1] - nr[0]) / 100;
      const left = nr[0] - dnr;
      const right = nr[1] + dnr;
      const span = right - left;
      console.log(nr)
      console.log([left, right, span])

      // compute coordinates for mesh segments lines
      xMesh1Start = Vector.zeros((nx - 1) * nz);
      zMesh1Start = Vector.zeros((nx - 1) * nz);
      yMesh1Start = Vector.zeros((nx - 1) * nz);

      xMesh2Start = Vector.zeros((nx - 1) * nz);
      zMesh2Start = Vector.zeros((nx - 1) * nz);
      yMesh2Start = Vector.zeros((nx - 1) * nz);

      meshColor1 = Vector.zeros((nx - 1) * nz);

      xMesh1End = Vector.zeros((nx - 1) * nz);
      zMesh1End = Vector.zeros((nx - 1) * nz);
      yMesh1End = Vector.zeros((nx - 1) * nz);

      xMesh2End = Vector.zeros((nx - 1) * nz);
      zMesh2End = Vector.zeros((nx - 1) * nz);
      yMesh2End = Vector.zeros((nx - 1) * nz);

      meshColor2 = Vector.zeros((nx - 1) * nz);

      let n1 = 0, n2 = 0;
      for (let z = 0; z < nz; z++) {
         for (let x = 0; x < nx; x++) {

            if (x < nx - 1) {

               // x-direction - start
               xMesh1Start.v[n1] = xValues.v[x];
               zMesh1Start.v[n1] = zValues.v[z];
               yMesh1Start.v[n1] = yValues.v[z * nz + x];

               // x-direction - end
               xMesh1End.v[n1] = xValues.v[x + 1];
               zMesh1End.v[n1] = zValues.v[z];
               yMesh1End.v[n1] = yValues.v[z * nz + x + 1];

               const colInd = Math.round(((yValues.v[z * nz + x] + yValues.v[z * nz + x + 1]) / 2 - left) / span * (nbins - 1));
               meshColor1.v[n1] = colInd;
               n1 = n1 + 1;
            }

            if (z < nz - 1) {

               // z-direction - start
               xMesh2Start.v[n2] = xValues.v[x];
               zMesh2Start.v[n2] = zValues.v[z];
               yMesh2Start.v[n2] = yValues.v[z * nz + x];

               // z-direction - end
               xMesh2End.v[n2] = xValues.v[x];
               zMesh2End.v[n2] = zValues.v[z + 1];
               yMesh2End.v[n2] = yValues.v[(z + 1) * nz + x];

               const colInd = Math.round(((yValues.v[z * nz + x] + yValues.v[(z + 1) * nz + x]) / 2 - left) / span * (nbins - 1));
               meshColor2.v[n2] = colInd;
               n2 = n2 + 1;
            }
         }
      }

      xMesh1Start = xMesh1Start.copy()
      xMesh1End = xMesh1End.copy()
      yMesh1Start = yMesh1Start.copy()
      yMesh1End = yMesh1End.copy()
      zMesh1Start = zMesh1Start.copy()
      zMesh1End = zMesh1End.copy()
   };

   let x11, y11, x12, y12;
   let x21, y21, x22, y22;

   $: {
      if ($isOk) {
         [x11, y11] = axes.transform(
            cbind(
               checkCoords(xMesh1Start, 'Segments'),
               checkCoords(yMesh1Start, 'Segments'),
               checkCoords(zMesh1Start, 'Segments')
            ), $tM
         );

         [x12, y12] = axes.transform(
            cbind(
               checkCoords(xMesh1End, 'Segments'),
               checkCoords(yMesh1End, 'Segments'),
               checkCoords(zMesh1End, 'Segments')
            ), $tM
         );

         [x21, y21] = axes.transform(
            cbind(
               checkCoords(xMesh2Start, 'Segments'),
               checkCoords(yMesh2Start, 'Segments'),
               checkCoords(zMesh2Start, 'Segments')
            ), $tM
         );

         [x22, y22] = axes.transform(
            cbind(
               checkCoords(xMesh2End, 'Segments'),
               checkCoords(yMesh2End, 'Segments'),
               checkCoords(zMesh2End, 'Segments')
            ), $tM
         );
      }
   };

   $: console.log(meshColor1)
   $: lineStyleStr = `stroke-width: ${lineWidth}px;stroke-dasharray:${axes.LINE_STYLES[$scale][lineType-1]};`;
</script>

<g class="series series_mesh" style={lineStyleStr} data-title={title}>
{#if $isOk }
   {#each x11 as v, i}
      <line vector-effect="non-scaling-stroke" x1={x11[i]} x2={x12[i]} y1={y11[i]} y2={y12[i]} style={`stroke:${colmap[meshColor1.v[i]]};`} />
   {/each}
   {#each x21 as v, i}
      <line vector-effect="non-scaling-stroke" x1={x21[i]} x2={x22[i]} y1={y21[i]} y2={y22[i]} style={`stroke:${colmap[meshColor2.v[i]]};`} />
   {/each}
{/if}
</g>

