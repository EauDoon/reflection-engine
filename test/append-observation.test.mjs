import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario } from '../support/cli.mjs';
import { exampleRun } from '../support/run.mjs';
import { reviewPlan } from '../lib/review.mjs';
import { planExperiment } from '../lib/experiment.mjs';

test('append-observation preserves input and binds explicit dates and stop outcomes to a new record', () => scenario(({ put, path, get, run }) => {
  const input = exampleRun(), review = reviewPlan(input);
  Object.assign(review.decisions[0], { decision: 'accept', note: 'Synthetic acceptance.', checked_sources: ['S1', 'S2'], counterevidence_checked: true });
  put('run.json', input); put('review.json', review); put('plan.json', planExperiment(input, review, 4));
  const entry = { version: 1, started: '2026-03-01', observation: { date: '2026-03-02', kind: 'observation', note: 'One synthetic session occurred.' }, outcome: null };
  put('entry.json', entry);
  const args = ['append-observation', path('run.json'), path('review.json'), path('plan.json'), path('entry.json'), path('observed.json')];
  run(args); run(args, 1);
  assert.equal(get('plan.json').started, null);
  assert.equal(get('observed.json').started, entry.started);
  assert.deepEqual(get('observed.json').observations, [entry.observation]);
  assert.deepEqual(get('observed.json').acceptance_review, review);
  entry.observation.kind = 'stop'; entry.observation.date = '2026-03-03';
  put('missing-outcome.json', entry);
  run(['append-observation', path('run.json'), path('review.json'), path('observed.json'), path('missing-outcome.json'), path('bad.json')], 1);
  entry.outcome = { reviewed: '2026-03-03', decision: 'stop', reason: 'The trial was unhelpful.', alternative: 'A schedule change may explain the result.' };
  put('stop.json', entry);
  run(['append-observation', path('run.json'), path('review.json'), path('observed.json'), path('stop.json'), path('stopped.json')]);
  assert.equal(get('stopped.json').decision, 'stop');
  run(['append-observation', path('run.json'), path('review.json'), path('stopped.json'), path('entry.json'), path('later.json')], 1);
}));

test('append-observation rejects changed start dates and withdrawn acceptance while allowing a stop', () => scenario(({ put, path, run }) => {
  const input = exampleRun(), review = reviewPlan(input);
  Object.assign(review.decisions[0], { decision: 'accept', note: 'Synthetic acceptance.', checked_sources: ['S1', 'S2'], counterevidence_checked: true });
  const plan = planExperiment(input, review, 4); plan.started = '2026-03-01';
  put('run.json', input); put('review.json', review); put('plan.json', plan);
  const entry = { version: 1, started: '2026-03-02', observation: { date: '2026-03-03', kind: 'observation', note: 'Synthetic observation.' }, outcome: null };
  put('entry.json', entry);
  const args = ['append-observation', path('run.json'), path('review.json'), path('plan.json'), path('entry.json'), path('new.json')];
  run(args, 1);
  entry.started = '2026-03-01'; put('entry.json', entry);
  review.decisions[0].decision = 'reject'; put('review.json', review); run(args, 1);
  entry.observation.kind = 'stop'; entry.outcome = { reviewed: '2026-03-03', decision: 'stop', reason: 'Acceptance withdrawn.', alternative: 'The interpretation may not fit.' };
  put('entry.json', entry); run(args);
}));
