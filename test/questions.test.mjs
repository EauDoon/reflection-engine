import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario } from '../support/cli.mjs';

test('question catalog exposes all stable IDs and quick-mode choices without a corpus', () => scenario(({ run, path, get }) => {
  run(['questions', path('questions.json')]);
  const catalog = get('questions.json');
  assert.equal(catalog.questions.length, 22);
  assert.deepEqual(catalog.questions.map(q => q.id), Array.from({ length: 22 }, (_, i) => i + 1));
  assert.deepEqual(catalog.quick_ids, [4, 11, 17]);
  assert.ok(catalog.questions.every(q => q.text.trim()));
  run(['questions', path('questions.json')], 1);
}));
