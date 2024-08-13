import { cbind, vector, isvector, Vector } from 'mdatools/arrays';
import { min, max, diff } from 'mdatools/stat';


/**
 * Generate vector with axis tick labels and tick factor based on numeric tick values.
 *
 * @param {Vector} ticks - vector with numeric tick values.
 *
 * @returns {Array} an array with tick factor and array with tick labels.
 */
export function getTickLabels(ticks) {

   if (ticks === undefined) return undefined;

   const step = Math.abs(min(diff(ticks)));
   let tickFactor = 0;
   if (step < 1 && Math.abs(max(ticks)) < 1) {
      // values between 0 and 1 (absolute)
      let decNum = Math.ceil(-Math.log10(step));
      if (decNum <= 2) {
         return [0, Array.from(ticks).map(v => v.toFixed(decNum).toString())];
      }
      tickFactor = decNum - 2;
      decNum = 2;
      return [-tickFactor, Array.from(ticks).map(v => (v * Math.pow(10, tickFactor)).toFixed(decNum).toString())];
   } else {
      let decNum = Math.ceil(Math.log10(step));
      if (decNum <= 2) {
         return [0, Array.from(ticks).map(v => v.toString())];
      }
      tickFactor = decNum - 2;
      decNum = 2;
      return [tickFactor, Array.from(ticks).map(v => (v / Math.pow(10, tickFactor)).toString())];
   }
}


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

   const px = axes.transform(checkCoords(x, 'val2p'), tX.coords);
   const py = axes.transform(checkCoords(y, 'val2p'), tY.coords);

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

   // if step is smaller than 1 round values to remove small decimals accidentially added by JS
   if (Math.abs(tickSpacing) < 1) {
      const decNum = Math.round(-Math.log10(tickSpacing));
      const r = Math.pow(10, 1 + Math.round(-Math.log10(tickSpacing)));
      ticks = ticks.apply(v => (Math.round((v + Number.EPSILON) * r) / r));
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


   /*************************************************************/
   /* Functions needed to adjust DPI of resulting PNG image     */
   /* taken from: https://github.com/shutterstock/changeDPI     */
   /* and modified                                              */
   /*************************************************************/

   /**
    * Create table for PNG CRC calculation
    */
   function createPngDataTable() {
      const crcTable = new Int32Array(256);
      for (let n = 0; n < 256; n++) {
         let c = n;
         for (let k = 0; k < 8; k++) {
            c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
         }
         crcTable[n] = c;
      }
      return crcTable;
   }

   /**
    * Calculate CRC for PNG image
    * @param buf image data
    */
   function calcCrc(buf) {
      let c = -1;
      let pngDataTable = createPngDataTable();
      for (let n = 0; n < buf.length; n++) {
         c = pngDataTable[(c ^ buf[n]) & 0xFF] ^ (c >>> 8);
      }
      return c ^ -1;
   }

   /**
    * Change DPI of PNG image
    * @param dataArray image data
    * @param dpi new DPI
    */
   function changeDpiOnArray(dataArray, dpi) {

      const physChunk = new Uint8Array(13);
      // chunk header pHYs
      // 9 bytes of data
      // 4 bytes of crc
      // this multiplication is because the standard is dpi per meter.
      dpi *= 39.3701;
      physChunk[0] = 'p'.charCodeAt(0);
      physChunk[1] = 'H'.charCodeAt(0);
      physChunk[2] = 'Y'.charCodeAt(0);
      physChunk[3] = 's'.charCodeAt(0);
      physChunk[4] = dpi >>> 24; // dpiX byte 3
      physChunk[5] = dpi >>> 16; // dpiX byte 2
      physChunk[6] = dpi >>> 8;  // dpiX byte 1
      physChunk[7] = dpi & 0xff; // dpiX byte 0
      physChunk[8] = physChunk[4];  // dpiY byte 3
      physChunk[9] = physChunk[5];  // dpiY byte 2
      physChunk[10] = physChunk[6]; // dpiY byte 1
      physChunk[11] = physChunk[7]; // dpiY byte 0
      physChunk[12] = 1; // dot per meter....

      // compute and add CRC for physChunk
      const crc = calcCrc(physChunk);
      const crcChunk = new Uint8Array(4);
      crcChunk[0] = crc >>> 24;
      crcChunk[1] = crc >>> 16;
      crcChunk[2] = crc >>> 8;
      crcChunk[3] = crc & 0xff;

      // chunk structur 4 bytes for length is 9
      const chunkLength = new Uint8Array(4);
      chunkLength[0] = 0;
      chunkLength[1] = 0;
      chunkLength[2] = 0;
      chunkLength[3] = 9;

      const finalHeader = new Uint8Array(54);
      finalHeader.set(dataArray, 0);
      finalHeader.set(chunkLength, 33);
      finalHeader.set(physChunk, 37);
      finalHeader.set(crcChunk, 50);
      return finalHeader;
   }

   /**
    * Change DPI of PNG image
    * @param base64Image image data
    * @param dpi new DPI
    */
   function changeDPI(base64Image, dpi) {

      const dataSplitted = base64Image.split(',');
      const format = dataSplitted[0];
      const body = dataSplitted[1];

      // here we assume there is pHYS chunk in the header
      const headerLength = 33 / 3 * 4;

      const stringHeader = body.substring(0, headerLength);
      const restOfData = body.substring(headerLength);
      const headerBytes = atob(stringHeader);
      const dataArray = new Uint8Array(headerBytes.length);
      for (let i = 0; i < dataArray.length; i++) {
         dataArray[i] = headerBytes.charCodeAt(i);
      }
      const finalArray = changeDpiOnArray(dataArray, dpi, 'image/png');
      const base64Header = btoa(String.fromCharCode(...finalArray));
      return [format, ',', base64Header, restOfData].join('');
   }


/**
 * Downloads plot (or any other SVG image) as a PNG file.
 *
 * @param {SVGElement} svg - root SVG element of a plot
 * @param {string} fileName - filename to save with (without extension)
 * @param {number} width - desired image width in cm
 * @param {number} height - desired image height in cm
 * @param {number} res - resolution (pixels per inch)
 *
 */
export function downloadPNG (svg, fileName, width, height, res) {

   if (!width) {
      width = 10;
   }

   if (!height) {
      height = 10;
   }

   if (!res) {
      res = 300;
   }

   if (width < 1 || width > 30) {
      throw Error('Parameter "width" must be between 1 and 30 (cm).');
   }

   if (height < 1 || height > 30) {
      throw Error('Parameter "height" must be between 1 and 30 (cm).');
   }

   if (res < 50 || res > 1200) {
      throw Error('Parameter "res" must be between 50 and 1200 (ppi).');
   }

   if (!svg || !(svg instanceof SVGElement)) {
      throw Error('Parameter "svg" is not an instance of SVGElement.');
   }

   if (!fileName || fileName.trim() === '') {
      fileName = 'plot';
   }

   // recalculate width and height to pixels
   width = width / 2.54 * res;
   height = height / 2.54 * res;

   setTimeout(() => {

      // compute canvas size based on SVG size and desired PNG WIDTH in pixels
      const svgHeight = svg.clientHeight;
      const svgWidth = svg.clientWidth;
      const scaleFactor = Math.max(width / svgWidth, height / svgHeight);

      // create a new canvas element
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // set the canvas size to match the SVG element
      canvas.width =  svgWidth * scaleFactor;
      canvas.height = svgHeight * scaleFactor;

      svg.setAttribute('width', canvas.width);
      svg.setAttribute('height', canvas.height);

      // draw a white background
      context.fillStyle = 'white';
      context.scale(scaleFactor, scaleFactor)
      context.fillRect(0, 0, canvas.width, canvas.height);

      // draw the SVG onto the canvas
      const svgXml = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const img = new Image();

      img.onload = function () {

         // draw the image
         context.drawImage(img, 0, 0, canvas.width, canvas.height);

         // create a data URL for the canvas and adjust its DPI
         const dataURL = canvas.toDataURL('image/png');
         const dataURL2 = changeDPI(dataURL, res);

         // create a temporary link and trigger the download
         const downloadLink = document.createElement('a');
         downloadLink.href = dataURL2;
         downloadLink.download = `${fileName}.png`;
         downloadLink.click();
      };

      // set the image source
      img.src = url;
   }, 20);
}


/**
 * Downloads plot (or any other SVG image) as an SVG file.
 *
 * @param {SVGElement} svg - root SVG element of a plot
 * @param {string} fileName - filename to save with (without extension)
 */
export function downloadSVG(svg, fileName) {

   if (!svg || !(svg instanceof SVGElement)) {
      throw Error('Variable "svg" is not an instance of SVGElement.');
   }

   if (!fileName || fileName.trim() === "") {
      fileName = "plot";
   }

   const svgHeight = svg.clientHeight;
   const svgWidth = svg.clientWidth;
   svg.setAttribute('width', svgWidth + 'px');
   svg.setAttribute('height', svgHeight + 'px');
   svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

   const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
   const url = window.URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.setAttribute('href', url)
   a.setAttribute('download', `${fileName}.svg`);
   a.click()
}

