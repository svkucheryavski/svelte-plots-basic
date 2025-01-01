import { cbind, vector, isvector, Vector, matrix } from 'mdatools/arrays';
import { min, max, diff } from 'mdatools/stat';
import { TICK_NUM, XTICK_NUM, YTICK_NUM, TICK_SIZE, COLMAP_WIDTH_RATIO, COLMAP_EL_HEIGHTS_PX, COLMAP_TOP_MARGIN } from './constants';


/**
 * Creates array with sequence of values from 1 to n
 * @param {number} n - length of array.
 * @returns {Array}
 */
export function seq(n) {
   let x = Array(n);
   for (let i = 0; i < n; i++) {
      x[i] = i + 1;
   }
   return x;
}


/**
 * Check of array has correct type, does not contaim undefined or NaN values and has proper length.
 * @param {Array} arr - array to check.
 * @param {number} len - expected length.
 * @returns {boolean} check result.
 */
export function checkArray(arr, len) {
   return Array.isArray(arr) &&
            arr.length === len &&
            !arr.some(v => v === undefined) &&
            !arr.some(v => isNaN(v));
}


/**
 * Generic function to transform x or y-values from plot coordinates to screen (SVG) coordinates.
 *
 * @param {Array|Vector} v - vector with coordinates (or objects size) in original plot coordinates.
 * @param {Object} tA - array with scaling and translation factors.
 *
 * @returns {Vector} vector with rescaled values
 *
 */
export function transform(v, tA) {
   if (v === undefined || v === null) return undefined;
   if (Array.isArray(v)) v = vector(v);
   if (!isvector(v) || v.length < 1) return undefined;
   return v.apply(a => roundCoords((a - tA[1]) * tA[0] + tA[2])).v;
}


// shortcut for transformation of coordinates
export function transformCoords(v, t) {
   return transform(v, t.coords);
}

// shortcut for transformation of objects
export function transformObjects(v, t) {
   return transform(v, t.objects);
}

/**
 * Generic function to transform x or y-values from screen (SVG) coordinates to plot coordinates.
 *
 * @param {Array|Vector} v - vector with coordinates (or objects size) in screen (SVG) coordinates.
 * @param {Object} tA - array with scaling and translation factors.
 *
 * @returns {Vector} vector plot coordinates.
 *
 */
export function invTransform(v, tA) {
   if (v === undefined || v === null) return undefined;
   if (Array.isArray(v)) v = vector(v);
   if (!isvector(v) || v.length < 1) return undefined;
   return v.apply(a => (a - tA[2]) / tA[0] + tA[1]).v;
}

// shortcut for inverse transformation of coordinates
export function invTransformCoords(v, t) {
   return invTransform(v, t.coords);
}

// shortcut for inverse transformation of objects
export function invTransformObjects(v, t) {
   return invTransform(v, t.objects);
}


/**
 * Creates label for a tick factor.
 *
 * @param {Number} tf - tick factor value (negative or positive)
 * @returns
 */
export function getTickFactorLabel(tf) {
   if (tf === 0) return '';
   return `<tspan>&times;10</tspan><tspan baseline-shift="super">${(tf).toString()}</tspan>`;
}


/**
 * Trim number leaving only significant decimals.
 * @param {number} num
 * @returns trimmed number
 */
export function trimNum(num) {

   // check if number is whole — return as is
   if (num === Math.round(num)) return num;

   // if it is very large remove the decimals
   if (Math.abs(num) > 10**6) return Math.round(num);

   // if it is very small return as is
   if (Math.abs(num) < 10**(-6)) return num;

   // Convert to string with precision to maintain significant digits
   let str = num.toPrecision(10);

   // Remove trailing zeros
   str = str.replace(/\.?0+$/, '');

   // Convert back to number
   return parseFloat(str);
}


/**
 * Generate vector with axis tick labels and tick factor based on numeric tick values.
 *
 * @param {Vector} ticks - vector with numeric tick values.
 *
 * @returns {Array} an array with tick factor and array with tick labels.
 */
export function getTickLabels(ticks) {

   if (ticks === undefined) return undefined;
   if (ticks.length === 1) return [0, [ticks[0].toString()]];

   // compute and correct step between ticks
   let step = trimNum(Math.abs(min(diff(ticks))));
   let tickFactor = 0;

   // step is large (over 1)
   if (step >= 1 && ticks.length > 1) {
      if (step < 100) return [0, Array.from(ticks).map(v => v.toFixed(0))];
      let digNum = Math.ceil(trimNum(Math.log10(step)));
      tickFactor = digNum - 2;
      return [tickFactor, Array.from(ticks).map(v => (v / Math.pow(10, tickFactor)).toFixed(0))];
   }

   let decNum = Math.ceil(-trimNum(Math.log10(step)));
   if (decNum <= 2) {
      return [0, Array.from(ticks).map(v => v.toFixed(decNum))];
   }
   tickFactor = decNum - 2;
   decNum = 2;

   if (trimNum(Math.abs(max(ticks))) <= 10) {
      return [-tickFactor, Array.from(ticks).map(v => (v * Math.pow(10, tickFactor)).toFixed(decNum))];
   } else {
      return [-tickFactor, Array.from(ticks).map(v => (v / Math.pow(10, tickFactor)).toString())];
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
export function checkCoords(x, source, len) {

   if (Array.isArray(x)) {
      x = vector(x);
   }

   if (!isvector(x)) {
      console.error(source + ': coordinates must be provided as array or instance of Vector class.');
      return null;
   }

   if (x.length < 1) {
      console.error(source + ': vector with coordinates is empty.');
      return null;
   }

   if (len && x.length !== len) {
      console.error(source + ': vector does not have the expected length of ' + len + '.');
      return null;
   }

   return x;
}


/**
 * Create string with coordinates of SVG polygon.
 *
 * @param {Vector} x - vector with x-coordinates of polygon points.
 * @param {Vector} y - vector with y-coordinates of polygon points.
 * @param {Array} tX - transformation parameters for x-coordinates (from 'Axes').
 * @param {Array} tY - transformation parameters for y-coordinates (from 'Axes').
 * @param {Object} axes - JSON with Axes context.
 *
 * @returns {string} string with coordinates.
 *
 */
export function val2p(x, y, tX, tY) {

   if (!x || !y || x.length !== y.length) {
      console.error('val2p: provided coordinate values are not correct.');
      return null;
   }

   const tXc = tX.coords;
   const tYc = tY.coords;
   let p = '';
   for (let i = 0; i < x.length; i++) {
      const px = roundCoords((x.v[i] - tXc[1]) * tXc[0] + tXc[2]);
      const py = roundCoords((y.v[i] - tYc[1]) * tYc[0] + tYc[2]);
      p += px + ',' + py + ' ';
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
 * @param {boolean} whole - should the ticks be a whole number.
 * @param {Number} deltaFactor - percent of range to use as internal margins
 *
 * @returns {Array} an array with computed tick positions.
 *
 */
export function getAxisTicks(ticks, lim, maxTickNum, round, whole, deltaFactor) {

   if (round === undefined || round === null) {
      round = true;
   }

   if (whole === undefined || whole === null) {
      whole = false;
   }

   if (deltaFactor === undefined) {
      deltaFactor = 0.0001;
   }

   // if ticks are already provided do not recompute them
   if (ticks) {
      if (Array.isArray(ticks)) {
         ticks = vector(ticks);
      }

      if (!isvector(ticks)) {
         console.error('getAxisTicks: axis ticks must be provided as an array or as a vector.');
         return null;
      }

      return ticks.filter(x => x >= lim[0] & x <= lim[1]);
   }

   // check if limits are ok
   if (typeof(lim) !== "object" || lim[0] === undefined || lim[1] === undefined) {
      console.error('getAxisTicks: provided values for axis limits are not valid.');
      return undefined;
   }

   // get range as a nice number and compute min, max and steps for the tick sequence
   const delta = Math.abs((lim[1] - lim[0])) * deltaFactor;
   const localRange = lim[1] - lim[0] - 2 * delta;
   const exponent = Math.floor(Math.log10(localRange));
   const fraction =  1 / Math.pow(10, exponent - 1);
   const range = Math.round(localRange * fraction) / fraction;

   let tickSpacing = niceNum(range / maxTickNum, false);
   if (whole) {
      if (tickSpacing < 1) tickSpacing = 1;
      tickSpacing = Math.round(tickSpacing);
   }

   // compute smallest and largest tick rounded to tickSpacing
   let tickMin = Math.ceil((lim[0] + delta ) / tickSpacing) * tickSpacing;
   let tickMax = Math.floor((lim[1] - delta) / tickSpacing) * tickSpacing;

   // adjust largest tick if it is too close to axis limit and tick spacing
   if (Math.abs((lim[0] - tickMin)) < (tickSpacing / 10)) tickMin = tickMin + tickSpacing;
   if (Math.abs((lim[1] - tickMax)) < (tickSpacing / 10)) tickMax = tickMax - tickSpacing;


   // recompute maxTickNum
   maxTickNum = (Math.ceil(trimNum((tickMax - tickMin) / tickSpacing)) + 1);

   // create a sequence of ticks
   ticks = Vector.zeros(maxTickNum);
   for (let i = 0; i < maxTickNum; i++) {
      ticks.v[i] = tickMin + tickSpacing * i;
   }

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
export function niceNum(localRange,  round) {

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
   if (height < 300.2 || width < 400.2) return "small";
   if (height < 400.2 || width < 700.2) return "medium";
   if (height < 650.2 || width < 850.2) return "large";
   return "xlarge";
}


/**
 * Computes a scale level for single axis.
 *
 * @param {numeric} size - width or height of plotting area in pixels.
 * @returns {text} the scale level ("small", "medium" or "large").
 *
 */
export function getAxisScale(width, size) {
   if (width < 400.2) return "small";
   if (width < 700.2) return "medium";
   if (width < 900.2) return "large";
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
      console.error('Parameter "width" must be between 1 and 30 (cm).');
      return null;
   }

   if (height < 1 || height > 30) {
      console.error('Parameter "height" must be between 1 and 30 (cm).');
      return null;
   }

   if (res < 50 || res > 1200) {
      console.error('Parameter "res" must be between 50 and 1200 (ppi).');
      return null;
   }

   if (!svg || !(svg instanceof SVGElement)) {
      console.error('Parameter "svg" is not an instance of SVGElement.');
      return null;
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

   // set corresponding attributes for SVG element
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
      console.error('Variable "svg" is not an instance of SVGElement.');
      return null;
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

/**
 * Copies plot to clipboard as PNG image.
 * @param {HTMLElement} btn - button element used to activate the copy event.
 * @param {SVGAElement} svg - root SVG element of a plot.
 * @param {number} width - width of the plot image to copy.
 * @param {number} height - height of the plot image to copy.
 */
export function copyToClipboard(btn, svg, width, height) {

   // save button conent
   const content = btn.textContent;

   navigator.clipboard.write([
      new ClipboardItem({ 'image/png': createPngBlob(svg, width, height) })
   ])
   .then(
      () => {
         // add class "copied" for visual confirmation
         btn.classList.add('copied');
         btn.textContent = '✓ done';

         // Remove the class after 0.5 seconds and revert the text
         setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = content;
         }, 500);
      },
      (e) => {
         console.error(e)

         // add class "error" for visual confirmation
         btn.classList.add('error');
         btn.textContent = 'x copy';

         // Remove the class after 0.5 seconds and revert the text
         setTimeout(() => {
            btn.classList.remove('error');
            btn.textContent = content;
         }, 500);
      }
   )
   .catch((error) => console.error(error));

}


/**
 * Returns plot BLOB to copy it to clipboard.
 *
 * @param {SVGElement} svg - root SVG element of a plot
 * @param {number} width - desired image width in pixels
 * @param {number} height - desired image height in pixels
 *
 */
export async function createPngBlob(svg, width, height) {

   // compute canvas size based on SVG size and scaling factor
   // based on desired size in pixels
   const svgHeight = svg.clientHeight;
   const svgWidth = svg.clientWidth;
   const scaleFactor = Math.max(width / svgWidth, height / svgHeight);

   // create a new canvas element and 2D context for it
   const canvas = document.createElement('canvas');
   const context = canvas.getContext('2d');

   // set the canvas size to match the size of SVG element
   canvas.width =  svgWidth * scaleFactor;
   canvas.height = svgHeight * scaleFactor;

   // scale the context
   context.scale(scaleFactor, scaleFactor)

   // set corresponding attributes for SVG element
   svg.setAttribute('width', canvas.width);
   svg.setAttribute('height', canvas.height);

   // create promise
   const promise = new Promise((resolve, reject) => {

      // serialzie SVG, create blob and URL for it
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svgBlob);

      // create image an image and add callback
      const img = new Image();
      img.onload = function () {

         // draw the image
         context.drawImage(img, 0, 0, canvas.width, canvas.height);
         DOMURL.revokeObjectURL(url);

         // convert canvas to blob
         canvas.toBlob(function (blob) {
            if (blob) {
               resolve(blob);
            } else {
               reject(new Error('Failed to create blob'));
            }
         }, 'image/png');
      };

      // add error callback
      img.onerror = function (err) {
         reject(err);
      };

      // assign value to run the onload callback
      img.src = url;
   });

   // resolve promise and return the result
   return (await promise);
}


/**
 * Returns an array with 'n' colors.
 *
 * @param {number} n - number of colors to return.
 * @param {string} alpha - string with hex number from 00 to FF defining alpha parameter for color.
 *
 * @returns {Array} array with colors as strings (hexadecimal).
 *
 */
export function getcolmap(n, alpha) {
   if (n > 16) n = 16;
   const colmap = [
      ["#2679B2"],
      ["#2679B2", "#D22C2F"],
      ["#2679B2", "#92B42A", "#D22C2F"],
      ["#2679B2", "#2E9658", "#F2B825", "#D22C2F"],
      ["#2679B2", "#22988A", "#92B42A", "#F79426", "#D22C2F"],
      ["#2679B2", "#1C9AA8", "#379531", "#EED524", "#FB7F28", "#D22C2F"],
      ["#2679B2", "#1D94A9", "#2E9658", "#92B42A", "#F2B825", "#F47129", "#D22C2F"],
      ["#2679B2", "#1E90AA", "#279775", "#519E2F", "#D3CB25", "#F5A326", "#EF672A", "#D22C2F"],
      ["#2679B2", "#1F8DAB", "#22988A", "#33953F", "#92B42A", "#EFCA24", "#F79426", "#EB5F2A", "#D22C2F"],
      ["#2679B2", "#208BAC", "#1E999A", "#2E9658", "#5FA32E", "#C5C626", "#F2B825", "#F98827", "#E85A2B", "#D22C2F"],
      ["#2679B2", "#2089AD", "#1C9AA8", "#29976C", "#379531", "#92B42A", "#EED524", "#F4AA26", "#FB7F28", "#E6552B", "#D22C2F"],
      ["#2679B2", "#2188AD", "#1C97A8", "#25987C", "#329546", "#68A62D", "#BCC327", "#F0C524", "#F69E26", "#F77728", "#E4512B", "#D22C2F"],
      ["#2679B2", "#2186AD", "#1D94A9", "#22988A", "#2E9658", "#469A2F", "#92B42A", "#DECF25", "#F2B825", "#F79426", "#F47129", "#E34E2C", "#D22C2F"],
      ["#2679B2", "#2285AE", "#1E92AA", "#209995", "#2A9767", "#34953A", "#6FA82D", "#B5C128", "#EFCE24", "#F3AD25", "#F98C27", "#F16B29", "#E14B2C", "#D22C2F"],
      ["#2679B2", "#2284AE", "#1E90AA", "#1D999F", "#279775", "#31964A", "#519E2F", "#92B42A", "#D3CB25", "#F0C224", "#F5A326", "#FA8527", "#EF672A", "#E0492C", "#D22C2F"],
      ["#2679B2", "#2283AE", "#1F8FAB", "#1C9AA8", "#249880", "#2E9658", "#379531", "#73AA2C", "#B0BF28", "#EDD424", "#F2B825", "#F69B26", "#FB7F28", "#ED632A", "#DF472C", "#D22C2F"]
   ]

   return alpha ? colmap[n - 1].map(v => v + alpha) : colmap[n - 1];
}


/**
 * Computes coordinates and other parameters of main elements of x-axis
 *
 * @param {Array} limX - limits for x-axis.
 * @param {Array} limY - limits for y-axis.
 * @param {Array} scales - array of scale names (plot, x, y).
 * @param {Array} tY - transposition matrix for y-coordinates.
 * @param {Object} axis - JSON with x-axis parameters provided by user.
 *
 * @returns {Object} - JSON with coordinate of axis line, ticks, tick labels and factor.
 */
export function getXAxisParams(limX, limY, scales, tY, axis) {

   let ticks = axis.ticks;
   let tickLabels = axis.tickLabels;
   let tickFactor = 0;

   // compute x-coordinates of the ticks or take the ones manually specified by user
   const ticksX = getAxisTicks(ticks, limX, XTICK_NUM[scales.x], true, axis.whole);
   const tickNum = ticksX.length;

   // compute tick y-coordinates (up and bottom)
   const dY = invTransformObjects([TICK_SIZE[scales.plot]], tY)[0];
   const ticksY1 = Vector.fill(limY[0], tickNum);
   const ticksY2 = ticksY1.add(dY);

   // compute coordinates for the ends of grid
   const gridYEnd = Vector.fill(limY[1], tickNum);

   // tick labels and tick factor
   if (!ticks || !tickLabels) {
      [tickFactor, tickLabels] = getTickLabels(ticksX.v);
   }

   if (tickLabels.length !== ticksX.length) {
      console.error('XAxis: "tickLabels" must be a array of the same size as ticks.');
      return null;
   }

   // combine all coordinates together
   const grid = [
      [ticksX, ticksY1],
      [ticksX, gridYEnd]
   ];

   const axisLine = [
      [vector([limX[0]]), vector([limY[0]])],
      [vector([limX[1]]), vector([limY[0]])]
   ]

   const tickCoords = [
      [ticksX, ticksY2],
      [ticksX, ticksY1]
   ];

   const dX = (limX[1] - limX[0]) * 0.01;
   const tfCoords = [
      [null, null],
      [[limX[1] - (tickFactor > 9 ? 1 : 0) * dX], [ticksY1.v[tickNum - 1]]],
   ];

   const tfLabel = getTickFactorLabel(tickFactor);

   // hide last label if it is too close to tick factor
   const dtl = Math.abs(limX[1] - ticksX.v[ticksX.length - 1]);
   const dl = limX[1] - limX[0];
   const dt = Math.abs(ticksX.v[1] - ticksX.v[0]);
   if (tfLabel.length > 0 && dtl < dl * 0.10 && dtl < dt * 0.5) {
      tickLabels[tickLabels.length - 1] = ' ';
   }

   return {grid, axisLine, tickCoords, tfCoords, ticks, tickLabels, tickFactor, tfLabel};
}


/**
 * Computes coordinates and other parameters of main elements of y-axis
 *
 * @param {Array} limX - limits for x-axis.
 * @param {Array} limY - limits for y-axis.
 * @param {Array} scales - array of scale names (plot, x, y).
 * @param {Array} tX - transposition matrix for x-coordinates.
 * @param {Object} axis - JSON with x-axis parameters provided by user.
 *
 * @returns {Object} - JSON with coordinate of axis line, ticks, tick labels and factor.
 */
export function getYAxisParams(limX, limY, scales, tX, axis) {

   let ticks = axis.ticks;
   let tickLabels = axis.tickLabels;
   let tickFactor = 0;

   // compute x-coordinates of the ticks or take the ones manually specified by user
   const ticksY = getAxisTicks(axis.ticks, limY, YTICK_NUM[scales.y], true, axis.whole);
   const tickNum = ticksY.length;

   // compute tick y-coordinates (up and bottom)
   const dX = invTransformObjects([TICK_SIZE[scales.plot]], tX)[0];
   const ticksX1 = Vector.fill(limX[0], tickNum)
   const ticksX2 = ticksX1.add(dX)

   // coordinates for the ends of grid
   const gridXEnd = Vector.fill(limX[1], tickNum);

   // tick labels and tick factor
   if (!ticks || !tickLabels) {
      [tickFactor, tickLabels] = getTickLabels(ticksY.v)
   }

   if (tickLabels.length !== ticksY.length) {
      console.error('YAxis: "tickLabels" must be a array of the same size as ticks.');
      return null;
   }

   // combine all coordinates together
   const grid = [
      [ticksX1, ticksY],
      [gridXEnd, ticksY]
   ];

   const axisLine = [
      [vector([limX[0]]), vector([limY[0]])],
      [vector([limX[0]]), vector([limY[1]])]
   ]

   const tickCoords = [
      [ticksX1, ticksY],
      [ticksX2, ticksY]
   ];

   const tfCoords = [
      [[], []],
      [[ticksX2.v[tickNum - 1] + (Math.abs(tickFactor) > 9 ? 3 : 2) * dX], [limY[1]]],
   ];

   const tfLabel = getTickFactorLabel(tickFactor);

   // hide last label if it is too close to tick factor
   if (tfLabel.length > 0 && (limY[1] - ticksY.v[ticksY.length - 1]) < ((limY[1] - limY[0]) * 0.05)) {
      tickLabels[tickLabels.length - 1] = ' ';
   }

   return {grid, axisLine, tickCoords, tfCoords, ticks, tickLabels, tickFactor, tfLabel};
}


/**
 * Performs sanity check of user defined parameters for colormap legend defines a couple of extra parameters.
 *
 * @param {Object} cml - JSON with user defined parameters from `ColormapLegend` component
 *
 * @returns {Object} objects with full set of parameters.
 */
export function getColormapLegendParams(cml) {

   if (!cml.breaks) {
      console.error('ColormapLegend: breaks values must be provided.')
      return null;
   }

   const breaks = isvector(cml.breaks) ? cml.breaks.v : cml.breaks;

   if (breaks.length < 2) {
      console.error('ColormapLegend: incorrect breaks values.')
      return null;
   };

   if (!cml.colmap) {
      console.error('ColormapLegend: values for "colmap" parameter must be provided.');
      return null;
   }

   if (!Array.isArray(cml.colmap)) {
      console.error('ColormapLegend: parameter "colmap" must be array with colors.');
      return null;
   }

   if (cml.colmap.length !== breaks.length - 1) {
      console.error('ColormapLegend: number of color values in "colmap" does not match number of intervals defined by breaks.');
      return null;
   }

   const colmap = cml.colmap;

   let labels, labelsFactor;
   if (!cml.labels) {
      [labelsFactor, labels] = getTickLabels(breaks);
   } else {
      labels = cml.labels;
      labelsFactor = 0;
   }

   if (!(labels.length === (breaks.length - 1) || labels.length === breaks.length)) {
      console.error('ColormapLegend: number of values in "labels" should be equal to or by one less than number of values in "breaks".');
      return null;
   }

   const isCentered = labels.length === colmap.length;
   return {colmap, breaks, labels, isCentered, labelsFactor, fontSize: cml.fontSize, labelColor: cml.labelColor};
}


/**
 * Computes screen coordinates of colormap legend elements.
 *
 * @param {Object} cmlParams - JSON with colormap legend parameters from `getgColormapLegendParams`.
 * @param {number} axesWidth - width of axes in pixels.
 * @param {Array} pxMargins - array with axes margins in pixels.
 * @param {Object} scales - JSON with scales.
 *
 * @returns {Object} JSOn with coordinates.
 */
export function getColormapLegendCoords(cmlParams, axesWidth, pxMargins, scales) {

   const n = cmlParams.colmap.length;
   const colmapWidth = axesWidth * COLMAP_WIDTH_RATIO;

   // compute elements size and position
   const width = colmapWidth / n;
   const start = pxMargins[1] + (axesWidth - colmapWidth) * 0.5;
   const height = COLMAP_EL_HEIGHTS_PX[scales.y]
   const top = pxMargins[2] + height * COLMAP_TOP_MARGIN;
   const ltop = top + height * (1 + COLMAP_TOP_MARGIN)
   const dxl = cmlParams.isCentered ? width / 2 : 0

   return {start, top, height, width, dxl, ltop};
}


/**
 * Mouse click handler for plot elements.
 * @param {Object} e - event object.
 * @param {string} tagName - name of the tag the click is expected from.
 * @param {function} onclickCallback - callback function to run when click event happened.
 */
export function handleClick(e, tagName, onclickCallback) {
   if (!e || !tagName || !onclickCallback || typeof onclickCallback !== 'function') return;
   const el = e.target;
   if (el.tagName === tagName) {
      const id = Array.prototype.indexOf.call(el.parentNode.children, el);
      if (id < 0) return;
      onclickCallback(id);
      e.stopPropagation();
   }
}


/**
 * Computes width of text element for given font.
 *
 * @param {string} text - string with text
 * @param {string} font - font name and size, e.g. '12px Arial'
 *
 * @return {number} size of element in pixels
 */
export function getTextWidth(text, font) {
   const element = document.createElement('canvas');
   const context = element.getContext('2d');
   context.font = font;
   return context.measureText(text.replace(/<(.|\n)*?>/g, '')).width;
}


/**
 * Compute size of main legend elements.
 *
 * @param {Array} items - array of legend items and their properties.
 * @param {number} fontSize - font size of a legend element in pixels.
 * @param {string} position - position of the legend.
 *
 * @return {Array} array with height and width of graphical part of legend item, padding size,
 * height and width of text labels (all in pixels).
 */
function getLegendSize(items, fontSize)  {

   // TODO: implement dynamic font family
   const fontName = 'Arial';

   // compute size of graphical elements
   const elp = fontSize / 8;    // top and bottom padding
   const elw = fontSize * 1.5;  // width of legend element without label and padding

   // compute size of text label elements
   // TODO: implement one row legend if position is "top" or "bottom"
   const elh = Array(items.length);
   const ely = Array(items.length);
   let y = 0;
   let lgh = 0;
   let lbw = 0;

   for (let i = 0; i < items.length; i++) {
      const w = getTextWidth('  ' + items[i].label + '  ', fontSize + 'px ' + fontName);
      lbw = w > lbw ? w : lbw;
      const h = fontSize * items[i].labelHeight + 2 * elp;
      elh[i] = h;
      ely[i] = y;
      y = y + h;
      lgh = lgh + h;
   }

   const lgw = (elw + 2 * elp + lbw);
   return [ely, elh, elw, elp, lgh, lgw];
}


/**
 * Computes screen coordinates and sizes of legend and its elements.
 * @param {Object} params - object with legend params (items array and position name).
 * @param {number} fontSize - font size in puxels.
 * @param {Array} cpx - screen coordinates of axes corners along x.
 * @param {Array} cpy - screen coordinates of axes corners along y.
 * @param {number} ts - ticks size in pixels.
 */
export function getGroupLegendCoords(params, cpx, cpy, fontSize, ts) {

   // compute size of legend elements
   const [ely, elh, elw, elp, lgh, lgw] = getLegendSize(params.items, fontSize * params.fontSize);

   // compute coordinates of top left corner of the legend box
   const lgl = params.position.includes("left") ? cpx[0] + ts :
         params.position.includes("right") ? cpx[1] - lgw - ts :
         (cpx[1] + cpx[0] - lgw) * 0.5;

   const lgt = params.position.includes("top") ? cpy[1] + ts :
         params.position.includes("bottom") ? cpy[0] - lgh - ts :
         (cpy[1] + cpy[0] - lgh) * 0.5;


   return {lgl, lgt, lgw, lgh, ely, elh, elw, elp};
}


/**
 * Converts text with super and subscripts to SVG text.
 * @param {string} text
 * @returns {string} converted text.
 */
export function text2svg(text) {

   if (!text || text.length < 1) return text;

   function toSuper(txt) {
      return '<tspan dy="-0.5em" font-size="0.8em">' + txt + '</tspan><tspan dy="0.4em"> </tspan>';
   }

   function toSub(txt) {
      return '<tspan dy="0.5em" font-size="0.8em">' + txt + '</tspan><tspan dy="-0.4em"> </tspan>';
   }

   let i = 0;
   const dy = 0.5;
   const fs = 0.8;
   let svgText = '';
   while (i < text.length) {

      const char = text[i];
      if (char === '^' || char === '_') {

         const isSuperscript = char === '^';
         i++;

         if (text[i] === '(') {
            // multiscript, everything betwee ( and ) should be taken
            let j = i + 1;
            while (j < text.length && text[j] !== ')') j++;
            const scriptContent = text.slice(i + 1, j);
            svgText += isSuperscript ? toSuper(scriptContent) : toSub(scriptContent);
            i = j + 1; // Move past the closing '}'
         } else if (text[i] === '-' || text[i] === '–') {
            // negative script, take the sign and next element
            const scriptContent = text.slice(i, i + 2);
            svgText += isSuperscript ? toSuper(scriptContent) : toSub(scriptContent);
            i = i + 2;
         } else {
            svgText += isSuperscript ? toSuper(text[i]) : toSub(text[i]);
            i++;
         }
      } else {
         svgText += char;
         i++;
      }
   }

   return svgText;
}


/**
 * Transforms 3D world coordinates to 2D scene pixels by applying the transformation matrix 'tM'.
 *
 * @param {Matrix} coords - matrix with coordinates [X, Y, Z]
 * @param {Matrix} tM - transformation matrix
 *
 * @returns {Array} array with transformed coordinates as two vectors [x, y].
 *
 */
export function transform3D(coords, tM) {
   const coords2D = cbind(coords, Vector.ones(coords.nrows)).dot(tM);
   return {x: coords2D.getcolref(1).map(v => roundCoords(v)), y: coords2D.getcolref(2).map(v => roundCoords(v))};
}


/**
 * Compute coordinates of "latent" ticks by replicating lim[0] value and adding shifts.
 * @param {Array} lim - array with axis limits.
 * @param {number} tickNum - number of ticks to generate.
 * @returns
 */
function getLatentTicks(lim, tickNum) {
   const dl = (lim[1] - lim[0]) / 100; // 1% of axis size
   const ticks  = Vector.fill(lim[0], tickNum);
   const ticks1 = ticks.subtract(dl * 1.5);
   const ticks2 = ticks.add(dl * 1.5);
   const ticks3 = ticks.subtract(dl * 5);

   return [ticks, ticks1, ticks2, ticks3];
}


/**
 * Computes coordinates of all elements (lines, labels, etc) for x-axis ticks.
 * @param {Object} xaxis - JSON with x-axis paramaters.
 * @param {Array} limX - array with x-axis limits.
 * @param {Array} limY - array with y-axis limits.
 * @param {Array} limZ - array with z-axis limits.
 * @param {string} scale - current scale value.
 * @returns {Object} JSON with coordinates.
 */
export function getXAxisCoords3D(xaxis, limX, limY, limZ, scale) {

   const dX = (limX[1] - limX[0]) / 100; // 1% of axis size
   const dY = (limY[1] - limY[0]) / 100; // 1% of axis size
   const dZ = (limZ[1] - limZ[0]) / 100; // 1% of axis size
   const ticksX = getAxisTicks(xaxis.ticks, limX, TICK_NUM[scale], true);
   const tickNum = ticksX.length;

   const [ticksY, ticksY1, ticksY2, ticksY3] = getLatentTicks(limY, tickNum);
   const [ticksZ, ticksZ1, ticksZ2, ticksZ3] = getLatentTicks(limZ, tickNum);

   // coordinates for the ends of grid
   const gridYEnd = Vector.fill(limY[1], tickNum);
   const gridZEnd = Vector.fill(limZ[1], tickNum);

   // tick labels
   const tickLabels = (!xaxis.ticks || !xaxis.tickLabels) ? ticksX.v : xaxis.tickLabels;
   if (tickLabels.length !== ticksX.length) {
      console.error('XAxis (3D): "tickLabels" must be a array of the same size as ticks.');
   }

   // combine all coordinates together
   const grid1 = [
      cbind(ticksX, ticksY, ticksZ),
      cbind(ticksX, gridYEnd, ticksZ)
   ];

   const grid2 = [
      cbind(ticksX, ticksY, ticksZ),
      cbind(ticksX, ticksY, gridZEnd)
   ];

   const axisLine = [
      matrix([limX[0], limY[0], limZ[0]], 1, 3),
      matrix([limX[1], limY[0], limZ[0]], 1, 3)
   ]

   const tickCoords = [
      cbind(ticksX, ticksY, ticksZ),    // middle point
      cbind(ticksX, ticksY2, ticksZ),   // middle point with positive shift along Y
      cbind(ticksX, ticksY, ticksZ2),   // middle point with positive shift along Z
      cbind(ticksX, ticksY1, ticksZ1),  // middle point with negative shift along Y and Z
      cbind(ticksX, ticksY3, ticksZ3)   // middle point with negative shift along Y and Z for ticks
   ];

   // here we do not need to make a matrix as the three values will be used as vectors
   const titleCoords = [
      [limX[1] + 3 * dX], [limY[0] - 2 * dY], [limZ[0] - 2 * dZ]
   ];

   return {grid1, grid2, axisLine, tickCoords, titleCoords, tickLabels};
}


/**
 * Computes coordinates of all elements (lines, labels, etc) for y-axis ticks.
 * @param {Object} yaxis - JSON with y-axis paramaters.
 * @param {Array} limX - array with x-axis limits.
 * @param {Array} limY - array with y-axis limits.
 * @param {Array} limZ - array with z-axis limits.
 * @param {string} scale - current scale value.
 * @returns {Object} JSON with coordinates.
 */
export function getYAxisCoords3D(yaxis, limX, limY, limZ, scale) {

   const dX = (limX[1] - limX[0]) / 100; // 1% of axis size
   const dY = (limY[1] - limY[0]) / 100; // 1% of axis size
   const dZ = (limZ[1] - limZ[0]) / 100; // 1% of axis size
   const ticksY = getAxisTicks(yaxis.ticks, limY, TICK_NUM[scale], true);
   const tickNum = ticksY.length;

   const [ticksX, ticksX1, ticksX2, ticksX3] = getLatentTicks(limX, tickNum);
   const [ticksZ, ticksZ1, ticksZ2, ticksZ3] = getLatentTicks(limZ, tickNum);

   // coordinates for the ends of grid
   const gridXEnd = Vector.fill(limX[1], tickNum);
   const gridZEnd = Vector.fill(limZ[1], tickNum);

   // tick labels
   const tickLabels = (!yaxis.ticks || !yaxis.tickLabels) ? ticksY.v : yaxis.tickLabels;
   if (tickLabels.length !== ticksY.length) {
      console.error('YAxis (3D): "tickLabels" must be a array of the same size as ticks.');
   }

   // combine all coordinates together
   const grid1 = [
      cbind(ticksX, ticksY, ticksZ),
      cbind(gridXEnd, ticksY, ticksZ)
   ];

   const grid2 = [
      cbind(ticksX, ticksY, ticksZ),
      cbind(ticksX, ticksY, gridZEnd)
   ];

   const axisLine = [
      matrix([limX[0], limY[0], limZ[0]], 1, 3),
      matrix([limX[0], limY[1], limZ[0]], 1, 3)
   ]

   const tickCoords = [
      cbind(ticksX, ticksY, ticksZ),    // middle point
      cbind(ticksX2, ticksY, ticksZ),   // middle point with positive shift along X
      cbind(ticksX, ticksY, ticksZ2),   // middle point with positive shift along Z
      cbind(ticksX1, ticksY, ticksZ1),  // middle point with negative shift along X and Z
      cbind(ticksX3, ticksY, ticksZ3)   // middle point with negative shift along X and Z for ticks
   ];

   // here we do not need to make a matrix as the three values will be used as vectors
   const titleCoords = [
      [limX[0] - 2 * dX], [limY[1] + 3 * dY], [limZ[0] - 2 * dZ]
   ];

   return {grid1, grid2, axisLine, tickCoords, titleCoords, tickLabels};
}


/**
 * Computes coordinates of all elements (lines, labels, etc) for z-axis ticks.
 * @param {Object} yaxis - JSON with z-axis paramaters.
 * @param {Array} limX - array with x-axis limits.
 * @param {Array} limY - array with y-axis limits.
 * @param {Array} limZ - array with z-axis limits.
 * @param {string} scale - current scale value.
 * @returns {Object} JSON with coordinates.
 */
export function getZAxisCoords3D(zaxis, limX, limY, limZ, scale) {

   const dX = (limX[1] - limX[0]) / 100; // 1% of axis size
   const dY = (limY[1] - limY[0]) / 100; // 1% of axis size
   const dZ = (limZ[1] - limZ[0]) / 100; // 1% of axis size
   const ticksZ = getAxisTicks(zaxis.ticks, limZ, TICK_NUM[scale], true);
   const tickNum = ticksZ.length;

   const [ticksY, ticksY1, ticksY2, ticksY3] = getLatentTicks(limY, tickNum);
   const [ticksX, ticksX1, ticksX2, ticksX3] = getLatentTicks(limX, tickNum);

   // coordinates for the ends of grid
   const gridYEnd = Vector.fill(limY[1], tickNum);
   const gridXEnd = Vector.fill(limX[1], tickNum);

   // tick labels
   const tickLabels = (!zaxis.ticks || !zaxis.tickLabels) ? ticksZ.v : zaxis.tickLabels;
   if (tickLabels.length !== ticksX.length) {
      console.error('XAxis (3D): "tickLabels" must be a array of the same size as ticks.');
   }

   // combine all coordinates together
   const grid1 = [
      cbind(ticksX, ticksY, ticksZ),
      cbind(ticksX, gridYEnd, ticksZ)
   ];

   const grid2 = [
      cbind(ticksX, ticksY, ticksZ),
      cbind(gridXEnd, ticksY, ticksZ)
   ];

   const axisLine = [
      matrix([limX[0], limY[0], limZ[0]], 1, 3),
      matrix([limX[0], limY[0], limZ[1]], 1, 3)
   ]

   const tickCoords = [
      cbind(ticksX, ticksY, ticksZ),    // middle point
      cbind(ticksX, ticksY2, ticksZ),   // middle point with positive shift along Y
      cbind(ticksX2, ticksY, ticksZ),   // middle point with positive shift along X
      cbind(ticksX1, ticksY1, ticksZ),  // middle point with negative shift along Y and X
      cbind(ticksX3, ticksY3, ticksZ)   // middle point with negative shift along Y and X for ticks
   ];

   // here we do not need to make a matrix as the three values will be used as vectors
   const titleCoords = [
      [limX[0] - 2 * dX], [limY[0] - 2 * dY], [limZ[1] + 3 * dZ]
   ];

   return {grid1, grid2, axisLine, tickCoords, titleCoords, tickLabels};
}