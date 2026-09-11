import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario } from '../support/cli.mjs';
import { exampleRun } from '../support/run.mjs';

test('comparison details distinguish evidence edits, answer fields and configuration changes without prose', () => scenario(({ put, path, get, run }) => {
  const before = exampleRun(), after = structuredClone(before);
  after.corpus.sources[0].text = 'Revised synthetic source.';
  after.report.answers[0].alternative = 'Another synthetic explanation.';
  after.config.format = 'json';
  put('before.json', before); put('after.json', after);
  run(['compare-details', path('before.json'), path('after.json'), path('diff.json')]);
  const diff = get('diff.json');
  assert.deepEqual(diff.sources.changed, [{ id: 'S1', fields: ['text'] }]);
  assert.deepEqual(diff.answers.changed, [{ id: 4, fields: ['alternative'] }]);
  assert.deepEqual(diff.config_fields, ['format']);
  assert.notEqual(diff.before_digest, diff.after_digest);
  assert.ok(!JSON.stringify(diff).includes(after.corpus.sources[0].text));
  run(['compare-details', path('before.json'), path('before.json'), path('same.json')]);
  assert.deepEqual(get('same.json').sources.changed, []);
}));
