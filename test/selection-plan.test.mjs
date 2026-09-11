import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario, corpus } from '../support/cli.mjs';

test('selection-plan derives editable IDs from an explicit corpus and respects configured exclusions', () => scenario(({ put, path, get, run }) => {
  put('corpus.json', corpus);
  run(['selection-plan', path('corpus.json'), path('selection.json')]);
  const plan = get('selection.json');
  assert.deepEqual(plan, { version: 1, source_ids: corpus.sources.map(s => s.id) });
  run(['select', path('corpus.json'), path('selection.json'), path('empty.json')]);
  assert.deepEqual(get('empty.json'), corpus);
  put('config.json', { version: 1, mode: 'quick', questions: [], domains: ['missing'], exclude: [], from: null, to: null, format: 'markdown' });
  run(['selection-plan', path('corpus.json'), path('filtered.json'), path('config.json')]);
  assert.deepEqual(get('filtered.json').source_ids, []);
  run(['selection-plan', path('corpus.json'), path('selection.json')], 1);
}));
