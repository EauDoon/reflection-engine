import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario, corpus } from '../support/cli.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';

test('draft reports cover only selected questions and sources without inventing answers', () => scenario(({ path, put, get, run }) => {
  put('corpus.json', corpus);
  put('config.json', { ...DEFAULT_CONFIG, mode: 'custom', questions: [17, 4], exclude: ['creative'] });
  run(['draft-report', path('corpus.json'), path('draft.json'), path('config.json')]);
  run(['validate-report', path('draft.json'), path('corpus.json'), path('config.json')]);
  const draft = get('draft.json');
  assert.deepEqual(draft.source_ids, ['S1', 'S2']);
  assert.deepEqual(draft.answers.map(answer => answer.id), [17, 4]);
  assert.ok(draft.answers.every(answer => answer.status === 'insufficient evidence' && answer.conclusion === '' && answer.evidence.length === 0));
  put('empty.json', { version: 1, sources: [] });
  put('full.json', { ...DEFAULT_CONFIG, mode: 'full' });
  run(['draft-report', path('empty.json'), path('full-draft.json'), path('full.json')]);
  run(['validate-report', path('full-draft.json'), path('empty.json'), path('full.json')]);
  assert.equal(get('full-draft.json').answers.length, 22);
}));
