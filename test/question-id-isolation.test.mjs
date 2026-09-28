import test from 'node:test';
import assert from 'node:assert/strict';
import { configure, DEFAULT_CONFIG } from '../lib/config.mjs';
import { readJSON } from '../lib/core.mjs';

test('custom question ids are not aliases of the caller configuration', () => {
  const corpus = readJSON(new URL('../examples/synthetic-corpus.json', import.meta.url));
  const questions = [22, 4];
  const selected = configure(corpus, { ...DEFAULT_CONFIG, mode: 'custom', questions });
  selected.ids.push(11);
  assert.deepEqual(questions, [22, 4]);
  questions.push(17);
  assert.deepEqual(selected.ids, [22, 4, 11]);
});
