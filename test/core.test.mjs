import test from 'node:test';
import assert from 'node:assert/strict';
import { readJSON, validateCorpus } from '../lib/core.mjs';
const corpus = () => readJSON(new URL('../examples/synthetic-corpus.json', import.meta.url));
test('empty and synthetic corpora validate', () => {
  validateCorpus({version:1,sources:[]}); validateCorpus(corpus());
});
test('invalid dates, IDs, fields and oversized source text fail', () => {
  for (const mutate of [c => c.sources.push(c.sources[0]), c => c.sources[0].date='2026-02-30', c => c.sources[0].id='../x', c => c.sources[0].text='x'.repeat(20001), c => c.sources[0].extra=true]) {
    const c = corpus(); mutate(c); assert.throws(() => validateCorpus(c));
  }
});
