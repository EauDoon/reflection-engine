import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scenario } from '../support/cli.mjs';
import { exampleRun } from '../support/run.mjs';
import { reviewPlan } from '../lib/review.mjs';

test('accepted export omits unreviewed answers and source text while preserving uncertainty', () => scenario(({ put, path, run }) => {
  const input = exampleRun(), review = reviewPlan(input);
  put('run.json', input); put('pending.json', review);
  run(['export-accepted', path('run.json'), path('pending.json'), path('empty.md')]);
  assert.ok(!readFileSync(path('empty.md'), 'utf8').includes(input.report.answers[0].conclusion));
  Object.assign(review.decisions[0], { decision: 'accept', note: 'Synthetic check.', checked_sources: ['S1', 'S2'], counterevidence_checked: true });
  put('accepted.json', review);
  run(['export-accepted', path('run.json'), path('accepted.json'), path('accepted.md')]);
  const output = readFileSync(path('accepted.md'), 'utf8');
  for (const value of [input.report.answers[0].conclusion, input.report.answers[0].alternative, input.report.answers[0].counterevidence]) assert.ok(output.includes(value));
  for (const source of input.corpus.sources) assert.ok(!output.includes(source.text));
  assert.ok(!output.includes('"id": "S3"'));
  review.decisions[0].checked_sources = []; put('invalid.json', review);
  run(['export-accepted', path('run.json'), path('invalid.json'), path('bad.md')], 1);
}));
