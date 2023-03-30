import { cbind, vector, isvector, Vector } from 'mdatools/arrays';

/**
 * Check coordinates and convert them to vector if necessary.
 *
 * @param {Array|Vector} x - vector or array with coordinates.
 * @param {string} source - name of component which called the method (needed for error message).
 *
 * @returns {Vector}
 *
 */
export function checkCoords(x, source) {

   if (Array.isArray(x)) {
      x = vector(x);
   }

   if (!isvector(x)) {
      throw Error(source + ": coordinates must be provided as array or instance of Vector class.");
   }

   if (x.length < 1) {
      throw Error(source + ": vector with coordinates is empty.");
   }

   return x;
}

/**
 * Create string with coordinates of SVG polygon in 3D.
 *
 * @param {Array|Vector} x - vector with x-coordinates of polygon points.
 * @param {Array|Vector} y - vector with y-coordinates of polygon points.
 * @param {Array|Vector} z - vector with y-coordinates of polygon points.
 * @param {Array} tM - transformation matrix for 3D->2D (from 'Axes').
 * @param {Object} axes - JSON with Axes context.
 *
 * @returns {string} string with coordinates.
 *
 */
export function val2p3d(x, y, z, tM, axes) {

   if (x === undefined || y === undefined) return undefined;

   const [px, py] = axes.transform(cbind(checkCoords(x), checkCoords(y), checkCoords(z)), tM);

   if (px.length !== py.length) {
      throw Error('PlotSeries: parameters "xValues", "yValues" and "zValues" must be numeric vectors of the same length.');
   }

   let p = "";
   for (let i = 0; i < px.length; i++) {
      p += px[i] + "," + py[i] + " ";
   }

   return p;
}


/**
 * Create string with coordinates of SVG polygon.
 *
 * @param {Array|Vector} x - vector with x-coordinates of polygon points.
 * @param {Array|Vector} y - vector with y-coordinates of polygon points.
 * @param {Array} tX - transformation parameters for x-coordinates (from 'Axes').
 * @param {Array} tY - transformation parameters for y-coordinates (from 'Axes').
 * @param {Object} axes - JSON with Axes context.
 *
 * @returns {string} string with coordinates.
 *
 */
export function val2p(x, y, tX, tY, axes) {

   if (x === undefined || y === undefined) return undefined;

   const px = axes.transform(checkCoords(x), tX.coords);
   const py = axes.transform(checkCoords(y), tY.coords);

   if (px.length != py.length) {
      throw Error('PlotSeries: parameters "xValues" and "yValues" must be numeric vectors of the same length.');
   }

   let p = "";
   for (let i = 0; i < px.length; i++) {
      p += px[i] + "," + py[i] + " ";
   }

   return p;
}

/**
 * Computes nice tick values for axis.
 *
 * @param {Array} ticks - vector with ticks if alredy available (if not, new will be computed).
 * @param {Array} lim - vector with axis limits tickets must be computed for.
 * @param {number} maxTickNum - maximum number of ticks to compute.
 * @param {boolean} round - round or not the fractions when computing nice numbers for the ticks.
 *
 * @returns {Array} an array with computed tick positions.
 *
 */
export function getAxisTicks(ticks, lim, maxTickNum, round = true) {

   // if ticks are already provided do not recompute them
   if (ticks !== undefined) {
      if (Array.isArray(ticks)) {
         ticks = vector(ticks);
      }

      if (!isvector(ticks)) {
         throw Error('getAxisTicks: axis ticks must be provided as an array or as a vector.');
      }

      return ticks.filter(x => x >= lim[0] & x <= lim[1]);
   }

   // check if limits are ok
   if (typeof(lim) !== "object" || lim[0] === undefined || lim[1] === undefined) return undefined;

   // get range as a nice number and compute min, max and steps for the tick sequence
   const delta = (lim[1] - lim[0]) / 50;
   const range = niceNum(lim[1] - lim[0] - 1 * delta, round);
   const tickSpacing = niceNum(range / (maxTickNum - 1), round);
   const tickMin = Math.ceil((lim[0] + delta) / tickSpacing) * tickSpacing;
   const tickMax = Math.floor((lim[1] - delta) / tickSpacing) * tickSpacing;

   // recompute maxTickNum
   maxTickNum = Math.round((tickMax - tickMin + 1) / tickSpacing) + 1;

   // create a sequence of ticks
   ticks = Vector.seq(tickMin, tickMax, tickSpacing);

   // if step is smaller than 1 round values to remove small decimals accidentiall added by JS
   if (Math.abs(tickSpacing) < 1) {
      const r = Math.pow(10, 1 + Math.round(-Math.log10(tickSpacing)));
      ticks = ticks.apply(v => Math.round((v + Number.EPSILON) * r) / r)
   }

   // make sure the ticks are not aligned with axes limits
   return ticks.filter(x => x >= lim[0] & x <= lim[1]);
}


/**
 * Computes a nice spacing value for a given range.
 *
 * @param {Number} localRange - a range (max - min).
 * @param {boolean} round - round or not the fractions when computing the number.
 *
 * @returns {Number} the computed spacing value.
 *
 */
export function niceNum( localRange,  round) {

   const exponent = Math.floor(Math.log10(localRange));
   const fraction = localRange / Math.pow(10, exponent);
   let niceFraction;

   if (round) {
      if (fraction < 1.5)
         niceFraction = 1;
      else if (fraction < 3)
         niceFraction = 2;
      else if (fraction < 7)
         niceFraction = 5;
      else
         niceFraction = 10;
   } else {
      if (fraction <= 1)
         niceFraction = 1;
      else if (fraction <= 2)
         niceFraction = 2;
      else if (fraction <= 5)
         niceFraction = 5;
      else
         niceFraction = 10;
   }

   return niceFraction * Math.pow(10, exponent);
}


/**
 * Rounds coordinate values to single decimal
 */
export function roundCoords(x) {
   return Math.round(x * 10) / 10
}


/**
 * Computes a scale level.
 *
 * @param {numeric} width - width of plotting area in pixels.
 * @param {numeric} height - height of plotting area in pixels.
 *
 * @returns {text} the scale level ("small", "medium" or "large").
 *
 */
export function getScale(width, height) {
   if (height < 300.2 || width < 300.2) return "small";
   if (height < 600.2 || width < 600.2) return "medium";
   if (height < 850.2 || width < 850.2) return "large";
   return "xlarge";
}