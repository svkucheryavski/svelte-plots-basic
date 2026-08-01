import test from 'node:test';
import assert from 'node:assert/strict';

import { getcolmap } from '../src/methods.js';


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
