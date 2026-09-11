import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario } from '../support/cli.mjs';
import { exampleRun } from '../support/run.mjs';

test('evidence map links selected sources and independent episode counts without source or report prose', () => scenario(({ put, path, get, run }) => {
  const input = exampleRun(); put('run.json', input);
  run(['evidence-map', path('run.json'), path('map.json')]);
  const map = get('map.json');
  assert.equal(map.run_digest.length, 64);
  assert.deepEqual(map.uncited_source_ids, ['S3']);
  assert.deepEqual(map.answers[0].source_ids, ['S1', 'S2']);
  assert.equal(map.answers[0].episode_count, 2);
  assert.deepEqual(map.sources.find(s => s.id === 'S1').question_ids, [4]);
  assert.ok(!JSON.stringify(map).includes(input.corpus.sources[0].text));
  assert.ok(!JSON.stringify(map).includes(input.report.answers[0].conclusion));
  input.report.answers[0].evidence = ['missing']; put('bad.json', input);
  run(['evidence-map', path('bad.json'), path('bad-map.json')], 1);
}));
