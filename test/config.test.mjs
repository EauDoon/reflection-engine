import test from 'node:test';
import assert from 'node:assert/strict';
import { configure, DEFAULT_CONFIG } from '../lib/config.mjs';
import { readJSON } from '../lib/core.mjs';
const c = readJSON(new URL('../examples/synthetic-corpus.json',import.meta.url));
test('exclusions and inclusive date bounds filter actual corpus', () => {
  assert.deepEqual(configure(c,{...DEFAULT_CONFIG,from:'2026-01-12',to:'2026-02-03'}).corpus.sources.map(s=>s.id),['S1','S2']);
  assert.equal(configure(c,{...DEFAULT_CONFIG,exclude:['learning']}).corpus.sources.length,1);
  assert.equal(configure(c,{...DEFAULT_CONFIG,domains:['learning'],exclude:['learning']}).corpus.sources.length,0);
});
test('custom IDs are retained; conflicting configuration fails', () => {
  assert.deepEqual(configure(c,{...DEFAULT_CONFIG,mode:'custom',questions:[22,4]}).ids,[22,4]);
  assert.equal(configure(c,{...DEFAULT_CONFIG,mode:'full'}).ids.length,22);
  assert.throws(()=>configure(c,{...DEFAULT_CONFIG,questions:[4]}));
  assert.throws(()=>configure(c,{...DEFAULT_CONFIG,from:'2027-01-01',to:'2026-01-01'}));
});
