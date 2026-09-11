import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario } from '../support/cli.mjs';
import { exampleRun } from '../support/run.mjs';
import { reviewPlan } from '../lib/review.mjs';
import { planExperiment } from '../lib/experiment.mjs';

test('validate-experiment checks edited records without creating a summary or echoing observations', () => scenario(({ put, path, run }) => {
  const input = exampleRun(), review = reviewPlan(input);
  Object.assign(review.decisions[0], { decision: 'accept', note: 'Synthetic acceptance.', checked_sources: ['S1', 'S2'], counterevidence_checked: true });
  const experiment = planExperiment(input, review, 4);
  put('run.json', input); put('review.json', review); put('experiment.json', experiment);
  assert.match(run(['validate-experiment', path('run.json'), path('review.json'), path('experiment.json')]).stdout, /self-reported/);
  experiment.observations = [{ date: '2026-03-01', kind: 'observation', note: 'Private synthetic observation.' }];
  put('invalid.json', experiment);
  const result = run(['validate-experiment', path('run.json'), path('review.json'), path('invalid.json')], 1);
  assert.ok(!result.stderr.includes('Private synthetic observation.'));
  run(['validate-experiment', path('run.json'), path('review.json')], 1);
}));
