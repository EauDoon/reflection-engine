import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeCorpora } from '../lib/preparation.mjs';
import { readJSON } from '../lib/core.mjs';

test('merged sources keep their evidence text after an input corpus changes', () => {
  const corpus = readJSON(new URL('../examples/synthetic-corpus.json', import.meta.url));
  const left = { version: 1, sources: [structuredClone(corpus.sources[0])] };
  const right = { version: 1, sources: [structuredClone(corpus.sources[1])] };
  const original = left.sources[0].text;
  const merged = mergeCorpora([left, right]);
  left.sources[0].text = 'mutated secret';
  assert.equal(merged.sources[0].text, original);
  merged.sources[0].text = 'merge edit';
  assert.equal(left.sources[0].text, 'mutated secret');
});
