import test from 'node:test';
import assert from 'node:assert/strict';

import { checkCoords, downloadPNG, getcolmap, normalizeLineType } from '../src/methods.js';


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
