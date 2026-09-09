import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scenario, corpus } from '../support/cli.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';

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

test('preview explains omissions and predicts actual selected packet bytes', () => scenario(({ path, put, get, run }) => {
  put('corpus.json', corpus);
  put('config.json', { ...DEFAULT_CONFIG, mode: 'custom', questions: [17], from: '2026-02-01', format: 'json' });
  run(['preview', path('corpus.json'), path('preview.json'), path('config.json')]);
  run(['build', path('corpus.json'), path('packet.md'), path('config.json')]);
  const preview = get('preview.json');
  assert.deepEqual(preview.selected_ids, ['S2']); assert.deepEqual(preview.question_ids, [17]);
  assert.deepEqual(preview.omitted, [{ id: 'S1', reasons: ['before-from'] }, { id: 'S3', reasons: ['undated-in-window'] }]);
  assert.equal(preview.packet_bytes, readFileSync(path('packet.md')).length);
  assert.ok(!JSON.stringify(preview).includes(corpus.sources[0].text));
  put('none.json', { ...DEFAULT_CONFIG, exclude: ['learning', 'creative'] });
  run(['preview', path('corpus.json'), path('empty.json'), path('none.json')]);
  assert.ok(get('empty.json').warnings.includes('empty-selection'));
}));
