import test from 'node:test';
import assert from 'node:assert/strict';

import {
   checkCoords,
   copyToClipboard,
   downloadPNG,
   getAxisTicks,
   getcolmap,
   getGroupLegendCoords,
   normalizeLineType,
   text2svg
} from '../src/methods.js';


test('loads public JavaScript exports through the package export map', async () => {
   const [utils, constants] = await Promise.all([
      import('svelte-plots-basic/utils'),
      import('svelte-plots-basic/constants')
   ]);

   assert.equal(typeof utils.getcolmap, 'function');
   assert.equal(constants.Colors.PRIMARY, '#2679B2');
});


test('preserves existing palettes', () => {
   assert.deepEqual(
      getcolmap(3),
      ['#2679B2', '#92B42A', '#D22C2F']
   );
});


test('generates palettes larger than 16 colors', () => {
   const colors = getcolmap(32);

   assert.equal(colors.length, 32);
   assert.equal(colors[0], '#2679B2');
   assert.equal(colors.at(-1), '#D22C2F');
});


test('applies alpha to generated colors', () => {
   const colors = getcolmap(32);
   const transparent = getcolmap(32, '80');

   assert.deepEqual(
      transparent,
      colors.map(color => color + '80')
   );
});


test('returns independent arrays', () => {
   const first = getcolmap(3);
   first[0] = 'changed';

   assert.equal(getcolmap(3)[0], '#2679B2');
});


test('preserves plain text when no scripts are present', () => {
   assert.equal(text2svg('sin(x)'), 'sin(x)');
});


test('converts superscripts without changing the following baseline', () => {
   assert.equal(
      text2svg('x^k'),
      'x<tspan font-size="0.6em" dominant-baseline="inherit" baseline-shift="30%">k</tspan>'
   );
});


test('converts subscripts without changing the following baseline', () => {
   assert.equal(
      text2svg('x_k'),
      'x<tspan font-size="0.6em" dominant-baseline="inherit" baseline-shift="-50%">k</tspan>'
   );
});


test('converts mixed single- and multi-character scripts', () => {
   assert.equal(
      text2svg('x_k^(-1)'),
      'x<tspan font-size="0.6em" dominant-baseline="inherit" baseline-shift="-50%">k</tspan>' +
         '<tspan font-size="0.6em" dominant-baseline="inherit" baseline-shift="30%">-1</tspan>'
   );
});


test('preserves vertical legend layout when orientation is omitted', () => {
   const originalDocument = globalThis.document;
   globalThis.document = {
      createElement: () => ({
         getContext: () => ({
            font: '',
            measureText: text => ({width: text.length * 10})
         })
      })
   };

   try {
      const coords = getGroupLegendCoords(
         {
            items: [
               {label: 'A', labelHeight: 1},
               {label: 'Long', labelHeight: 1.4}
            ],
            position: 'top',
            fontSize: 1
         },
         [0, 200],
         [200, 0],
         10,
         5
      );

      assert.deepEqual(coords.elx, [0, 0]);
      assert.deepEqual(coords.ely, [0, 12.5]);
      assert.deepEqual(coords.eliw, [97.5, 97.5]);
      assert.deepEqual(coords.elh, [12.5, 16.5]);
      assert.equal(coords.lgw, 97.5);
      assert.equal(coords.lgh, 29);
   } finally {
      if (originalDocument === undefined) {
         delete globalThis.document;
      } else {
         globalThis.document = originalDocument;
      }
   }
});


test('lays out horizontal legend items in one aligned row', () => {
   const coords = getGroupLegendCoords(
      {
         items: [
            {label: 'A', labelHeight: 1},
            {label: 'Long', labelHeight: 1.4}
         ],
         position: 'top',
         orientation: 'horizontal',
         fontSize: 1
      },
      [0, 200],
      [200, 0],
      10,
      5
   );

   assert.deepEqual(coords.elx, [0, 67.5]);
   assert.deepEqual(coords.ely, [0, 0]);
   assert.deepEqual(coords.eliw, [67.5, 97.5]);
   assert.deepEqual(coords.elh, [16.5, 16.5]);
   assert.equal(coords.lgw, 165);
   assert.equal(coords.lgh, 16.5);
});


test('preserves conservative automatic tick spacing by default', () => {
   assert.deepEqual(Array.from(getAxisTicks(null, [0, 10], 4).v), [5]);
   assert.deepEqual(Array.from(getAxisTicks(null, [0, 10], 4, false).v), [5]);
});


test('honors rounded automatic tick spacing when requested', () => {
   assert.deepEqual(Array.from(getAxisTicks(null, [0, 10], 4, true).v), [2, 4, 6, 8]);
});


test('returns supplied ticks without requiring axis limits', () => {
   const ticks = [1, 2, 3];

   assert.equal(getAxisTicks(ticks, null, 4), ticks);
});


test('rejects missing automatic tick limits without throwing', () => {
   const messages = [];
   const originalConsoleError = console.error;
   console.error = message => messages.push(message);

   try {
      assert.equal(getAxisTicks(null, undefined, 4), undefined);
      assert.equal(getAxisTicks(null, null, 4), undefined);
   } finally {
      console.error = originalConsoleError;
   }

   assert.deepEqual(messages, [
      'getAxisTicks: provided axis limits are not valid.',
      'getAxisTicks: provided axis limits are not valid.'
   ]);
});


test('normalizes numeric-string and reversed automatic tick limits', () => {
   assert.deepEqual(Array.from(getAxisTicks(null, ['0', '10'], 4).v), [5]);
   assert.deepEqual(Array.from(getAxisTicks(null, [10, 0], 4).v), [5]);
});


test('rejects non-finite or constant automatic tick limits', () => {
   const messages = [];
   const originalConsoleError = console.error;
   console.error = message => messages.push(message);

   try {
      for (const limits of [[0, Infinity], [0, -Infinity], [NaN, 10], [1, 1]]) {
         assert.equal(getAxisTicks(null, limits, 4), undefined);
      }
   } finally {
      console.error = originalConsoleError;
   }

   assert.deepEqual(
      messages,
      Array(4).fill('getAxisTicks: provided axis limits are not valid.')
   );
});


test('accepts a numeric string for the maximum tick count', () => {
   assert.deepEqual(Array.from(getAxisTicks(null, [0, 10], '4').v), [5]);
});


test('rejects invalid maximum tick counts', () => {
   const messages = [];
   const originalConsoleError = console.error;
   console.error = message => messages.push(message);

   try {
      for (const maxTickNum of [undefined, 0, -1, 1.5, NaN, Infinity]) {
         assert.equal(getAxisTicks(null, [0, 10], maxTickNum), undefined);
      }
   } finally {
      console.error = originalConsoleError;
   }

   assert.deepEqual(
      messages,
      Array(6).fill('getAxisTicks: parameter "maxTickNum" must be a finite positive whole number.')
   );
});


test('accepts a numeric string for the automatic tick margin', () => {
   assert.deepEqual(
      Array.from(getAxisTicks(null, [0, 10], 4, false, false, '0.1').v),
      [2, 4, 6, 8]
   );
});


test('rejects invalid automatic tick margins', () => {
   const messages = [];
   const originalConsoleError = console.error;
   console.error = message => messages.push(message);

   try {
      for (const deltaFactor of [NaN, Infinity, -0.01, 0.5, 1, 'invalid']) {
         assert.equal(getAxisTicks(null, [0, 10], 4, false, false, deltaFactor), undefined);
      }
   } finally {
      console.error = originalConsoleError;
   }

   assert.deepEqual(
      messages,
      Array(6).fill('getAxisTicks: parameter "deltaFactor" must be a finite number from 0 up to, but not including, 0.5.')
   );
});


test('normalizes supported line types and numeric strings', () => {
   assert.equal(normalizeLineType(1, 'Test'), 1);
   assert.equal(normalizeLineType('3', 'Test'), 3);
   assert.equal(normalizeLineType(4, 'Test'), 4);
});


test('falls back to a solid line for invalid line types', () => {
   const messages = [];
   const originalConsoleError = console.error;
   console.error = (message) => messages.push(message);

   try {
      assert.equal(normalizeLineType(1.5, 'Test'), 1);
      assert.equal(normalizeLineType(9, 'Test'), 1);
      assert.equal(normalizeLineType('wrong', 'Test'), 1);
   } finally {
      console.error = originalConsoleError;
   }

   assert.deepEqual(messages, [
      'Test: parameter "lineType" must be a whole number from 1 to 4.',
      'Test: parameter "lineType" must be a whole number from 1 to 4.',
      'Test: parameter "lineType" must be a whole number from 1 to 4.'
   ]);
});


test('accepts finite floating-point coordinates and numeric strings', () => {
   const coordinates = checkCoords([1.5, '2.5', -3.75], 'Test');

   assert.deepEqual(Array.from(coordinates.v), [1.5, 2.5, -3.75]);
});


test('rejects non-finite coordinate values', () => {
   const messages = [];
   const originalConsoleError = console.error;
   console.error = (message) => messages.push(message);

   try {
      assert.equal(checkCoords([1, NaN], 'Test'), null);
      assert.equal(checkCoords([1, Infinity], 'Test'), null);
      assert.equal(checkCoords([1, -Infinity], 'Test'), null);
   } finally {
      console.error = originalConsoleError;
   }

   assert.deepEqual(messages, [
      'Test: coordinates must contain only finite numeric values.',
      'Test: coordinates must contain only finite numeric values.',
      'Test: coordinates must contain only finite numeric values.'
   ]);
});


test('rejects non-finite PNG export settings before accessing the DOM', () => {
   const messages = [];
   const originalConsoleError = console.error;
   console.error = (message) => messages.push(message);

   try {
      assert.equal(downloadPNG(null, 'plot', 'invalid', 8, 300), null);
      assert.equal(downloadPNG(null, 'plot', 8, Infinity, 300), null);
      assert.equal(downloadPNG(null, 'plot', 8, 8, NaN), null);
   } finally {
      console.error = originalConsoleError;
   }

   assert.deepEqual(messages, [
      'Parameter "width" must be a finite number between 1 and 30 (cm).',
      'Parameter "height" must be a finite number between 1 and 30 (cm).',
      'Parameter "res" must be a finite number between 50 and 1200 (ppi).'
   ]);
});


test('handles an unavailable Clipboard API without throwing', () => {
   const messages = [];
   const classes = new Set();
   const button = {
      textContent: 'Copy',
      classList: {
         add: value => classes.add(value),
         remove: value => classes.delete(value)
      }
   };
   const originalConsoleError = console.error;
   const originalSetTimeout = globalThis.setTimeout;
   console.error = error => messages.push(error);
   globalThis.setTimeout = callback => {
      callback();
      return 0;
   };

   try {
      assert.equal(copyToClipboard(button, null, 1200, 800), null);
   } finally {
      console.error = originalConsoleError;
      globalThis.setTimeout = originalSetTimeout;
   }

   assert.equal(messages.length, 1);
   assert.match(messages[0].message, /not supported/);
   assert.equal(button.textContent, 'Copy');
   assert.equal(classes.size, 0);
});
