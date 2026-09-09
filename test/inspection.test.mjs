import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario, corpus } from '../support/cli.mjs';

test('inspection flags repeated text and episode concentration without copying source text', () => scenario(({ path, put, get, run }) => {
  const input = structuredClone(corpus);
  input.sources[0].text = input.sources[1].text = 'SYNTHETIC_PRIVATE_MARKER';
  input.sources[1].episode = input.sources[0].episode;
  put('input.json', input);
  run(['inspect', path('input.json'), path('inspection.json')]);
  const result = get('inspection.json');
  assert.equal(result.source_count, 3); assert.equal(result.episode_count, 2);
  assert.deepEqual(result.duplicate_text_groups, [['S1', 'S2']]);
  assert.deepEqual(result.undated_ids, ['S3']);
  assert.ok(result.warnings.includes('repeated-text'));
  assert.ok(!JSON.stringify(result).includes('SYNTHETIC_PRIVATE_MARKER'));
  put('empty.json', { version: 1, sources: [] });
  run(['inspect', path('empty.json'), path('empty-inspection.json')]);
  assert.ok(get('empty-inspection.json').warnings.includes('empty-corpus'));
}));
