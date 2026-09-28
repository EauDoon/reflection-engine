import test from 'node:test';
import assert from 'node:assert/strict';
import { selectSources } from '../lib/preparation.mjs';
import { readJSON } from '../lib/core.mjs';

test('selected sources keep their evidence text after the input corpus changes', () => {
  const corpus = readJSON(new URL('../examples/synthetic-corpus.json', import.meta.url));
  const original = corpus.sources[0].text;
  const selected = selectSources(corpus, { version: 1, source_ids: ['S1'] });
  corpus.sources[0].text = 'mutated secret';
  assert.equal(selected.sources[0].text, original);
  selected.sources[0].text = 'selection edit';
  assert.equal(corpus.sources[0].text, 'mutated secret');
});
